// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { 
  addToCart, 
  getCart, 
  updateCartItem, 
  removeFromCart 
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/:productId', protect, updateCartItem);
router.delete('/:productId', protect, removeFromCart);

module.exports = router;