const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getOrders, placeOrder } = require('../controllers/orderController');

router.get('/', protect, getOrders);
router.post('/place', protect, placeOrder);
router.get('/session/:sessionId', protect, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const order = await Order.findOne({ stripeSessionId: req.params.sessionId }).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;