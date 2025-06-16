import express from 'express';
import * as userController from '../../controllers/userController.mjs';
const router = express.Router();

router
  .get('/', userController.getUsers)
  .post('/', userController.validateUser, userController.createUser) 
                                                      // -> POST /admin/users
  .get('/new', userController.showCreateForm)         // -> GET  /admin/users/new
  .get('/:id', userController.getUserDetail)          // -> GET  /admin/users/:id
  .get('/:id/edit', userController.showEditForm)      // -> GET  /admin/users/:id/edit
  .put('/:id', userController.updateUser)             // -> PUT  /admin/users/:id
  .delete('/:id', userController.deleteUser);         // -> DELETE /admin/users/:id

router.get('/users/detail/:id', userController.getUserDetail);

export default router;
