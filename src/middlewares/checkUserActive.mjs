import { pool } from '../database.mjs';

export async function checkUsuarioActivo(req, res, next) {
  const usuario = req.session.usuario;

  // Si no hay sesión, redirige a login
  if (!usuario) {
    return res.redirect('/login');
  }

  try {
    const [rows] = await pool.query('SELECT id_us FROM usuario WHERE id_us = ?', [usuario.id]);

    // Si no se encontró el usuario en la DB, destruye sesión y redirige
    if (rows.length === 0) {
      req.session.destroy(() => res.redirect('/login'));
    } else {
      next(); // todo ok
    }
  } catch (error) {
    console.error('Error verificando usuario activo:', error);
    res.status(500).send('Error interno');
  }
}