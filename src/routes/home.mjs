import express from 'express';
const router = express.Router();

import homeController from '../controllers/homeController.mjs';

router.get('/', homeController.getHomePage);

export default router;
