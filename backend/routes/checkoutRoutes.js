const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/authMiddleware');
const Order = require('../models/Order'); // Assuming you have an Order model

router.post('/create-session', protect, async (req, res) => {
  try {
    const { items, shippingDetails } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid cart items' });
    }

    if (!shippingDetails || typeof shippingDetails !== 'object') {
      return res.status(400).json({ message: 'Invalid shipping details' });
    }

    console.log('Creating checkout session with items:', items);

    const lineItems = items.map((item) => {
      if (!item.product || typeof item.product.price !== 'number' || !item.quantity) {
        throw new Error(`Invalid item structure: ${JSON.stringify(item)}`);
      }

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
        quantity: parseInt(item.quantity),
      };
    });

    const total = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Create the order in the database
    const order = new Order({
      user: req.user._id,
      items: items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      shippingDetails,
      total,
      paymentStatus: 'pending',
      stripeSessionId: null, // Will be updated after session creation
    });

    await order.save();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: {
        userId: req.user._id.toString(),
        orderId: order._id.toString(),
        shippingDetails: JSON.stringify(shippingDetails),
      },
    });

    // Update order with Stripe session ID
    order.stripeSessionId = session.id;
    await order.save();

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