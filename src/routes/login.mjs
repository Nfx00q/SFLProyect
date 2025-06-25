import express from 'express';
const router = express.Router();
import { login, logout } from '../controllers/userController.mjs';
import { getLoginPage } from '../controllers/userController.mjs';

router.get('/', getLoginPage);
router.post('/', login);
router.get('/logout', logout);

export default router;
