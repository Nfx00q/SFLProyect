import * as paymentModel from '../models/paymentModel.mjs';

import mercadopago from 'mercadopago';
import 'dotenv/config';
import { pool } from '../database.mjs';

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

function generarCodigoSeguimiento() {
      const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numeros = Math.floor(Math.random() * 900000 + 100000); // 6 dígitos
      const letra = letras.charAt(Math.floor(Math.random() * letras.length));
      return `${letra}${numeros}`;
    }

export const checkout = async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }

  const userId = req.session.usuario.id;

  try {
    // 1. Obtener ID del carrito activo del usuario
    const [carritoRows] = await await paymentModel.getActiveCartIdByUserId(userId);

    if (carritoRows.length === 0) {
      return res.status(400).send('No hay carrito activo');
    }

    const carritoId = carritoRows[0].id_carrito;

    // 2. Obtener productos del carrito
    const [productos] = await pool.query(
      `SELECT pc.cantidad, vp.precio_var AS unit_price, p.nom_producto AS title
       FROM producto_carrito pc
       JOIN variante_producto vp ON pc.variante_producto_id_var = vp.id_var
       JOIN producto p ON vp.producto_id_producto = p.id_producto
       WHERE pc.carrito_id_carrito = ?`,
      [carritoId]
    );

    if (productos.length === 0) {
      return res.status(400).send('El carrito está vacío');
    }

    // 3. Mapear productos al formato de Mercado Pago
    const items = productos.map(prod => ({
      title: prod.title,
      quantity: prod.cantidad,
      unit_price: parseFloat(prod.unit_price),
      currency_id: 'CLP'
    }));

    // 4. Crear la preferencia
    const preference = {
      items,
      back_urls: {
        success: 'https://flayba123456demo.loca.lt/payment/success',
        failure: 'https://flayba123456demo.loca.lt/payment/failure',
        pending: 'https://flayba123456demo.loca.lt/payment/pending'
      },
      auto_return: "approved",
      external_reference: req.session.usuario?.id.toString()
    };

    const response = await mercadopago.preferences.create(preference);
    res.redirect(response.body.init_point);

  } catch (error) {
    console.error('❌ Error en checkout:', error);
    res.status(500).send('Error al crear la preferencia de pago');
  }
};

export const success = async (req, res) => {
  const userId = req.query.external_reference;

  if (!userId) {
    return res.status(400).send("❌ No se pudo identificar el usuario del pago.");
  }

  try {
    // Verificar carrito activo del usuario
    const [[carrito]] = await pool.query(
      'SELECT id_carrito FROM carrito WHERE usuario_id_us = ? AND es_carrito = 1',
      [userId]
    );

    if (!carrito) return res.send('🛒 Carrito vacío o inexistente.');

    const carritoId = carrito.id_carrito;

    // Obtener productos del carrito
    const [items] = await pool.query(
      `SELECT pc.*, vp.precio_var AS price, p.nom_producto AS name, pc.variante_producto_id_var
       FROM producto_carrito pc
       JOIN variante_producto vp ON pc.variante_producto_id_var = vp.id_var
       JOIN producto p ON vp.producto_id_producto = p.id_producto
       WHERE pc.carrito_id_carrito = ?`,
      [carritoId]
    );

    if (items.length === 0) return res.send('El carrito está vacío.');

    // Calcular total
    const total = items.reduce((sum, item) => sum + item.price * item.cantidad, 0);

    // Crear pedido
    const [pedidoResult] = await pool.query(
      `INSERT INTO pedido (usuario_id_us, fecha_pedido, total) VALUES (?, NOW(), ?)`,
      [userId, total]
    );
    const pedidoId = pedidoResult.insertId;

    // Insertar productos al pedido
    for (const item of items) {
      await pool.query(
        `INSERT INTO producto_pedido (pedido_id_pedido, variante_producto_id_var, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [pedidoId, item.variante_producto_id_var, item.cantidad, item.price]
      );
    }

    // Crear registro de envío
    const codigoSeguimiento = generarCodigoSeguimiento();

    await pool.query(
      `INSERT INTO envio (pedido_id_pedido, estado_envio, fecha_envio, num_segui)
      VALUES (?, 'pendiente', NOW(), ?)`,
      [pedidoId, codigoSeguimiento]
    );

    // Vaciar el carrito (desactivar)
    await pool.query(
      `UPDATE carrito SET es_carrito = 0 WHERE id_carrito = ?`,
      [carritoId]
    );

    res.render('success', { pedidoId, total, items });

  } catch (error) {
    console.error('❌ Error al procesar el pedido en /success:', error);
    res.status(500).send('Error al procesar el pedido');
  }
};

