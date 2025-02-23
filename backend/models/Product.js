const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  productId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String,
    required: true
  },
  price: { 
    type: Number, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);