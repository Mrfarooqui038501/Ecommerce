const mongoose = require('mongoose');
const Product = require('../models/Product');
const dotenv = require('dotenv');

dotenv.config();

const products = [
  {
    productId: "PROD001",
    name: "Laptop Pro",
    description: "High-performance laptop for professionals",
    price: 1299.99,
    quantity: 10
  },
  {
    productId: "PROD002",
    name: "Smartphone X",
    description: "Latest smartphone with advanced features",
    price: 799.99,
    quantity: 15
  },
  {
    productId: "PROD003",
    name: "Wireless Earbuds",
    description: "Premium wireless earbuds with noise cancellation",
    price: 149.99,
    quantity: 20
  },
  {
    productId: "PROD004",
    name: "Smart Watch Elite",
    description: "Advanced fitness tracking and health monitoring",
    price: 299.99,
    quantity: 25
  },
  {
    productId: "PROD005",
    name: "4K Gaming Monitor",
    description: "27-inch 4K monitor with 144Hz refresh rate",
    price: 499.99,
    quantity: 8
  },
  {
    productId: "PROD006",
    name: "Mechanical Keyboard",
    description: "RGB mechanical gaming keyboard with Cherry MX switches",
    price: 129.99,
    quantity: 30
  },
  {
    productId: "PROD007",
    name: "Wireless Gaming Mouse",
    description: "High-precision wireless gaming mouse with adjustable DPI",
    price: 79.99,
    quantity: 40
  },
  {
    productId: "PROD008",
    name: "Tablet Pro 12.9",
    description: "Professional tablet with Apple Pencil support",
    price: 899.99,
    quantity: 12
  },
  {
    productId: "PROD009",
    name: "Bluetooth Speaker",
    description: "Waterproof portable speaker with 24-hour battery life",
    price: 199.99,
    quantity: 35
  },
  {
    productId: "PROD010",
    name: "4K Webcam",
    description: "Professional 4K webcam for streaming and conferences",
    price: 159.99,
    quantity: 18
  },
  {
    productId: "PROD011",
    name: "External SSD 1TB",
    description: "Portable SSD with USB-C connection and 1TB storage",
    price: 149.99,
    quantity: 22
  },
  {
    productId: "PROD012",
    name: "Gaming Console Pro",
    description: "Next-gen gaming console with 4K graphics support",
    price: 499.99,
    quantity: 15
  },
  {
    productId: "PROD013",
    name: "Wireless Charger",
    description: "Fast wireless charging pad with multiple device support",
    price: 39.99,
    quantity: 50
  },
  {
    productId: "PROD014",
    name: "Smart Home Hub",
    description: "Central hub for controlling all smart home devices",
    price: 129.99,
    quantity: 28
  },
  {
    productId: "PROD015",
    name: "Noise-Canceling Headphones",
    description: "Over-ear headphones with active noise cancellation",
    price: 249.99,
    quantity: 20
  },
  {
    productId: "PROD016",
    name: "Ultra-Wide Monitor",
    description: "34-inch curved ultra-wide monitor for productivity",
    price: 699.99,
    quantity: 10
  },
  {
    productId: "PROD017",
    name: "Graphics Card Pro",
    description: "High-end graphics card for gaming and rendering",
    price: 899.99,
    quantity: 5
  },
  {
    productId: "PROD018",
    name: "Camera Drone",
    description: "4K camera drone with GPS and automatic return",
    price: 599.99,
    quantity: 15
  },
  {
    productId: "PROD019",
    name: "Smart Security Camera",
    description: "WiFi-enabled security camera with night vision",
    price: 89.99,
    quantity: 45
  },
  {
    productId: "PROD020",
    name: "Power Bank 20000mAh",
    description: "High-capacity power bank with fast charging support",
    price: 49.99,
    quantity: 60
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({}); // Clear existing products
    await Product.insertMany(products);
    console.log('Products seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();