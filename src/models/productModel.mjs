import { pool } from '../database.mjs';

export async function getAllProducts() {
  const [rows] = await pool.query('SELECT * FROM producto');
  return rows;
}

export async function getProductById(id) {
  const [[product]] = await pool.query('SELECT * FROM producto WHERE id_producto = ?', [id]);
  return product;
}

export async function getAllProductsPaginated(limit, offset) {
  const [rows] = await pool.query('SELECT * FROM producto LIMIT ? OFFSET ?', [limit, offset]);
  return rows;
}

export async function getProductCount() {
  const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM producto');
  return count;
}

export async function createProduct({ nom_producto, descripcion, precio_producto, categoria_id_categoria, es_novedad }) {
  const [result] = await pool.query(
    `INSERT INTO producto (nom_producto, descripcion, precio_producto, categoria_id_categoria, es_novedad)
     VALUES (?, ?, ?, ?, ?)`,
    [nom_producto, descripcion, precio_producto, categoria_id_categoria, es_novedad]
  );
  return result.insertId;
}

export async function updateProduct({ nom_producto, descripcion, precio_producto, categoria_id_categoria, es_novedad, id }) {
  const [result] = await pool.query(
    `UPDATE producto
     SET nom_producto = ?, descripcion = ?, precio_producto = ?, categoria_id_categoria = ?, es_novedad = ?
     WHERE id_producto = ?`,
    [nom_producto, descripcion, precio_producto, categoria_id_categoria, es_novedad, id]
  );
  return result;
}

export async function deleteProduct(id) {
  const [result] = await pool.query('DELETE FROM producto WHERE id_producto = ?', [id]);
  return result;
}

export async function getVariantsByProductId(id_producto) {
  const [rows] = await pool.query(
    `SELECT vp.*, t.nom_talla FROM variante_producto vp
     JOIN talla t ON vp.talla_id_talla = t.id_talla
     WHERE vp.producto_id_producto = ?`,
    [id_producto]
  );
  return rows;
}

export async function createVariant({ producto_id_producto, talla_id_talla, precio_var, stock_var }) {
  const [result] = await pool.query(
    'INSERT INTO variante_producto (producto_id_producto, talla_id_talla, precio_var, stock_var) VALUES (?, ?, ?, ?)',
    [producto_id_producto, talla_id_talla, precio_var, stock_var]
  );
  return result.insertId;
}

export async function getCatalogWithFilters(sql) {
  const [rows] = await pool.query(sql);
  return rows;
}

export async function getNovedades(limit = 8) {
  const [rows] = await pool.query(`
    SELECT p.*, i.url_img
    FROM producto p
    LEFT JOIN imagen_producto i ON p.id_producto = i.producto_id_producto
    WHERE p.es_novedad = 1
    ORDER BY p.fecha_agregado DESC
    LIMIT ?
  `, [limit]);
  return rows;
}
