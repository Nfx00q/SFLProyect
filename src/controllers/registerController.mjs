import { hashSync } from 'bcryptjs';
import logger from '../utils/logger.mjs';
import { pool } from '../database.mjs';

export function mostrarFormulario(req, res) {
  res.render('register');
}

export async function registrarUsuario(req, res) {
  const {
    nom_us,
    mail_us,
    pass_us,
    tel_us,
    calle,
    ciudad,
    region,
    cod_postal,
    pais,
  } = req.body;

  logger.info(`Intentando registrar un nuevo usuario con correo: ${mail_us}`);

  // Validación de dirección
  if (!calle || !ciudad || !region || !cod_postal || !pais) {
    logger.warn('Dirección incompleta proporcionada por el usuario');
    return res.render('register', { error: 'Por favor completa todos los campos de la dirección.' });
  }

  const pass_encriptada = hashSync(pass_us, 10);

  try {
    logger.info('Consultando si el correo ya está registrado');
    const [results] = await pool.query('SELECT * FROM usuario WHERE mail_us = ?', [mail_us]);

    if (results.length > 0) {
      logger.warn(`El correo ya está registrado: ${mail_us}`);
      return res.render('register', { error: 'El correo ya está registrado' });
    }

    // Insertar usuario
    const nuevoUsuario = {
      nom_us,
      mail_us,
      pass_us: pass_encriptada,
      rol_id_rol: 2,
      tel_us,
    };

    const [result] = await pool.query('INSERT INTO usuario SET ?', nuevoUsuario);
    const idUsuario = result.insertId;
    logger.info(`Usuario registrado con ID ${idUsuario} y correo ${mail_us}`);

    // Insertar dirección
    const nuevaDireccion = {
      usuario_id_us: idUsuario,
      calle,
      ciudad,
      region,
      cod_postal,
      pais,
    };

    await pool.query('INSERT INTO direccion SET ?', nuevaDireccion);
    logger.info(`Dirección registrada para usuario ID ${idUsuario}`);

    res.redirect('/login');
  } catch (err) {
    logger.error(`Error en el proceso de registro: ${err.message}`);
    return res.status(500).render('register', { error: 'Error interno del servidor' });
  }
}

