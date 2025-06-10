const productController = {};

productController.list = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  req.getConnection((err, conn) => {
    if (err) return res.json(err);

    // Primero obtenemos el total de productos
    conn.query('SELECT COUNT(*) AS total FROM producto', (err, countResult) => {
      if (err) return res.json(err);

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // Luego hacemos la consulta paginada
      conn.query(`
        SELECT p.*, i.url_img 
        FROM producto p
        LEFT JOIN imagen_producto i ON p.id_producto = i.producto_id_producto
        LIMIT ? OFFSET ?
      `, [limit, offset], (err, productos) => {
        if (err) return res.json(err);

        res.render('admin/products', {
          data: productos,
          currentPage: page,
          totalPages
        });
      });
    });
  });
};

productController.create = (req, res) => {
  console.log('BODY:', req.body);
  const { nom_producto, des_producto, precio_producto, categoria_id_categoria, url_img } = req.body;
  const nuevoProducto = { nom_producto, des_producto, precio_producto, categoria_id_categoria };

  req.getConnection((err, conn) => {
    if (err) return res.json(err);
    conn.query('INSERT INTO producto SET ?', nuevoProducto, (err, result) => {
      if (err) return res.json(err);

      // Opcional: si quieres guardar también la imagen en imagen_producto (si tienes esa tabla)
      if (url_img && url_img.trim() !== '') {
        const nuevoImg = { url_img, producto_id_producto: result.insertId };
        conn.query('INSERT INTO imagen_producto SET ?', nuevoImg, (err2) => {
          if (err2) return res.json(err2);
          return res.redirect('/admin/products');
        });
      } else {
        res.redirect('/admin/products');
      }
    });
  });
};

productController.update = (req, res) => {
  const id = req.params.id;
  const { nom_producto, des_producto, precio_producto, categoria_id_categoria, url_img } = req.body;

  const updatedProduct = { nom_producto, des_producto, precio_producto, categoria_id_categoria };

  req.getConnection((err, conn) => {
    if (err) return res.json(err);

    // 1. Actualiza el producto
    conn.query('UPDATE producto SET ? WHERE id_producto = ?', [updatedProduct, id], (err) => {
      if (err) return res.json(err);

      // 2. Manejo de imagen
      if (url_img && url_img.trim() !== '') {
        // Ver si ya existe una imagen para este producto
        conn.query('SELECT * FROM imagen_producto WHERE producto_id_producto = ?', [id], (err, results) => {
          if (err) return res.json(err);

          if (results.length > 0) {
            // Si ya hay imagen, actualizar
            conn.query('UPDATE imagen_producto SET url_img = ? WHERE producto_id_producto = ?', [url_img, id], (err2) => {
              if (err2) return res.json(err2);
              res.redirect('/admin/products');
            });
          } else {
            // Si no hay imagen, insertar nueva
            const nuevaImg = { url_img, producto_id_producto: id };
            conn.query('INSERT INTO imagen_producto SET ?', nuevaImg, (err2) => {
              if (err2) return res.json(err2);
              res.redirect('/admin/products');
            });
          }
        });
      } else {
        // Si se envió campo vacío, borrar imagen existente
        conn.query('DELETE FROM imagen_producto WHERE producto_id_producto = ?', [id], (err2) => {
          if (err2) return res.json(err2);
          res.redirect('/admin/products');
        });
      }
    });
  });
};

productController.delete = (req, res) => {
  const { id } = req.params;

  req.getConnection((err, conn) => {
    if (err) return res.json(err);

    // Primero eliminar imágenes asociadas (por integridad referencial)
    conn.query('DELETE FROM imagen_producto WHERE producto_id_producto = ?', [id], (errImg) => {
      if (errImg) return res.json(errImg);

      // Luego eliminar producto
      conn.query('DELETE FROM producto WHERE id_producto = ?', [id], (errProd) => {
        if (errProd) return res.json(errProd);
        res.redirect('/admin/products');
      });
    });
  });
};

module.exports = productController;
