const bcrypt = require('bcryptjs');

exports.mostrarFormulario = (req, res) => {
  res.render('register');
};

exports.registrarUsuario = (req, res) => {
  const {
    nom_us,
    mail_us,
    pass_us,
    calle,
    ciudad,
    region,
    cod_postal,
    pais,
  } = req.body;

  const pass_encriptada = bcrypt.hashSync(pass_us, 10);

  req.getConnection((err, conn) => {
    if (err) return res.status(500).render('register', { error: 'Error de conexión' });

    conn.query('SELECT * FROM usuario WHERE mail_us = ?', [mail_us], (err, results) => {
      if (err) return res.status(500).render('register', { error: 'Error en la consulta' });

      if (results.length > 0) {
        return res.render('register', { error: 'El correo ya está registrado' });
      }

      // Insertar usuario
      const nuevoUsuario = {
        nom_us,
        mail_us,
        pass_us: pass_encriptada,
        rol_id_rol: 2,
      };

      conn.query('INSERT INTO usuario SET ?', nuevoUsuario, (err, result) => {
        if (err) return res.status(500).render('register', { error: 'Error al registrar usuario' });

        const idUsuario = result.insertId;

        // Insertar dirección con usuario_id_us FK
        const nuevaDireccion = {
          usuario_id_us: idUsuario,
          calle,
          ciudad,
          region,
          cod_postal,
          pais,
        };

        conn.query('INSERT INTO direccion SET ?', nuevaDireccion, (err) => {
          if (err) return res.status(500).render('register', { error: 'Error al registrar dirección' });

          res.redirect('/login');
        });
      });
    });
  });
};
