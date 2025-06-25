// src/models/cartModel.mjs
import { pool } from '../database.mjs';

export async function getActiveCartByUserId(userId) {
  const [[cart]] = await pool.query(
    'SELECT id_carrito FROM carrito WHERE usuario_id_us = ? AND es_carrito = 1',
    [userId]
  );
  return cart;
}

export async function createCart(userId) {
  const [result] = await pool.query(
    'INSERT INTO carrito (fec_carrito, es_carrito, usuario_id_us) VALUES (NOW(), 1, ?)',
    [userId]
  );
  return result.insertId;
}

export async function getVariantByProductAndSize(id_producto, talla) {
  const [[variante]] = await pool.query(
    `SELECT id_var, precio_var FROM variante_producto vp
     JOIN talla t ON vp.talla_id_talla = t.id_talla
     WHERE producto_id_producto = ? AND t.nom_talla = ?`,
    [id_producto, talla]
  );
  return variante;
}

export async function getProductInCart(cartId, varianteId) {
  const [[existente]] = await pool.query(
    `SELECT id FROM producto_carrito
     WHERE carrito_id_carrito = ? AND variante_producto_id_var = ?`,
    [cartId, varianteId]
  );
  return existente;
}

export async function updateProductInCart(cantidad, precio, id) {
  const [result] = await pool.query(
    `UPDATE producto_carrito 
     SET cantidad = cantidad + ?, precio = ? 
     WHERE id = ?`,
    [cantidad, precio, id]
  );
  return result;
}

export async function addProductToCart(cartId, varianteId, cantidad, precio) {
  const [result] = await pool.query(
    `INSERT INTO producto_carrito 
     (carrito_id_carrito, variante_producto_id_var, cantidad, precio) 
     VALUES (?, ?, ?, ?)`,
    [cartId, varianteId, cantidad, precio]
  );
  return result;
}

export async function countProductsInCart(userId) {
  const [[result]] = await pool.query(
    `SELECT SUM(cantidad) AS total
     FROM producto_carrito pc
     JOIN carrito c ON pc.carrito_id_carrito = c.id_carrito
     WHERE c.usuario_id_us = ? AND c.es_carrito = 1`,
    [userId]
  );
  return result.total || 0;
}

export async function getSizesByProduct(id_producto) {
  const [rows] = await pool.query(
    `SELECT DISTINCT t.id_talla, t.nom_talla
     FROM variante_producto vp
     JOIN talla t ON vp.talla_id_talla = t.id_talla
     WHERE vp.producto_id_producto = ?`,
    [id_producto]
  );
  return rows;
}

export async function getCartProducts(carritoId) {
  const [productos] = await pool.query(
    `SELECT pc.*, vp.precio_var AS precio, p.nom_producto, t.nom_talla, ip.url_img
     FROM producto_carrito pc
     JOIN variante_producto vp ON pc.variante_producto_id_var = vp.id_var
     JOIN producto p ON vp.producto_id_producto = p.id_producto
     JOIN talla t ON vp.talla_id_talla = t.id_talla
     LEFT JOIN imagen_producto ip ON ip.producto_id_producto = p.id_producto
     WHERE pc.carrito_id_carrito = ?`,
    [carritoId]
  );
  return productos;
}

export async function removeProductFromCart(id_producto_carrito) {
  return await pool.query('DELETE FROM producto_carrito WHERE id = ?', [id_producto_carrito]);
}

export async function clearCart(id_usuario) {
  const [[carrito]] = await pool.query(
    'SELECT id_carrito FROM carrito WHERE usuario_id_us = ? AND es_carrito = 1',
    [id_usuario]
  );
  if (carrito) {
    await pool.query('DELETE FROM producto_carrito WHERE carrito_id_carrito = ?', [carrito.id_carrito]);
  }
}

export async function deleteCart(id_usuario) {
  const [[carrito]] = await pool.query(
    'SELECT id_carrito FROM carrito WHERE usuario_id_us = ? AND es_carrito = 1',
    [id_usuario]
  );
  if (carrito) {
    await pool.query('DELETE FROM producto_carrito WHERE carrito_id_carrito = ?', [carrito.id_carrito]);
    await pool.query('DELETE FROM carrito WHERE id_carrito = ?', [carrito.id_carrito]);
  }
}

export async function getPriceBySize(id_producto, nom_talla) {
  const [[fila]] = await pool.query(
    `SELECT vp.precio_var
     FROM variante_producto vp
     JOIN talla t ON vp.talla_id_talla = t.id_talla
     WHERE vp.producto_id_producto = ? AND t.nom_talla = ?`,
    [id_producto, nom_talla]
  );
  return fila?.precio_var;
}

export async function decreaseQuantity(id) {
  const [[producto]] = await pool.query(
    'SELECT cantidad FROM producto_carrito WHERE id = ?',
    [id]
  );
  if (producto && producto.cantidad > 1) {
    await pool.query('UPDATE producto_carrito SET cantidad = cantidad - 1 WHERE id = ?', [id]);
  } else {
    await pool.query('DELETE FROM producto_carrito WHERE id = ?', [id]);
  }
}

export async function increaseQuantity(id) {
  await pool.query('UPDATE producto_carrito SET cantidad = cantidad + 1 WHERE id = ?', [id]);
}
