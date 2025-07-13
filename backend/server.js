const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const crypto = require('crypto');

dotenv.config();

const app = express();


app.use(cors({
  origin: 'https://ecommerce-arman.netlify.app/register',
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/checkout', require('./routes/checkoutRoutes'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));