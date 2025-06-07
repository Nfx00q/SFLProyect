const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');

router.get('/', registerController.mostrarFormulario);
router.post('/', registerController.registrarUsuario);

module.exports = router;
