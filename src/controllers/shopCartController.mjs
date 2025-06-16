import { pool } from '../database.mjs';

const shopCartController = {};

shopCartController.ensureCart = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM carrito WHERE usuario_id_us = ? AND es_carrito = 1',
    [userId]
  );
  if (rows.length > 0) return rows[0].id_carrito;

  const [result] = await pool.query(
    'INSERT INTO carrito (fec_carrito, es_carrito, usuario_id_us) VALUES (NOW(), 1, ?)',
    [userId]
  );
  return result.insertId;
};

shopCartController.addToCart = async (req, res) => {
  const { id_producto, cantidad, talla } = req.body;

  if (!req.session.usuario) {
    console.warn('⚠️ Sesión no encontrada al agregar al carrito');
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  const userId = req.session.usuario.id;

  console.log('🛒 Datos recibidos:', req.body);
  console.log('🧑‍🦱 Usuario en sesión:', req.session.usuario);

  try {
    const [varianteRows] = await pool.query(
      `SELECT id_var FROM variante_producto 
       INNER JOIN talla ON talla_id_talla = id_talla
       WHERE producto_id_producto = ? AND nom_talla = ?`,
      [id_producto, talla]
    );

    if (varianteRows.length === 0) {
      return res.status(400).json({ error: 'Variante no encontrada' });
    }

    const id_var = varianteRows[0].id_var;
    const carritoId = await shopCartController.ensureCart(userId);

    const [existe] = await pool.query(
      `SELECT * FROM producto_carrito 
       WHERE carrito_id_carrito = ? AND variante_producto_id_var = ?`,
      [carritoId, id_var]
    );

    // Obtener precio desde la variante
    const [precioRows] = await pool.query(
      `SELECT precio_var FROM variante_producto WHERE id_var = ?`,
      [id_var]
    );
    const precio = precioRows[0].precio_var;

    if (existe.length > 0) {
      await pool.query(
        `UPDATE producto_carrito 
         SET cantidad = cantidad + ?, precio = ? 
         WHERE carrito_id_carrito = ? AND variante_producto_id_var = ?`,
        [cantidad, precio, carritoId, id_var]
      );
    } else {
      await pool.query(
        `INSERT INTO producto_carrito 
        (cantidad, precio, carrito_id_carrito, producto_id_producto, variante_producto_id_var)
        VALUES (?, ?, ?, ?, ?)`,
        [cantidad, precio, carritoId, id_producto, id_var]
      );
    }

    res.status(200).json({ success: true, message: 'Producto agregado al carrito' });
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};



// Obtener tallas disponibles para un producto
shopCartController.getTallasPorProducto = async (req, res) => {
  const { id_producto } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT t.id_talla, t.nom_talla
       FROM variante_producto vp
       JOIN talla t ON vp.talla_id_talla = t.id_talla
       WHERE vp.producto_id_producto = ?`,
      [id_producto]
    );

    res.json(rows); // Devuelve array de tallas como JSON
  } catch (err) {
    console.error('Error obteniendo tallas:', err);
    res.status(500).json({ error: 'Error al obtener tallas' });
  }
};


export default shopCartController;
