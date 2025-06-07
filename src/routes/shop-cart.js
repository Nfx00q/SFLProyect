const express = require('express');
const router = express.Router();
const shopCartController = require('../controllers/shopCartController');

function verificarSesion(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// Mostrar carrito (Solo si está iniciada la sesion)
router.get('/', verificarSesion, shopCartController.mostrarCarrito);


// Agregar al carrito
router.post('/agregar', shopCartController.agregarAlCarrito);

// Eliminar producto del carrito
router.post('/eliminar', shopCartController.eliminarDelCarrito);

// Finalizar compra
router.post('/finalizar', shopCartController.finalizarCompra);

module.exports = router;