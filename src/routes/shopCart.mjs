import express from 'express';
import shopCartController from '../controllers/shopCartController.mjs';
import { checkUserExists } from '../middlewares/checkUserExists.mjs';
import { checkUsuarioActivo } from '../middlewares/checkUserActive.mjs';

const router = express.Router();

// 📌 Rutas públicas
router.get('/tallas/:id_producto', shopCartController.getTallasPorProducto);

// 📌 Rutas protegidas (requieren sesión activa)
router.get('/', checkUserExists, checkUsuarioActivo, shopCartController.mostrarCarrito);
router.get('/count', checkUserExists, checkUsuarioActivo, shopCartController.getCartCount);
router.get('/remove/:id_producto_carrito', shopCartController.removeFromCart);
router.get('/admin/vaciar/:id_usuario', checkUserExists, checkUsuarioActivo, shopCartController.vaciarCarrito);
router.get('/admin/eliminar/:id_usuario', checkUserExists, checkUsuarioActivo, shopCartController.eliminarCarrito);
router.get('/precio/:id_producto/:nom_talla', shopCartController.getPrecioPorTalla);

router.post('/add-to-cart', checkUserExists, checkUsuarioActivo, shopCartController.agregarAlCarrito);

export default router;
