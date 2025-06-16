import { pool } from '../database.mjs';

export async function checkUsuarioActivo(req, res, next) {
  const usuario = req.session.usuario;

  // Si no hay sesión, manejar según tipo de respuesta esperada
  if (!usuario) {
    return manejarNoAutenticado(req, res, 'Usuario no autenticado');
  }

  try {
    const [rows] = await pool.query(
      'SELECT id_us FROM usuario WHERE id_us = ?',
      [usuario.id]
    );

    // Si el usuario no existe en la base de datos
    if (rows.length === 0) {
      req.session.destroy(() => {
        manejarNoAutenticado(req, res, 'Usuario no encontrado');
      });
    } else {
      next(); // Usuario válido
    }
  } catch (error) {
    console.error('Error verificando usuario activo:', error);
    if (req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.status(500).send('Error interno del servidor');
  }
}

// Función auxiliar para manejar redirección o JSON
function manejarNoAutenticado(req, res, mensaje) {
  if (req.headers.accept?.includes('application/json')) {
    return res.status(401).json({ error: mensaje });
  } else {
    return res.redirect('/login');
  }
}
