import express from 'express';
const router = express.Router();
import { getCatalogPage } from '../controllers/catalogController.mjs';

router.get('/', getCatalogPage);

export default router;
