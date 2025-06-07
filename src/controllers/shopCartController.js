const moment = require('moment');

exports.mostrarCarrito = (req, res) => {
  if (!req.session.cart) req.session.cart = [];

  const productos = req.session.cart;
  const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  res.render('cart', { productos, total });
};

exports.agregarAlCarrito = (req, res) => {
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
};

exports.eliminarDelCarrito = (req, res) => {
  const userId = req.session.userId;
  const { id_producto } = req.body;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error en la conexión');

    conn.query(
      'SELECT * FROM carrito WHERE usuario_id_us = ? AND es_carrito = "activo"',
      [userId],
      (err, result) => {
        if (err) return res.status(500).send("Error al buscar carrito.");
        if (!result.length) return res.redirect('/shop-cart');

        conn.query(
          'DELETE FROM producto_carrito WHERE id_carrito = ? AND id_producto = ?',
          [result[0].id_carrito, id_producto],
          (err) => {
            if (err) return res.status(500).send("Error al eliminar producto.");
            res.redirect('/shop-cart');
          }
        );
      }
    );
  });
};

exports.finalizarCompra = (req, res) => {
  const userId = req.session.userId;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error en la conexión');

    conn.query(
      'SELECT * FROM carrito WHERE usuario_id_us = ? AND es_carrito = "activo"',
      [userId],
      (err, result) => {
        if (err) return res.status(500).send("Error al buscar carrito.");
        if (!result.length) return res.redirect('/shop-cart');

        const id_carrito = result[0].id_carrito;
        const fecha = moment().format('YYYY-MM-DD HH:mm:ss');

        conn.query(
          'INSERT INTO pedido (fec_pedido, estado, usuario_id_us) VALUES (?, "pendiente", ?)',
          [fecha, userId],
          (err, insertResult) => {
            if (err) return res.status(500).send("Error al crear pedido.");

            const id_pedido = insertResult.insertId;

            conn.query(
              'SELECT * FROM producto_carrito WHERE id_carrito = ?',
              [id_carrito],
              (err, productos) => {
                if (err) return res.status(500).send("Error al obtener productos.");

                const insertPromises = productos.map(item =>
                  new Promise((resolve, reject) => {
                    conn.query(
                      'INSERT INTO producto_pedido (id_pedido, id_producto, cantidad) VALUES (?, ?, ?)',
                      [id_pedido, item.id_producto, item.cantidad],
                      (err) => {
                        if (err) reject(err);
                        else resolve();
                      }
                    );
                  })
                );

                Promise.all(insertPromises)
                  .then(() => {
                    conn.query(
                      'UPDATE carrito SET es_carrito = "finalizado" WHERE id_carrito = ?',
                      [id_carrito],
                      (err) => {
                        if (err) return res.status(500).send("Error al actualizar carrito.");

                        conn.query(
                          'DELETE FROM producto_carrito WHERE id_carrito = ?',
                          [id_carrito],
                          (err) => {
                            if (err) return res.status(500).send("Error al limpiar productos.");
                            res.redirect('/pedido/' + id_pedido);
                          }
                        );
                      }
                    );
                  })
                  .catch((err) => {
                    console.error(err);
                    res.status(500).send("Error al insertar productos.");
                  });
              }
            );
          }
        );
      }
    );
  });
};
