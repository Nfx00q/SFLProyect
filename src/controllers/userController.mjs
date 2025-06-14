import { pool } from '../database.mjs';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';

export async function getUsers(req, res) {
  const [usuarios] = await pool.query(`
    SELECT u.*, r.nom_rol, e.nom_est 
    FROM usuario u
    JOIN rol r ON u.rol_id_rol = r.id_rol
    JOIN estado_usuario e ON u.id_est = e.id_est
  `);

  const [roles] = await pool.query('SELECT * FROM rol');
  const [estados] = await pool.query('SELECT * FROM estado_usuario');

  res.render('admin/users', { usuario: usuarios, roles, estados });
}


export async function createUser(req, res) {
  const { nom_us, mail_us, pass_us, rol_id_rol } = req.body;
  const hash = await bcrypt.hash(pass_us, 10);
  await pool.query(
    'INSERT INTO usuario (nom_us, mail_us, pass_us, rol_id_rol, id_est) VALUES (?, ?, ?, ?, ?)',
    [nom_us, mail_us, hash, rol_id_rol, 1]
  );
  res.redirect('/admin/users');
}

export async function updateUser(req, res) {
  const { id } = req.params;
  const { nom_us, mail_us, pass_us, rol_id_rol, id_est } = req.body;

  if (pass_us && pass_us.trim() !== '') {
    // Si envían contraseña nueva, la hasheamos y actualizamos con ella
    const hash = await bcrypt.hash(pass_us, 10);
    await pool.query(
      'UPDATE usuario SET nom_us = ?, mail_us = ?, pass_us = ?, rol_id_rol = ?, id_est = ? WHERE id_us = ?',
      [nom_us, mail_us, hash, rol_id_rol, id_est, id]
    );
  } else {
    // Si no envían contraseña, actualizamos solo los otros campos
    await pool.query(
      'UPDATE usuario SET nom_us = ?, mail_us = ?, rol_id_rol = ?, id_est = ? WHERE id_us = ?',
      [nom_us, mail_us, rol_id_rol, id_est, id]
    );
  }

  res.redirect('/admin/users');
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  const userId = req.session.usuario?.id; // asegúrate que es `usuario`, no `user`

  // No permitir eliminarse a uno mismo
  if (parseInt(id) === userId) {
    return res.status(403).send("No puedes eliminar tu propia cuenta");
  }

  try {
    await pool.query('DELETE FROM usuario WHERE id_us = ?', [id]);
    res.redirect('/admin/users');
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).send("Error al eliminar usuario");
  }
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

export const validateUser = [
  body('nom_us').isLength({ min: 2 }).withMessage('Nombre demasiado corto'),
  body('mail_us').isEmail().withMessage('Email inválido'),
  body('pass_us').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol_id_rol').isInt().withMessage('Rol inválido'),
];

export async function showCreateForm(req, res) {
  const [roles] = await pool.query('SELECT * FROM rol');
  const [estados] = await pool.query('SELECT * FROM estado_usuario');
  res.render('admin/userForm', { mode: 'create', roles, estados });
}

export async function showEditForm(req, res) {
  const { id } = req.params;
  const [usuarios] = await pool.query('SELECT * FROM usuario WHERE id_us = ?', [id]);
  const [roles] = await pool.query('SELECT * FROM rol');
  const [estados] = await pool.query('SELECT * FROM estado_usuario');

  if (usuarios.length === 0) return res.status(404).send('Usuario no encontrado');
  res.render('admin/userForm', { mode: 'edit', usuario: usuarios[0], roles, estados });
}


