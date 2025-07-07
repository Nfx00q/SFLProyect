import * as paymentModel from '../models/paymentModel.mjs';
import mercadopago from 'mercadopago';
import 'dotenv/config';
import { pool } from '../database.mjs';

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

// ✅ Código de seguimiento robusto
function generarCodigoSeguimiento() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeros = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
  const letra = letras[Math.floor(Math.random() * letras.length)];
  return `${letra}${numeros}`;
}

export const iniciarPago = async (req, res) => {
  if (!req.session.usuario) return res.redirect('/login');
  const userId = req.session.usuario.id;

  try {
    // 1. Obtener carrito activo
    const carrito = await paymentModel.getActiveCartIdByUserId(userId);
    if (!carrito) return res.status(400).send('No hay carrito activo');

    const carritoId = carrito.id_carrito;

    // 2. Obtener productos del carrito
    const productos = await paymentModel.getCartItemsForCheckout(carritoId);
    if (productos.length === 0) return res.status(400).send('El carrito está vacío');

    // 3. Mapear productos + despacho
    const despacho = 3000;

    const items = productos.map(prod => ({
      title: prod.title,
      quantity: prod.cantidad,
      unit_price: parseFloat(prod.unit_price),
      currency_id: 'CLP'
    }));

    // ✅ Agregar ítem de despacho como producto aparte
    items.push({
      title: 'Despacho',
      quantity: 1,
      unit_price: despacho,
      currency_id: 'CLP'
    });

    // 4. Crear preferencia Mercado Pago
    const preference = {
      items,
      back_urls: {
        success: 'https://flayba123456demo.loca.lt/payment/success',
        failure: 'https://flayba123456demo.loca.lt/payment/failure',
        pending: 'https://flayba123456demo.loca.lt/payment/pending'
      },
      auto_return: "approved",
      external_reference: String(userId)
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
  if (!userId) return res.status(400).send("No se pudo identificar al usuario del pago.");

  try {
    // 1. Obtener carrito activo
    const carrito = await paymentModel.getActiveCartIdByUserId(userId);
    if (!carrito) return res.send('No hay carrito activo');

    const carritoId = carrito.id_carrito;

    // 2. Obtener productos del carrito
    const [items] = await pool.query(`
      SELECT pc.*, vp.precio_var AS price, p.nom_producto AS name, pc.variante_producto_id_var
      FROM producto_carrito pc
      JOIN variante_producto vp ON pc.variante_producto_id_var = vp.id_var
      JOIN producto p ON vp.producto_id_producto = p.id_producto
      WHERE pc.carrito_id_carrito = ?`, [carritoId]);

    if (items.length === 0) return res.send('El carrito está vacío.');

    // 3. Calcular total + despacho
    const subtotal = items.reduce((sum, item) => sum + item.price * item.cantidad, 0);
    const costoDespacho = 3000;
    const totalConDespacho = subtotal + costoDespacho;

    // 4. Obtener dirección del usuario
    const [direccion] = await pool.query(`
      SELECT id_direccion FROM direccion
      WHERE usuario_id_us = ? LIMIT 1`, [userId]);

    const direccionId = direccion.length > 0 ? direccion[0].id_direccion : null;

    // 5. Crear pedido incluyendo dirección
    const pedidoId = await paymentModel.createOrder(userId, new Date(), totalConDespacho, direccionId);

    // 5. Agregar productos y descontar stock
    for (const item of items) {
      await paymentModel.addProductToOrder(pedidoId, item.producto_id_producto, item.cantidad, item.price);
      await pool.query(
        `UPDATE variante_producto SET stock_var = stock_var - ? WHERE id_var = ?`,
        [item.cantidad, item.variante_producto_id_var]
      );
    }

    // 6. Crear envío con código de seguimiento
    const codigoSeguimiento = generarCodigoSeguimiento();
    await pool.query(`
      INSERT INTO envio (pedido_id_pedido, est_envio, num_segui, transp)
      VALUES (?, 'pendiente', ?, 'Por asignar')`,
      [pedidoId, codigoSeguimiento]);

    // 7. Vaciar carrito
    await paymentModel.clearCartById(carritoId);
    await pool.query(`UPDATE carrito SET es_carrito = 0 WHERE id_carrito = ?`, [carritoId]);

    // 8. Mostrar vista de éxito
    res.render('success', {
      pedidoId,
      items,
      total: totalConDespacho,
      despacho: costoDespacho
    });

  } catch (error) {
    console.error('❌ Error al procesar el pedido:', error);
    res.status(500).send('Error al procesar el pedido');
  }
};

export const showCheckout = async (req, res) => {
  const userId = req.session.usuario.id;

  const carrito = await paymentModel.getActiveCartIdByUserId(userId);
  if (!carrito) return res.redirect('/cart');

  const carritoId = carrito.id_carrito;

  const [items] = await pool.query(`
    SELECT pc.*, vp.precio_var AS price, p.nom_producto AS name
    FROM producto_carrito pc
    JOIN variante_producto vp ON pc.variante_producto_id_var = vp.id_var
    JOIN producto p ON vp.producto_id_producto = p.id_producto
    WHERE pc.carrito_id_carrito = ?`, [carritoId]);

  const [direcciones] = await pool.query(`
    SELECT * FROM direccion WHERE usuario_id_us = ?`, [userId]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.cantidad, 0);
  const despacho = 3000;
  const total = subtotal + despacho;

  res.render('checkout', { items, subtotal, despacho, total, direcciones });
};

export const checkout = async (req, res) => {
  if (!req.session.usuario) return res.redirect('/login');

  const direccionId = req.body.direccion_id;
  if (!direccionId) return res.status(400).send("Debes seleccionar una dirección.");

  req.session.direccion_id = direccionId;

  return iniciarPago(req, res);
};

