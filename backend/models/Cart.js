const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product',
      required: true
    },
    quantity: { 
      type: Number, 
      required: true,
      default: 1,
      min: 1
    },
    userId: { 
      type: String,
      required: true
    }
  }]
});

module.exports = mongoose.model('Cart', CartSchema);