import { Router } from 'express';
const router = Router();
import { getLoginPage, login, logout } from '../controllers/loginController.mjs';

router.get('/', getLoginPage);
router.post('/', login);
router.get('/logout', logout);

export default router;
