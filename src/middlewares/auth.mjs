import { requireLogin } from '../middlewares/session.mjs';

export function isAdmin(req, res, next) {
  const usuario = req.session?.usuario;

  if (!usuario || usuario.rol !== 1) {
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(403).json({ redirect: '/', message: 'Acceso denegado' });
    }
    return res.redirect('/');
  }

  next();
}
