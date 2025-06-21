import mercadopago from 'mercadopago';
import 'dotenv/config';
import { pool } from '../database.mjs';

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

export const checkout = async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }

  const userId = req.session.usuario.id;

  try {
    // 1. Obtener ID del carrito activo del usuario
    const [carritoRows] = await pool.query(
      `SELECT id_carrito FROM carrito 
       WHERE usuario_id_us = ? AND es_carrito = 1`,
      [userId]
    );

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
        success: 'http://localhost:3000/payment/success',
        failure: 'http://localhost:3000/payment/failure',
        pending: 'http://localhost:3000/payment/pending'
      },
    };

    const response = await mercadopago.preferences.create(preference);
    res.redirect(response.body.init_point);

  } catch (error) {
    console.error('❌ Error en checkout:', error);
    res.status(500).send('Error al crear la preferencia de pago');
  }
};
