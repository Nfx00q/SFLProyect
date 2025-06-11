import express from 'express';
import productController from '../../controllers/productController.mjs';
import { isAdmin } from '../../middlewares/auth.mjs';

const router = express.Router();

router.get('/', isAdmin, productController.list);
router.post('/create', isAdmin, productController.create);
router.post('/update/:id', isAdmin, productController.update);
router.post('/delete/:id', isAdmin, productController.delete);

export default router;
