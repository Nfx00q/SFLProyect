import express from 'express';
import productController from '../../controllers/productController.mjs';
import variantController from '../../controllers/variantController.mjs';
import { isAdmin } from '../../middlewares/auth.mjs';

const router = express.Router();

// Productos
router.get('/', isAdmin, productController.list);
router.post('/create', isAdmin, productController.create);
router.post('/update/:id', isAdmin, productController.update);
router.post('/delete/:id', isAdmin, productController.delete);

// Variantes por producto
router.get('/variants/:id', isAdmin, variantController.list);
router.post('/variants/create', isAdmin, variantController.create);
router.post('/variants/update/:id_var', isAdmin, variantController.update);
router.post('/variants/delete/:id_var/:producto_id', isAdmin, variantController.delete);

export default router;
