import { compareSync } from 'bcryptjs';
import { pool } from '../database.mjs';
import logger from '../utils/logger.mjs';

export function getLoginPage(req, res) {
  res.render('login');
}

export async function login(req, res) {
  logger.info('Intentando iniciar sesión con correo: ' + req.body.mail_us);
  const { mail_us, pass_us } = req.body;

  try {
    const [results] = await pool.query('SELECT * FROM usuario WHERE mail_us = ?', [mail_us]);

    if (results.length === 0) {
      logger.warn('Correo no registrado, ingresó: ' + usuario.mail_us);
      return res.render('login', { error: 'Correo no registrado' });
    }

    const usuario = results[0];

    if (!compareSync(pass_us, usuario.pass_us)) {
      logger.error(`Contraseña incorrecta para el usuario: `+ usuario.mail_us);
      return res.render('login', { error: 'Contraseña incorrecta' });
    }

    req.session.usuario = {
      id: usuario.id_us,
      nombre: usuario.nom_us,
      correo: usuario.mail_us,
      rol: usuario.rol_id_rol,
    };

    logger.info(`Inicio de sesión exitoso para el usuario: ` + usuario.mail_us);
    if (usuario.rol_id_rol === 1) {
      // Redirige a dashboard admin
      return res.redirect('/admin');
    } else {
      // Redirige a la página principal normal
      return res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    logger.error('Error al consultar la base de datos:', err);
    res.status(500).send('Error al consultar la base de datos');
  }
}

export function logout(req, res) {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al cerrar sesión');
    }
    res.redirect('/login');
  });
}
