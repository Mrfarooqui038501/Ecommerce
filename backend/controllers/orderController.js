const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Place an order
const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id; // Use _id from protect middleware
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(400).json({ message: `Product not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      totalPrice += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const newOrder = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      totalPrice,
      paymentStatus: 'pending',
      orderStatus: 'Pending',
    });

    await Promise.all([
      ...cart.items.map(item =>
        Product.findByIdAndUpdate(item.product._id, { $inc: { quantity: -item.quantity } })
      ),
      Cart.findByIdAndDelete(cart._id),
    ]);

    const populatedOrder = await Order.findById(newOrder._id)
      .populate('items.product')
      .populate('user', 'name email');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Place order error:', error.stack);
    res.status(500).json({ 
      message: 'Error creating order',
      error: error.message,
    });
  }
};

// Get all orders for a user
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price',
      })
      .sort({ createdAt: -1 });
      
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get orders error:', error.stack);
    res.status(500).json({ 
      message: 'Server Error',
      error: error.message,
    });
  }
};

module.exports = { placeOrder, getOrders };