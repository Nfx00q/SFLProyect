import express from 'express';
import * as productController from '../../controllers/productController.mjs';
import { isAdmin } from '../../middlewares/auth.mjs';

const router = express.Router();

router.get('/', isAdmin, productController.list);
router.post('/create', isAdmin, productController.create);
router.post('/update/:id', isAdmin, productController.update);
router.post('/delete/:id', isAdmin, productController.del);

router.get('/variants/:id', isAdmin, productController.listVariants);
router.post('/variants/create', isAdmin, productController.createVariant);
router.post('/variants/update/:id_var', isAdmin, productController.updateVariant);
router.post('/variants/delete/:id_var/:producto_id', isAdmin, productController.deleteVariant);


export default router;
