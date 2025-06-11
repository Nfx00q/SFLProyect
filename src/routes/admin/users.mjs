import express from 'express';
import * as userController from '../../controllers/userController.mjs';
const router = express.Router();

router.get('/', userController.getUsers);
router.post('/create', userController.createUser);
router.post('/update/:id', userController.updateUser);
router.post('/delete/:id', userController.deleteUser);
router.get('/:id', userController.getUserDetail);

export default router;
