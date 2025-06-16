import express from 'express';
import shopCartController from '../controllers/shopCartController.mjs';

const router = express.Router();

router.get('/', shopCartController.mostrarCarrito);
router.post('/add-to-cart', shopCartController.addToCart);
router.get('/tallas/:id_producto', shopCartController.getTallasPorProducto);
router.get('/count', shopCartController.getCartCount);
router.get('/remove/:id_producto_carrito', shopCartController.removeFromCart);
router.get('/admin/vaciar/:id_usuario', shopCartController.vaciarCarrito);
router.get('/admin/eliminar/:id_usuario', shopCartController.eliminarCarrito);


export default router;
