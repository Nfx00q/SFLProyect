import { pool } from '../database.mjs';

export function checkUserExists(req, res, next) {
  const usuario = req.session.usuario;

  if (!usuario) {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    return res.redirect('/login');
  }

  const userId = usuario.id;

  pool.query('SELECT id_us FROM usuario WHERE id_us = ?', [userId])
    .then(([rows]) => {
      if (rows.length === 0) {
        req.session.destroy(() => {
          if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(401).json({ error: 'Sesión inválida' });
          }
          res.redirect('/login');
        });
      } else {
        next();
      }
    })
    .catch(err => next(err));
}
