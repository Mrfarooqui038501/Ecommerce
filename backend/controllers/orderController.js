const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user._id; // Change from req.user.id to req.user._id
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Get user's cart and validate
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product');

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total and validate stock
    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id); // Ensure product exists
      
      if (!product) {
        return res.status(400).json({ 
          message: `Product not found` 
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}` 
        });
      }

      totalPrice += product.price * item.quantity;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create new order
    const newOrder = await Order.create({
      user: userId,
      items: orderItems,
      totalPrice,
      shippingAddress,
      paymentStatus: 'Pending',
      orderStatus: 'Pending'
    });

    // Update product quantities and clear cart
    await Promise.all([
      ...cart.items.map(item => 
        Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { quantity: -item.quantity } }
        )
      ),
      Cart.findByIdAndDelete(cart._id)
    ]);

    // Return populated order
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('items.product')
      .populate('user', 'name email');

    res.status(201).json(populatedOrder);

  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ 
      message: 'Error creating order',
      error: error.message 
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name price'
      })
      .sort({ createdAt: -1 });
      
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};