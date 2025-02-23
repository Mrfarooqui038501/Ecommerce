// controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.addToCart = async (req, res) => {
  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.quantity < quantity) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: `Only ${product.quantity} units available` 
      });
    }

    let cart = await Cart.findOne({ user: userId }).session(session);
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.quantity) {
        await session.abortTransaction();
        return res.status(400).json({ 
          message: `Cannot add ${quantity} more units. Only ${product.quantity - existingItem.quantity} additional units available`
        });
      }
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    // Decrease the product quantity
    product.quantity -= quantity;
    await product.save({ session });
    await cart.save({ session });
    
    // Commit the transaction
    await session.commitTransaction();
    
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product');

    const total = populatedCart.items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );

    res.status(200).json({ items: populatedCart.items, total });
  } catch (error) {
    await session.abortTransaction();
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    session.endSession();
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product');
    
    if (!cart) {
      return res.status(200).json({ items: [], total: 0 });
    }
    
    const total = cart.items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0);
    
    res.status(200).json({ items: cart.items, total });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateCartItem = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ user: req.user.id }).session(session);
    const { quantity } = req.body;
    
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === req.params.productId
    );
    
    if (itemIndex > -1) {
      const product = await Product.findById(req.params.productId).session(session);
      const quantityDiff = quantity - cart.items[itemIndex].quantity;

      if (quantityDiff > 0 && product.quantity < quantityDiff) {
        await session.abortTransaction();
        return res.status(400).json({ 
          message: `Cannot add ${quantityDiff} more units. Only ${product.quantity} units available`
        });
      }

      // Update product quantity
      product.quantity -= quantityDiff;
      await product.save({ session });

      // Update cart item quantity
      cart.items[itemIndex].quantity = quantity;
      await cart.save({ session });

      await session.commitTransaction();
      res.status(200).json(cart);
    } else {
      await session.abortTransaction();
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server Error' });
  } finally {
    session.endSession();
  }
};

exports.removeFromCart = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ user: req.user.id }).session(session);
    const itemToRemove = cart.items.find(item => 
      item.product.toString() === req.params.productId
    );

    if (itemToRemove) {
      // Return quantity back to product
      const product = await Product.findById(req.params.productId).session(session);
      product.quantity += itemToRemove.quantity;
      await product.save({ session });

      // Remove item from cart
      cart.items = cart.items.filter(item => 
        item.product.toString() !== req.params.productId
      );
      
      await cart.save({ session });
      await session.commitTransaction();
      res.status(200).json(cart);
    } else {
      await session.abortTransaction();
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server Error' });
  } finally {
    session.endSession();
  }
};