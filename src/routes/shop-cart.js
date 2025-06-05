const express = require('express');
const router = express.Router();

// Mostrar el carrito
router.get('/', (req, res) => {
  if (!req.session.cart) req.session.cart = [];

  const productos = req.session.cart;
  const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  res.render('cart', { productos, total });
});

// Agregar al carrito
router.post('/agregar', (req, res) => {
  const { id_producto, cantidad } = req.body;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error en la conexión');

    conn.query('SELECT * FROM productos WHERE id_producto = ?', [id_producto], (err, rows) => {
      if (err) return res.status(500).send('Error al consultar producto');

      if (rows.length === 0) return res.status(404).send('Producto no encontrado');

      const producto = rows[0];
      const cart = req.session.cart || [];

      const existente = cart.find(p => p.id_producto === producto.id_producto);
      if (existente) {
        existente.cantidad += parseInt(cantidad);
      } else {
        cart.push({
          id_producto: producto.id_producto,
          nom_producto: producto.nom_producto,
          precio: producto.precio,
          cantidad: parseInt(cantidad),
          url_imagen: producto.url_imagen
        });
      }

      req.session.cart = cart;
      res.redirect('/shop-cart');
    });
  });
});


// Eliminar producto del carrito
router.post('/eliminar', async (req, res) => {
  const userId = req.session.userId;
  const { id_producto } = req.body;

  try {
    const [carrito] = await db.query('SELECT * FROM carrito WHERE usuario_id_us = ? AND es_carrito = "activo"', [userId]);
    if (!carrito.length) return res.redirect('/shop-cart');

    await db.query(
      'DELETE FROM producto_carrito WHERE id_carrito = ? AND id_producto = ?',
      [carrito[0].id_carrito, id_producto]
    );

    res.redirect('/shop-cart');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al eliminar producto.");
  }
});

// Finalizar compra
router.post('/finalizar', async (req, res) => {
  const userId = req.session.userId;

  try {
    const [carrito] = await db.query('SELECT * FROM carrito WHERE usuario_id_us = ? AND es_carrito = "activo"', [userId]);
    if (!carrito.length) return res.redirect('/shop-cart');

    const id_carrito = carrito[0].id_carrito;

    // Crear pedido
    const fecha = moment().format('YYYY-MM-DD HH:mm:ss');
    const [result] = await db.query(
      'INSERT INTO pedido (fec_pedido, estado, usuario_id_us) VALUES (?, "pendiente", ?)',
      [fecha, userId]
    );

    const id_pedido = result.insertId;

    // Mover productos del carrito al pedido
    const [productos] = await db.query('SELECT * FROM producto_carrito WHERE id_carrito = ?', [id_carrito]);

    for (let item of productos) {
      await db.query(
        'INSERT INTO producto_pedido (id_pedido, id_producto, cantidad) VALUES (?, ?, ?)',
        [id_pedido, item.id_producto, item.cantidad]
      );
    }

    // Marcar carrito como finalizado y vaciarlo
    await db.query('UPDATE carrito SET es_carrito = "finalizado" WHERE id_carrito = ?', [id_carrito]);
    await db.query('DELETE FROM producto_carrito WHERE id_carrito = ?', [id_carrito]);

    res.redirect('/pedido/' + id_pedido);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al finalizar la compra.");
  }
});

module.exports = router;
