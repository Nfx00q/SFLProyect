import { pool } from '../database.mjs';

export async function getCatalogData() {
  const [rows] = await pool.query(`
    SELECT 
      c.id_categoria,
      c.nom_categoria,
      p.id_producto,
      p.nom_producto AS nombre,
      p.des_producto AS descripcion,
      p.precio_producto AS precio,
      i.url_img
    FROM categoria c
    LEFT JOIN producto p ON c.id_categoria = p.categoria_id_categoria
    LEFT JOIN imagen_producto i ON p.id_producto = i.producto_id_producto
    ORDER BY c.id_categoria, p.id_producto
  `);
  return rows;
} 
