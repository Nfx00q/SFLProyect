export function isAdmin(req, res, next) {
  const usuario = req.session.usuario;

  console.log('ROL DETECTADO:', req.session.usuario.rol);

  if (!usuario) {
    return manejarAccesoDenegado(req, res, 401, 'No autenticado');
  }

  if (usuario.rol !== 1) {
    return manejarAccesoDenegado(req, res, 403, 'Acceso denegado: Solo administradores');
  }

  next();
}

function manejarAccesoDenegado(req, res, status, mensaje) {
  if (req.headers.accept?.includes('application/json')) {
    return res.status(status).json({ error: mensaje });
  }

  if (status === 401) {
    return res.redirect('/login');
  }

  return res.redirect('/');
}
