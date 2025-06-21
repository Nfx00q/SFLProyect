import { pool } from '../database.mjs';

const shopCartController = {};

// Asegura que el usuario tenga un carrito activo, si no lo crea
shopCartController.ensureCart = async (userId) => {
  const [[carrito]] = await pool.query(
    'SELECT id_carrito FROM carrito WHERE usuario_id_us = ? AND es_carrito = 1',
    [userId]
  );

  if (carrito) return carrito.id_carrito;

  const [nuevo] = await pool.query(
    'INSERT INTO carrito (fec_carrito, es_carrito, usuario_id_us) VALUES (NOW(), 1, ?)',
    [userId]
  );

  return nuevo.insertId;
};

// Agrega un producto al carrito
shopCartController.agregarAlCarrito = async (req, res) => {
  const { id_producto, cantidad, talla } = req.body;
  const userId = req.session.usuario.id;

  try {
    const [[variante]] = await pool.query(
      `SELECT id_var, precio_var FROM variante_producto vp
       JOIN talla t ON vp.talla_id_talla = t.id_talla
       WHERE producto_id_producto = ? AND t.nom_talla = ?`,
      [id_producto, talla]
    );

    if (!variante) {
      return res.status(400).json({ success: false, message: 'Talla no disponible' });
    }

    const carritoId = await shopCartController.ensureCart(userId);

    const [[existente]] = await pool.query(
      `SELECT id FROM producto_carrito
       WHERE carrito_id_carrito = ? AND variante_producto_id_var = ?`,
      [carritoId, variante.id_var]
    );

    if (existente) {
      await pool.query(
        `UPDATE producto_carrito 
         SET cantidad = cantidad + ?, precio = ? 
         WHERE id = ?`,
        [cantidad, variante.precio_var, existente.id]
      );
    } else {
      await pool.query(
        `INSERT INTO producto_carrito 
        (cantidad, precio, carrito_id_carrito, producto_id_producto, variante_producto_id_var)
        VALUES (?, ?, ?, ?, ?)`,
        [cantidad, variante.precio_var, carritoId, id_producto, variante.id_var]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error al agregar al carrito:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Devuelve la cantidad de productos en el carrito del usuario
shopCartController.getCartCount = async (req, res) => {
  const userId = req.session.usuario.id;

  try {
    const [[carrito]] = await pool.query(
      'SELECT id_carrito FROM carrito WHERE usuario_id_us = ? AND es_carrito = 1',
      [userId]
    );

    if (!carrito) return res.json({ count: 0 });

    const [[suma]] = await pool.query(
      'SELECT SUM(cantidad) AS total FROM producto_carrito WHERE carrito_id_carrito = ?',
      [carrito.id_carrito]
    );

    res.json({ count: suma.total || 0 });
  } catch (err) {
    console.error('❌ Error al obtener el conteo:', err);
    res.json({ count: 0 });
  }
};

// Devuelve las tallas disponibles para un producto
shopCartController.getTallasPorProducto = async (req, res) => {
  const { id_producto } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT t.id_talla, t.nom_talla
       FROM variante_producto vp
       JOIN talla t ON vp.talla_id_talla = t.id_talla
       WHERE vp.producto_id_producto = ?`,
      [id_producto]
    );

    res.json(rows);
  } catch (err) {
    console.error('❌ Error obteniendo tallas:', err);
    res.status(500).json({ error: 'Error al obtener tallas' });
  }
};

// Muestra el carrito en la vista
shopCartController.mostrarCarrito = async (req, res) => {
  const userId = req.session.usuario.id;

  try {
    const [[carrito]] = await pool.query(
      'SELECT id_carrito FROM carrito WHERE usuario_id_us = ? AND es_carrito = 1',
      [userId]
    );

    if (!carrito) return res.render('cart', { carrito: [] });

    const [productos] = await pool.query(
      `SELECT pc.id AS id_producto_carrito, pc.cantidad, pc.precio,
              p.nom_producto, t.nom_talla
       FROM producto_carrito pc
       JOIN variante_producto vp ON pc.variante_producto_id_var = vp.id_var
       JOIN producto p ON vp.producto_id_producto = p.id_producto
       JOIN talla t ON vp.talla_id_talla = t.id_talla
       WHERE pc.carrito_id_carrito = ?`,
      [carrito.id_carrito]
    );

    res.render('cart', { carrito: productos });
  } catch (error) {
    console.error('❌ Error al mostrar el carrito:', error);
    res.status(500).send('Error interno del servidor');
  }
};

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

// Vacía todo el carrito de un usuario
shopCartController.vaciarCarrito = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const [[carrito]] = await pool.query(
      'SELECT id_carrito FROM carrito WHERE usuario_id_us = ? AND es_carrito = 1',
      [id_usuario]
    );

    if (carrito) {
      await pool.query('DELETE FROM producto_carrito WHERE carrito_id_carrito = ?', [carrito.id_carrito]);
    }

    res.redirect(`/admin/users/detail/${id_usuario}`);
  } catch (err) {
    console.error('❌ Error al vaciar carrito:', err);
    res.status(500).send('Error al vaciar carrito');
  }
};

// Elimina el carrito completo (registro y productos)
shopCartController.eliminarCarrito = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const [[carrito]] = await pool.query(
      'SELECT id_carrito FROM carrito WHERE usuario_id_us = ? AND es_carrito = 1',
      [id_usuario]
    );

    if (carrito) {
      await pool.query('DELETE FROM producto_carrito WHERE carrito_id_carrito = ?', [carrito.id_carrito]);
      await pool.query('DELETE FROM carrito WHERE id_carrito = ?', [carrito.id_carrito]);
    }

    res.redirect(`/admin/users/detail/${id_usuario}`);
  } catch (err) {
    console.error('❌ Error al eliminar carrito:', err);
    res.status(500).send('Error al eliminar carrito');
  }
};

shopCartController.getPrecioPorTalla = async (req, res) => {
  const { id_producto, nom_talla } = req.params;

  try {
    const [[fila]] = await pool.query(
      `SELECT vp.precio_var
       FROM variante_producto vp
       JOIN talla t ON vp.talla_id_talla = t.id_talla
       WHERE vp.producto_id_producto = ? AND t.nom_talla = ?`,
      [id_producto, nom_talla]
    );

    if (!fila) {
      return res.status(404).json({ error: 'Precio no encontrado' });
    }

    res.json({ precio: fila.precio_var });
  } catch (err) {
    console.error('Error al obtener precio por talla:', err);
    res.status(500).json({ error: 'Error al obtener precio' });
  }
};


export default shopCartController;
