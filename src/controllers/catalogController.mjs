import { pool } from '../database.mjs';

export async function getCatalogPage(req, res) {
  try {
    const sql = `
      SELECT 
        c.id_categoria,
        c.nom_categoria,
        p.id_producto,
        p.nom_producto,
        p.des_producto,
        p.precio_producto,
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
      if (row.nom_producto) {
        categorias[row.id_categoria].productos.push({
          id_producto: row.id_producto,
          nombre: row.nom_producto,
          descripcion: row.des_producto,
          precio: Number(row.precio_producto),
          url_img: row.url_img // 👈 ahora sí pasas la imagen
        });
      }
    });

    res.render('catalog', { categorias });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error en la consulta SQL');
  }
}
