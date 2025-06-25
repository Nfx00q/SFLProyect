import express from 'express';
import shopCartController from '../controllers/shopCartController.mjs';
import { requireLogin } from '../middlewares/session.mjs';

const router = express.Router();

router.get('/tallas/:id_producto', shopCartController.getTallasPorProducto);
router.get('/precio/:id_producto/:nom_talla', shopCartController.getPrecioPorTalla);

router.use(requireLogin);

router.get('/', shopCartController.mostrarCarrito);
router.get('/count', shopCartController.getCartCount);
router.get('/remove/:id_producto_carrito', shopCartController.removeFromCart);
router.get('/admin/vaciar/:id_usuario', shopCartController.vaciarCarrito);
router.get('/admin/eliminar/:id_usuario', shopCartController.eliminarCarrito);
router.post('/decrease/:id', shopCartController.decreaseCantidad);
router.post('/increase/:id', shopCartController.increaseCantidad);
router.post('/add-to-cart', shopCartController.agregarAlCarrito);

export default router;
