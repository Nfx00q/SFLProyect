// Modelo para payment
import { pool } from '../database.mjs';

// Aquí irán las funciones relacionadas a payment

export async function getActiveCartIdByUserId(userId) {
  const [[cart]] = await pool.query(
    `SELECT id_carrito FROM carrito 
     WHERE usuario_id_us = ? AND es_carrito = 1`,
    [userId]
  );
  return cart;
}

export async function getCartItemsForCheckout(cartId) {
  const [items] = await pool.query(
    `SELECT pc.cantidad, vp.precio_var AS unit_price, p.nom_producto AS title
     FROM producto_carrito pc
     JOIN variante_producto vp ON pc.variante_producto_id_var = vp.id_var
     JOIN producto p ON vp.producto_id_producto = p.id_producto
     WHERE pc.carrito_id_carrito = ?`,
    [cartId]
  );
  return items;
}

export async function createOrder(userId, fecha, total) {
  const [result] = await pool.query(
    'INSERT INTO pedido (usuario_id_us, fecha_pedido, total) VALUES (?, ?, ?)',
    [userId, fecha, total]
  );
  return result.insertId;
}

export async function addProductToOrder(orderId, varianteId, cantidad, precio) {
  const [result] = await pool.query(
    `INSERT INTO producto_pedido (pedido_id_pedido, variante_producto_id_var, cantidad, precio)
     VALUES (?, ?, ?, ?)`,
    [orderId, varianteId, cantidad, precio]
  );
  return result;
}

export async function clearCartById(cartId) {
  const [result] = await pool.query(
    'DELETE FROM producto_carrito WHERE carrito_id_carrito = ?',
    [cartId]
  );
  return result;
}
