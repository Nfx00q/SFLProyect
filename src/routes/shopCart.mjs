import express from 'express';
import shopCartController from '../controllers/shopCartController.mjs';

const router = express.Router();

router.post('/add-to-cart', shopCartController.addToCart);
router.get('/tallas/:id_producto', shopCartController.getTallasPorProducto);

export default router;
