const bcrypt = require('bcryptjs');

exports.mostrarFormulario = (req, res) => {
  res.render('register');
};

exports.registrarUsuario = (req, res) => {
  const { nom_us, mail_us, pass_us, telefono, direccion } = req.body;

  const pass_encriptada = bcrypt.hashSync(pass_us, 10);

  req.getConnection((err, conn) => {
    if (err) return res.status(500).render('register', { error: 'Error de conexión' });

    conn.query('SELECT * FROM usuarios WHERE mail_us = ?', [mail_us], (err, results) => {
      if (results.length > 0) {
        return res.render('register', { error: 'El correo ya está registrado' });
      }

      const nuevoUsuario = {
        nom_us,
        mail_us,
        pass_us: pass_encriptada,
        telefono,
        direccion,
        rol_id_rol: 2
      };

      conn.query('INSERT INTO usuarios SET ?', nuevoUsuario, (err, result) => {
        if (err) return res.status(500).render('register', { error: 'Error al registrar usuario' });

        res.redirect('/login');
      });
    });
  });
};
