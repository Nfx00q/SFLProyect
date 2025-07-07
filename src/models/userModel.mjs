// Modelo para user
import { pool } from '../database.mjs';

// Aquí irán las funciones relacionadas a user

export async function getAllUsersWithRoleAndState() {
  const [rows] = await pool.query(`
    SELECT u.*, r.nom_rol, e.nom_est 
    FROM usuario u
    JOIN rol r ON u.rol_id_rol = r.id_rol
    JOIN estado_usuario e ON u.id_est = e.id_est
  `);
  return rows;
}

export async function getAllRoles() {
  const [rows] = await pool.query('SELECT * FROM rol');
  return rows;
}

export async function getAllUserStates() {
  const [rows] = await pool.query('SELECT * FROM estado_usuario');
  return rows;
}


export async function createUser({ nom_us, mail_us, pass_us, rol_id_rol, id_est }) {
  const [result] = await pool.query(
    'INSERT INTO usuario (nom_us, mail_us, pass_us, rol_id_rol, id_est) VALUES (?, ?, ?, ?, ?)',
    [nom_us, mail_us, pass_us, rol_id_rol, id_est]
  );
  return result;
}

export async function getUserById(id) {
  const [rows] = await pool.query('SELECT * FROM usuario WHERE id_us = ?', [id]);
  return rows[0]; // Devuelve solo el usuario encontrado
}

export async function updateUserWithPassword({ nom_us, mail_us, pass_us, rol_id_rol, id_est, id }) {
  const [result] = await pool.query(
    'UPDATE usuario SET nom_us = ?, mail_us = ?, pass_us = ?, rol_id_rol = ?, id_est = ? WHERE id_us = ?',
    [nom_us, mail_us, pass_us, rol_id_rol, id_est, id]
  );
  return result;
}

export async function updateUser({ nom_us, mail_us, rol_id_rol, id_est, id }) {
  const [result] = await pool.query(
    'UPDATE usuario SET nom_us = ?, mail_us = ?, rol_id_rol = ?, id_est = ? WHERE id_us = ?',
    [nom_us, mail_us, rol_id_rol, id_est, id]
  );
  return result;
}

export async function deleteUser(id) {
  const [result] = await pool.query('DELETE FROM usuario WHERE id_us = ?', [id]);
  return result;
}
