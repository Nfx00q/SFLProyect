const express = require('express');
const router = express.Router();
const productController = require('../../controllers/productController');
const { isAdmin } = require('../../middlewares/auth');

router.get('/', isAdmin, productController.list);
router.post('/create', isAdmin, productController.create);
router.post('/update/:id', isAdmin, productController.update);
router.post('/delete/:id', isAdmin, productController.delete);

module.exports = router;