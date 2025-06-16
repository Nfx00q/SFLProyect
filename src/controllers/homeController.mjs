import { pool } from '../database.mjs'; // asegúrate de importar el pool

async function getHomePage(req, res) {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(`
      SELECT 
        c.id_categoria, c.nom_categoria,
        p.id_producto, p.nom_producto, p.des_producto, p.precio_producto,
        i.url_img
      FROM categoria c
      LEFT JOIN producto p ON c.id_categoria = p.categoria_id_categoria
      LEFT JOIN imagen_producto i ON p.id_producto = i.producto_id_producto
      ORDER BY c.id_categoria, p.id_producto
    `);
    conn.release();

    const categorias = {};
    rows.forEach((row) => {
      if (!categorias[row.id_categoria]) {
        categorias[row.id_categoria] = {
          nombre: row.nom_categoria,
          productos: [],
        };
      }
      if (row.nom_producto) {
        categorias[row.id_categoria].productos.push({
          id_producto: row.id_producto,
          nombre: row.nom_producto,
          descripcion: row.des_producto,
          precio: Number(row.precio_producto),
          url_img: row.url_img,
        });
      }
    });

    const carritoVacio = !req.session.cart || req.session.cart.length === 0;

    const [carrito] = await pool.query(`
      SELECT SUM(cantidad) AS total
      FROM producto_carrito pc
      JOIN carrito c ON pc.carrito_id_carrito = c.id_carrito
      WHERE c.usuario_id_us = ? AND c.es_carrito = 1
    `, [req.session.usuario?.id]);


    res.render("home", {
      categorias,
      carritoVacio,
      usuario: req.session.usuario || null,
      totalCarrito: carrito[0]?.total || 0
    });
  } catch (err) {
    console.error('Error en getHomePage:', err);
    res.status(500).send("Error al obtener datos de la base de datos");
  }
}

export default {
  getHomePage
};
