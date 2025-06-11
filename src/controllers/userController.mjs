import { pool } from '../database.mjs';

export async function getUsers(req, res) {
  const [usuarios] = await pool.query(`
    SELECT u.*, r.nom_rol 
    FROM usuario u
    JOIN rol r ON u.rol_id_rol = r.id_rol
  `);
  res.render('admin/users', { data: usuarios });
}

export async function createUser(req, res) {
  const { nom_us, mail_us, pass_us, rol_id_rol } = req.body;
  await pool.query(
    'INSERT INTO usuario (nom_us, mail_us, pass_us, rol_id_rol) VALUES (?, ?, ?, ?)',
    [nom_us, mail_us, pass_us, rol_id_rol]
  );
  res.redirect('/admin/users');
}

export async function updateUser(req, res) {
  const { id } = req.params;
  const { nom_us, mail_us, rol_id_rol } = req.body;
  await pool.query(
    'UPDATE usuario SET nom_us = ?, mail_us = ?, rol_id_rol = ? WHERE id_us = ?',
    [nom_us, mail_us, rol_id_rol, id]
  );
  res.redirect('/admin/users');
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  await pool.query('DELETE FROM usuario WHERE id_us = ?', [id]);
  res.redirect('/admin/users');
}

export async function getUserDetail(req, res) {
  const { id } = req.params;

  try {
    const [[usuario]] = await pool.query('SELECT * FROM usuario WHERE id_us = ?', [id]);

    if (!usuario) {
      return res.status(404).send('Usuario no encontrado');
    }

    const [[rol]] = await pool.query('SELECT * FROM rol WHERE id_rol = ?', [usuario.rol_id_rol]);
    const [[direccion]] = await pool.query('SELECT * FROM direccion WHERE usuario_id_us = ?', [id]);
    const [carrito] = await pool.query('SELECT * FROM carrito WHERE usuario_id_us = ?', [id]);
    const [pedidos] = await pool.query('SELECT * FROM pedido WHERE usuario_id_us = ?', [id]);
    const [envios] = await pool.query(`
      SELECT e.*
      FROM envio e
      JOIN pedido p ON e.pedido_id_pedido = p.id_pedido
      WHERE p.usuario_id_us = ?
    `, [id]);

    res.render('admin/userDetails', {
      usuario,
      rol,
      direccion,
      carrito,
      pedidos,
      envios
    });
  } catch (error) {
    console.error('Error al obtener detalle de usuario:', error);
    res.status(500).send('Error interno del servidor');
  }
}
