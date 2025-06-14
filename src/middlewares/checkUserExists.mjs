import {pool} from '../database.mjs';

export function checkUserExists(req, res, next) {
  if (!req.session.user) return next(); // sin sesión

  const userId = req.session.user.id_us;

  pool.query('SELECT id_us FROM usuario WHERE id_us = ?', [userId])
    .then(([rows]) => {
      if (rows.length === 0) {
        req.session.destroy(() => {
          res.redirect('/login'); // o página de sesión expirada
        });
      } else {
        next();
      }
    })
    .catch(err => next(err));
}