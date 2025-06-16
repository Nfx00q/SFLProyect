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

shopCartController.getCartCount = async (req, res) => {
  if (!req.session.usuario) {
    return res.json({ count: 0 });
  }

  try {
    const [carritoRows] = await pool.query(
      'SELECT id_carrito FROM carrito WHERE usuario_id_us = ? AND es_carrito = 1',
      [req.session.usuario.id]
    );

    if (carritoRows.length === 0) return res.json({ count: 0 });

    const carritoId = carritoRows[0].id_carrito;
    const [productos] = await pool.query(
      'SELECT SUM(cantidad) AS total FROM producto_carrito WHERE carrito_id_carrito = ?',
      [carritoId]
    );

    res.json({ count: productos[0].total || 0 });
  } catch (err) {
    console.error('Error al obtener conteo del carrito:', err);
    res.json({ count: 0 });
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

shopCartController.mostrarCarrito = async (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }

  const userId = req.session.usuario.id;

  try {
    const [carritoRows] = await pool.query(
      `SELECT id_carrito FROM carrito 
       WHERE usuario_id_us = ? AND es_carrito = 1`,
      [userId]
    );

    if (carritoRows.length === 0) {
      return res.render('cart', { carrito: [] });
    }

    const carritoId = carritoRows[0].id_carrito;

    const [productos] = await pool.query(
      `SELECT pc.*, vp.precio_var AS precio, p.nom_producto, t.nom_talla
       FROM producto_carrito pc
       JOIN variante_producto vp ON pc.variante_producto_id_var = vp.id_var
       JOIN producto p ON vp.producto_id_producto = p.id_producto
       JOIN talla t ON vp.talla_id_talla = t.id_talla
       WHERE pc.carrito_id_carrito = ?`,
      [carritoId]
    );

    res.render('cart', { carrito: productos });
  } catch (error) {
    console.error('Error al mostrar el carrito:', error);
    res.status(500).send('Error interno del servidor');
  }
};

// Eliminar un producto del carrito
shopCartController.removeFromCart = async (req, res) => {
  const { id_producto_carrito } = req.params;

  try {
    await pool.query('DELETE FROM producto_carrito WHERE id = ?', [id_producto_carrito]);
    res.redirect('/shop-cart');
  } catch (error) {
    console.error('❌ Error al eliminar producto del carrito:', error);
    res.status(500).send('Error interno del servidor');
  }
};

// Vaciar el carrito completo de un usuario
shopCartController.vaciarCarrito = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const [carritos] = await pool.query(
      'SELECT id_carrito FROM carrito WHERE usuario_id_us = ? AND es_carrito = 1',
      [id_usuario]
    );

    if (carritos.length > 0) {
      const carritoId = carritos[0].id_carrito;

      await pool.query('DELETE FROM producto_carrito WHERE carrito_id_carrito = ?', [carritoId]);
    }

    res.redirect(`/admin/users/detail/${id_usuario}`);
  } catch (err) {
    console.error('Error al vaciar carrito:', err);
    res.status(500).send('Error al vaciar carrito');
  }
};

// Eliminar el carrito completamente (carrito + productos)
shopCartController.eliminarCarrito = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const [carritos] = await pool.query(
      'SELECT id_carrito FROM carrito WHERE usuario_id_us = ? AND es_carrito = 1',
      [id_usuario]
    );

    if (carritos.length > 0) {
      const carritoId = carritos[0].id_carrito;

      await pool.query('DELETE FROM producto_carrito WHERE carrito_id_carrito = ?', [carritoId]);
      await pool.query('DELETE FROM carrito WHERE id_carrito = ?', [carritoId]);
    }

    res.redirect(`/admin/users/detail/${id_usuario}`);
  } catch (err) {
    console.error('Error al eliminar carrito:', err);
    res.status(500).send('Error al eliminar carrito');
  }
};



export default shopCartController;
