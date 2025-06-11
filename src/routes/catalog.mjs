import { Router } from 'express';
const router = Router();
import { getCatalogPage } from '../controllers/catalogController.mjs';

router.get('/', getCatalogPage);

export default router;
