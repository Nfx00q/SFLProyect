import * as userModel from '../models/userModel.mjs';

import { pool } from '../database.mjs';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';

export async function getUsers(req, res) {
  const usuarios = await userModel.getAllUsersWithRoleAndState();
  const roles = await userModel.getAllRoles();
  const estados = await userModel.getAllUserStates();

  res.render('admin/users/users', { usuario: usuarios, roles, estados });
}

export async function createUser(req, res) {
  const { nom_us, mail_us, pass_us, rol_id_rol } = req.body;
  const hash = await bcrypt.hash(pass_us, 10);
  await await userModel.createUser({ nom_us, mail_us, pass_us: hash, rol_id_rol, id_est });
  res.redirect('/admin/users');
}

export async function updateUser(req, res) {
  const { id } = req.params;
  const { nom_us, mail_us, pass_us, rol_id_rol, id_est } = req.body;

  try {
    // Verificar si el usuario existe
    const [rows] = await await userModel.getUserById(id);
    if (rows.length === 0) {
      // Usuario no encontrado
      return res.status(404).render('admin/users/edit', {
        error: 'Usuario no encontrado',
        mode: 'edit',
        usuario: { id_us: id, nom_us, mail_us, rol_id_rol, id_est }, // mantener valores para que no se pierdan
        roles: await getRoles(),     // asume que tienes función para roles
        estados: await getEstados()  // asume que tienes función para estados
      });
    }

    if (pass_us && pass_us.trim() !== '') {
      const hash = await bcrypt.hash(pass_us, 10);
      const [result] = await await userModel.updateUserWithPassword({ nom_us, mail_us, pass_us: hash, rol_id_rol, id_est, id });

      if (result.affectedRows === 0) {
        return res.status(400).render('admin/users/edit', {
          error: 'No se pudo actualizar el usuario',
          mode: 'edit',
          usuario: { id_us: id, nom_us, mail_us, rol_id_rol, id_est },
          roles: await getRoles(),
          estados: await getEstados()
        });
      }
    } else {
      const [result] = await await userModel.updateUser({ nom_us, mail_us, rol_id_rol, id_est, id });

      if (result.affectedRows === 0) {
        return res.status(400).render('admin/users/edit', {
          error: 'No se pudo actualizar el usuario',
          mode: 'edit',
          usuario: { id_us: id, nom_us, mail_us, rol_id_rol, id_est },
          roles: await getRoles(),
          estados: await getEstados()
        });
      }
    }

    // Si todo fue bien, redirigimos
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    res.status(500).render('admin/users/edit', {
      error: 'Error del servidor',
      mode: 'edit',
      usuario: { id_us: id, nom_us, mail_us, rol_id_rol, id_est },
      roles: await getRoles(),
      estados: await getEstados()
    });
  }
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  const userId = req.session.usuario?.id; // asegúrate que es `usuario`, no `user`

  // No permitir eliminarse a uno mismo
  if (parseInt(id) === userId) {
    return res.status(403).send("No puedes eliminar tu propia cuenta");
  }

  try {
    await await userModel.deleteUser(id);
    res.redirect('/admin/users/users');
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).send("Error al eliminar usuario");
  }
}


export async function getUserDetail(req, res) {
  const { id } = req.params;

  try {
    const [[usuario]] = await await userModel.getUserById(id);

    if (!usuario) {
      return res.status(404).send('Usuario no encontrado');
    }

    const [[rol]] = await pool.query('SELECT * FROM rol WHERE id_rol = ?', [usuario.rol_id_rol]);
    const [[direccion]] = await pool.query('SELECT * FROM direccion WHERE usuario_id_us = ?', [id]);
    const [carrito] = await pool.query('SELECT * FROM carrito WHERE usuario_id_us = ?', [id]);
    const [pedidos] = await pool.query('SELECT * FROM pedido WHERE usuario_id_us = ?', [id]);
    const [envios] = await pool.query(`
      SELECT e.*
      FROM envio e
      JOIN pedido p ON e.pedido_id_pedido = p.id_pedido
      WHERE p.usuario_id_us = ?
    `, [id]);

    res.render('admin/users/userDetails', {
      usuario,
      rol,
      direccion,
      carrito,
      pedidos,
      envios
    });
  } catch (error) {
    console.error('Error al obtener detalle de usuario:', error);
    res.status(500).send('Error interno del servidor');
  }
}

export const validateUser = [
  body('nom_us').isLength({ min: 2 }).withMessage('Nombre demasiado corto'),
  body('mail_us').isEmail().withMessage('Email inválido'),
  body('pass_us').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol_id_rol').isInt().withMessage('Rol inválido'),
];

export async function showCreateForm(req, res) {
  const [roles] = await await userModel.getAllRoles();
  const [estados] = await await userModel.getAllUserStates();
  res.render('admin/users/userForm', { mode: 'create', roles, estados });
}

export async function showEditForm(req, res) {
  const { id } = req.params;
  const [usuarios] = await await userModel.getUserById(id);
  const [roles] = await await userModel.getAllRoles();
  const [estados] = await await userModel.getAllUserStates();

  if (usuarios.length === 0) return res.status(404).send('Usuario no encontrado');
  res.render('admin/users/userForm', { mode: 'edit', usuario: usuarios[0], roles, estados });
}

// --- Lógica fusionada desde loginController.mjs ---

import { compareSync } from 'bcrypt';
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
      logger.warn('Correo no registrado, ingresó: ' + mail_us);
      return res.render('login', { error: 'Correo no registrado' });
    }

    const usuario = results[0];

    if (!compareSync(pass_us, usuario.pass_us)) {
      logger.error(`Contraseña incorrecta para el usuario: `+ usuario.mail_us);
      return res.render('login', { error: 'Contraseña incorrecta' });
    }

    req.session.usuario = {
      id: usuario.id_us,
      nom: usuario.nom_us,
      mail: usuario.mail_us,
      rol: Number(usuario.rol_id_rol),
    };

    logger.info(`Inicio de sesión exitoso para el usuario: ` + usuario.mail_us);
    if (usuario.rol_id_rol === 1) {
      return res.redirect('/admin');
    } else {
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

// --- Lógica fusionada desde registerController.mjs ---

import { hashSync } from 'bcrypt';

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