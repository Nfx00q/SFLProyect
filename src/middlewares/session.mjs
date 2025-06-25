export function requireLogin(req, res, next) {
  const usuario = req.session?.usuario;

  if (!usuario) {
    const wantsJSON = req.headers.accept?.includes('application/json') || req.headers['x-requested-with'] === 'XMLHttpRequest';

    if (wantsJSON || req.method === 'POST') {
      return res.status(401).json({
        redirect: '/register',
        message: 'Debes iniciar sesión para agregar productos al carrito.'
      });
    }

    return res.redirect('/login');
  }

  next();
}


function manejarNoAutenticado(req, res, mensaje) {
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(401).json({ redirect: '/login', message: mensaje });
  } else {
    return res.redirect('/login');
  }
}
