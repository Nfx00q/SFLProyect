import express from 'express';
const router = express.Router();
import { mostrarFormulario, registrarUsuario } from '../controllers/registerController.mjs';

// Ruta para mostrar el formulario (GET /register)
router.get('/', mostrarFormulario);

// Ruta para procesar el registro (POST /register)
router.post('/', registrarUsuario);

export default router;
