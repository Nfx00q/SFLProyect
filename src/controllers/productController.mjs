import { pool } from '../database.mjs';

const productController = {};

productController.list = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const [countResult] = await pool.query('SELECT COUNT(*) AS total FROM producto');
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    const [productos] = await pool.query(`
      SELECT p.*, i.url_img 
      FROM producto p
      LEFT JOIN imagen_producto i ON p.id_producto = i.producto_id_producto
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.render('admin/products', {
      data: productos,
      currentPage: page,
      totalPages
    });
  } catch (err) {
    res.json(err);
  }
};

productController.create = async (req, res) => {
  const { nom_producto, des_producto, precio_producto, categoria_id_categoria, url_img } = req.body;
  const nuevoProducto = { nom_producto, des_producto, precio_producto, categoria_id_categoria };

  try {
    const [result] = await pool.query('INSERT INTO producto SET ?', nuevoProducto);

    if (url_img && url_img.trim() !== '') {
      const nuevoImg = { url_img, producto_id_producto: result.insertId };
      await pool.query('INSERT INTO imagen_producto SET ?', nuevoImg);
    }

    res.redirect('/admin/products');
  } catch (err) {
    res.json(err);
  }
};

productController.update = async (req, res) => {
  const id = req.params.id;
  const { nom_producto, des_producto, precio_producto, categoria_id_categoria, url_img } = req.body;
  const updatedProduct = { nom_producto, des_producto, precio_producto, categoria_id_categoria };

  try {
    await pool.query('UPDATE producto SET ? WHERE id_producto = ?', [updatedProduct, id]);

    if (url_img && url_img.trim() !== '') {
      const [results] = await pool.query('SELECT * FROM imagen_producto WHERE producto_id_producto = ?', [id]);

      if (results.length > 0) {
        await pool.query('UPDATE imagen_producto SET url_img = ? WHERE producto_id_producto = ?', [url_img, id]);
      } else {
        const nuevaImg = { url_img, producto_id_producto: id };
        await pool.query('INSERT INTO imagen_producto SET ?', nuevaImg);
      }
    } else {
      await pool.query('DELETE FROM imagen_producto WHERE producto_id_producto = ?', [id]);
    }

    res.redirect('/admin/products');
  } catch (err) {
    res.json(err);
  }
};

productController.delete = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM imagen_producto WHERE producto_id_producto = ?', [id]);
    await pool.query('DELETE FROM producto WHERE id_producto = ?', [id]);
    res.redirect('/admin/products');
  } catch (err) {
    res.json(err);
  }
};

export default productController;
