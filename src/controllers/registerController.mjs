import { hashSync } from 'bcryptjs';
import logger from '../utils/logger.mjs';
import { pool } from '../database.mjs';

export function mostrarFormulario(req, res) {
  logger.info('Mostrando formulario de registro');
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
    pais
  } = req.body;

  logger.info(`Intentando registrar un nuevo usuario con correo: ${mail_us}`);

  // Validación de campos de dirección
  if (!calle || !ciudad || !region || !cod_postal || !pais) {
    logger.warn(`Fallo en el registro - Dirección incompleta para correo: ${mail_us}`);
    return res.render('register', { error: 'Por favor completa la dirección usando las sugerencias del mapa.' });
  }

  const pass_encriptada = hashSync(pass_us, 10);
  logger.info('Contraseña encriptada correctamente');

  try {
    logger.info(`Verificando si el correo ya existe: ${mail_us}`);
    const [results] = await pool.query('SELECT * FROM usuario WHERE mail_us = ?', [mail_us]);

    if (results.length > 0) {
      logger.warn(`Registro fallido: el correo ya está en uso - ${mail_us}`);
      return res.render('register', { error: 'El correo ya está registrado' });
    }

    logger.info('Correo disponible. Procediendo con la creación del usuario');

    const [result] = await pool.query('INSERT INTO usuario SET ?', {
      nom_us,
      mail_us,
      pass_us: pass_encriptada,
      rol_id_rol: 2,
      tel_us,
    });

    const userId = result.insertId;
    logger.info(`Usuario registrado con ID ${userId} y correo ${mail_us}`);

    const nuevaDireccion = {
      usuario_id_us: userId,
      calle,
      ciudad,
      region,
      cod_postal,
      pais,
    };

    logger.info(`Insertando dirección para usuario ID ${userId}`);
    await pool.query('INSERT INTO direccion SET ?', nuevaDireccion);
    logger.info('Dirección registrada correctamente');

    res.redirect('/login');
  } catch (err) {
    logger.error(`Error durante el registro del usuario ${mail_us}: ${err.message}`);
    return res.status(500).render('register', { error: 'Error interno del servidor' });
  }
}
