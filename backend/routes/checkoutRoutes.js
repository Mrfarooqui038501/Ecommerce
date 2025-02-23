const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

router.post('/create-session', protect, async (req, res) => {
  try {
    const { items, shippingDetails } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid cart items' });
    }

    if (!shippingDetails) {
      return res.status(400).json({ message: 'Shipping details are required' });
    }

    console.log('Creating checkout session with items:', items);

    // Calculate totalPrice from items
    const totalPrice = items.reduce((sum, item) => {
      const itemPrice = item.product.price;
      const itemQuantity = item.quantity;
      if (typeof itemPrice !== 'number' || typeof itemQuantity !== 'number') {
        throw new Error(`Invalid item structure: ${JSON.stringify(item)}`);
      }
      return sum + itemPrice * itemQuantity;
    }, 0);

    // Convert shippingDetails object to a string for shippingAddress
    const shippingAddress = `${shippingDetails.fullName}, ${shippingDetails.email}, ${shippingDetails.phone}, ${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state}, ${shippingDetails.pincode}`;

    // Create order in the database
    const order = new Order({
      user: req.user._id,
      items: items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      shippingAddress,
      totalPrice,
      paymentStatus: 'pending',
      orderStatus: 'Pending',
    });

    await order.save();

    const lineItems = items.map(item => {
      const unitAmount = Math.round(item.product.price * 100);
      if (isNaN(unitAmount) || unitAmount <= 0) {
        throw new Error(`Invalid price for product: ${item.product.name}`);
      }

      return {
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.product.name || 'Product',
            description: item.product.description || '',
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: {
        userId: req.user._id.toString(),
        orderId: order._id.toString(),
      },
    });

    // Update order with Stripe session ID
    order.stripeSessionId = session.id;
    await order.save();

    // Clear the cart after successful session creation
    await Cart.findOneAndDelete({ user: req.user._id });

    console.log('Stripe session created successfully:', session.id);
    res.status(200).json({ 
      sessionId: session.id,
      url: session.url,
      orderId: order._id.toString(),
    });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ 
      message: 'Error creating checkout session',
      error: error.message || 'Internal server error',
    });
  }
});

module.exports = router;