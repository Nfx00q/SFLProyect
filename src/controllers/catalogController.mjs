import { pool } from '../database.mjs';

export async function getCatalogPage(req, res) {
  try {
    const sql = `
      SELECT c.id_categoria, c.nom_categoria, p.nom_producto, p.des_producto, p.precio_producto
      FROM categoria c
      LEFT JOIN producto p ON c.id_categoria = p.categoria_id_categoria
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
      if (row.nom_producto) {
        categorias[row.id_categoria].productos.push({
          nombre: row.nom_producto,
          descripcion: row.des_producto,
          precio: Number(row.precio_producto) // Convertir a número para evitar errores en la vista
        });
      }
    });

    res.render('catalog', { categorias });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error en la consulta SQL');
  }
}
