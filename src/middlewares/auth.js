exports.isAdmin = (req, res, next) => {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }

  if (req.session.usuario.rol !== 1) {
    return res.status(403).send('Acceso denegado: No eres administrador');
  }

  next();
};
