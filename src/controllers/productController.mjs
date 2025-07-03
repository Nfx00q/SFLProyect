// src/controllers/productController.mjs
import { pool } from '../database.mjs';
import * as productModel from '../models/productModel.mjs';

export async function list(req, res) {
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

    res.render('admin/products/products', {
      data: productos,
      currentPage: page,
      totalPages
    });
  } catch (err) {
    console.error('Error list:', err);
    res.status(500).send('Error al listar productos');
  }
}

export async function create(req, res) {
  const { nom_producto, des_producto, precio_producto, categoria_id_categoria, url_img, es_novedad } = req.body;

  const nuevoProducto = {
    nom_producto,
    descripcion: des_producto,
    precio_producto,
    categoria_id_categoria,
    es_novedad: es_novedad ? 1 : 0
  };

  try {
    const insertId = await productModel.createProduct(nuevoProducto);

    if (url_img?.trim()) {
      await pool.query('INSERT INTO imagen_producto SET ?', {
        url_img,
        producto_id_producto: insertId
      });
    }

    res.redirect('/admin/products');
  } catch (err) {
    console.error('Error create:', err);
    res.status(500).send('Error al crear producto');
  }
}

export async function update(req, res) {
  const id = req.params.id;
  const { nom_producto, des_producto, precio_producto, categoria_id_categoria, url_img, es_novedad } = req.body;

  const updatedProduct = {
    id,
    nom_producto,
    descripcion: des_producto,
    precio_producto,
    categoria_id_categoria,
    es_novedad: es_novedad ? 1 : 0
  };

  try {
    await productModel.updateProduct(updatedProduct);

    if (url_img?.trim()) {
      const [results] = await pool.query('SELECT * FROM imagen_producto WHERE producto_id_producto = ?', [id]);

      if (results.length > 0) {
        await pool.query('UPDATE imagen_producto SET url_img = ? WHERE producto_id_producto = ?', [url_img, id]);
      } else {
        await pool.query('INSERT INTO imagen_producto SET ?', { url_img, producto_id_producto: id });
      }
    } else {
      await pool.query('DELETE FROM imagen_producto WHERE producto_id_producto = ?', [id]);
    }

    res.redirect('/admin/products');
  } catch (err) {
    console.error('Error update:', err);
    res.status(500).send('Error al actualizar producto');
  }
}

export async function del(req, res) {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM imagen_producto WHERE producto_id_producto = ?', [id]);
    await productModel.deleteProduct(id);
    res.redirect('/admin/products');
  } catch (err) {
    console.error('Error delete:', err);
    res.status(500).send('Error al eliminar producto');
  }
}

// ======================== VARIANTES ========================

export async function listVariants(req, res) {
  const { id } = req.params;

  try {
    const producto = await productModel.getProductById(id);
    const [variantes] = await pool.query(`
      SELECT v.*, t.nom_talla 
      FROM variante_producto v
      JOIN talla t ON v.talla_id_talla = t.id_talla
      WHERE v.producto_id_producto = ?
    `, [id]);

    const [tallas] = await pool.query('SELECT * FROM talla');

    res.render('admin/products/variants', {
      producto,
      variantes,
      tallas
    });
  } catch (err) {
    console.error('Error listVariants:', err);
    res.status(500).send('Error al listar variantes');
  }
}

export async function createVariant(req, res) {
  const { producto_id, talla_id_talla, stock_var, precio_var } = req.body;
  const nuevaVariante = { producto_id_producto: producto_id, talla_id_talla, stock_var, precio_var };

  try {
    await pool.query('INSERT INTO variante_producto SET ?', nuevaVariante);
    res.redirect(`/admin/products/variants/${producto_id}`);
  } catch (err) {
    console.error('Error createVariant:', err);
    res.status(500).send('Error al crear variante');
  }
}

export async function updateVariant(req, res) {
  const { id_var } = req.params;
  const { producto_id, talla_id_talla, stock_var, precio_var } = req.body;

  try {
    await pool.query(
      'UPDATE variante_producto SET talla_id_talla = ?, stock_var = ?, precio_var = ? WHERE id_var = ?',
      [talla_id_talla, stock_var, precio_var, id_var]
    );
    res.redirect(`/admin/products/variants/${producto_id}`);
  } catch (err) {
    console.error('Error updateVariant:', err);
    res.status(500).send('Error al actualizar variante');
  }
}

export async function deleteVariant(req, res) {
  const { id_var, producto_id } = req.params;

  try {
    await pool.query('DELETE FROM variante_producto WHERE id_var = ?', [id_var]);
    res.redirect(`/admin/products/variants/${producto_id}`);
  } catch (err) {
    console.error('Error deleteVariant:', err);
    res.status(500).send('Error al eliminar variante');
  }
}
