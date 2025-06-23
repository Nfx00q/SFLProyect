import { pool } from '../database.mjs';

export async function getCatalogPage(req, res) {
  try {
    const sql = `
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
    `;

    const [rows] = await pool.query(sql);

    const categorias = {};

    rows.forEach(row => {
      if (!categorias[row.id_categoria]) {
        categorias[row.id_categoria] = {
          nombre: row.nom_categoria,
          productos: []
        };
      }

      if (row.id_producto) {
        categorias[row.id_categoria].productos.push({
          id_producto: row.id_producto,
          nombre: row.nombre,
          descripcion: row.descripcion,
          precio: Number(row.precio),
          url_img: row.url_img || 'default.jpg' // imagen por defecto si no hay
        });
      }
    });

    res.render('catalog', { categorias });

  } catch (err) {
    console.error('❌ Error al cargar catálogo:', err);
    res.status(500).send('Error al cargar el catálogo');
  }
}
