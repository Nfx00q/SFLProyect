import { pool } from '../database.mjs';

const variantController = {};

variantController.list = async (req, res) => {
  const { id } = req.params; // producto_id_producto

  try {
    const [producto] = await pool.query('SELECT * FROM producto WHERE id_producto = ?', [id]);
    const [variantes] = await pool.query(`
      SELECT v.*, t.nom_talla 
      FROM variante_producto v
      JOIN talla t ON v.talla_id_talla = t.id_talla
      WHERE v.producto_id_producto = ?
    `, [id]);

    const [tallas] = await pool.query('SELECT * FROM talla');

    res.render('admin/products/variants', {
      producto: producto[0],
      variantes,
      tallas
    });
  } catch (err) {
    res.json(err);
  }
};

variantController.create = async (req, res) => {
  const { producto_id, talla_id_talla, stock_var, precio_var } = req.body;
  const nuevaVariante = { producto_id_producto: producto_id, talla_id_talla, stock_var, precio_var };

  try {
    await pool.query('INSERT INTO variante_producto SET ?', nuevaVariante);
    res.redirect(`/admin/products/variants/${producto_id}`);
  } catch (err) {
    res.json(err);
  }
};

variantController.update = async (req, res) => {
  const { id_var } = req.params;
  const { producto_id, talla_id_talla, stock_var, precio_var } = req.body;

  try {
    await pool.query(
      'UPDATE variante_producto SET talla_id_talla = ?, stock_var = ?, precio_var = ? WHERE id_var = ?',
      [talla_id_talla, stock_var, precio_var, id_var]
    );
    res.redirect(`/admin/products/variants/${producto_id}`);
  } catch (err) {
    res.json(err);
  }
};

variantController.delete = async (req, res) => {
  const { id_var, producto_id } = req.params;

  try {
    await pool.query('DELETE FROM variante_producto WHERE id_var = ?', [id_var]);
    res.redirect(`/admin/products/variants/${producto_id}`);
  } catch (err) {
    res.json(err);
  }
};

export default variantController;
