const express = require('express');
const router = express.Router();
const requireAdminAuth = require('../middlewares/auth.middleware');
const { getProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');

router.get('/', getProducts);
router.post('/', requireAdminAuth, addProduct);
router.put('/:id', requireAdminAuth, updateProduct);
router.delete('/:id', requireAdminAuth, deleteProduct);

module.exports = router;
