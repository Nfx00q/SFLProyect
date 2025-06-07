const bcrypt = require('bcryptjs');

exports.getLoginPage = (req, res) => {
  res.render('login');
};

exports.login = (req, res) => {
  const { mail_us, pass_us } = req.body;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error en la conexión a la base de datos');

    conn.query('SELECT * FROM usuario WHERE mail_us = ?', [mail_us], (err, results) => {
      if (err) return res.status(500).send('Error al consultar la base de datos');
      if (results.length === 0) return res.render('login', { error: 'Correo no registrado' });

      const usuario = results[0];

      if (!bcrypt.compareSync(pass_us, usuario.pass_us)) {
        return res.render('login', { error: 'Contraseña incorrecta' });
      }

      req.session.usuario = {
        id: usuario.id_us,
        nombre: usuario.nom_us,
        correo: usuario.mail_us,
        rol: usuario.rol_id_rol
      };

      res.redirect('/');
    });
  });
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al cerrar sesión');
    }
    res.redirect('/login');
  });
};