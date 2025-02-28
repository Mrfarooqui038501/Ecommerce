# ShopApp - E-commerce Application

ShopApp is a full-stack e-commerce application built with Node.js, Express, MongoDB, and React. It allows users to register, log in, browse products, add items to a cart, place orders via Stripe payment integration, and view their order history. The application features a clean, responsive UI and a robust backend with secure authentication.

## Features

- **User Authentication**: Register and login with JWT-based authentication.
- **Product Management**: View products with details like name, description, price, and quantity.
- **Cart Functionality**: Add, update, and remove items from the cart with real-time stock validation.
- **Checkout & Payment**: Secure payment processing using Stripe integration.
- **Order Management**: Place orders and view order history with detailed shipping and product information.
- **Responsive Design**: User-friendly interface optimized for desktop and mobile devices.

## Tech Stack

### Backend
- **Node.js**: JavaScript runtime for server-side logic.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing users, products, carts, and orders.
- **Mongoose**: ODM for MongoDB to manage schema and queries.
- **JWT**: JSON Web Tokens for secure authentication.
- **Stripe**: Payment gateway integration for checkout.
- **Bcrypt.js**: Password hashing for security.

### Frontend
- **React**: JavaScript library for building the user interface.
- **React Router**: Client-side routing for navigation.
- **Axios**: HTTP client for API requests.
- **Lucide-React**: Icon library for UI elements.
- **Tailwind CSS**: Utility-first CSS framework for styling.

## Installation

### Prerequisites
- Node.js (v20.14.0 or later)
- MongoDB (local or cloud instance like MongoDB Atlas)
- Stripe account (for payment integration)

### Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Mrfarooqui038501/Ecommerce.git
   cd Ecommerce

# E-commerce Application

A full-stack e-commerce application built with Node.js, React, and MongoDB.

## Installation

### Backend Dependencies
```bash
cd backend
npm install
```

### Frontend Dependencies
```bash
cd ../frontend
npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following:

```text
PORT=5000
MONGO_URI=
JWT_SECRET=
STRIPE_SECRET_KEY=
CLIENT_URL=http://localhost:5173
STRIPE_PUBLIC_KEY=
```

Replace the empty values with your actual credentials.

## Running the Application

### Start Backend Server
```bash
cd backend
npm start
```

### Start Frontend Development Server
```bash
cd ../frontend
npm run dev
```

Visit `http://localhost:5173` in your browser to access the application.

## API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login an existing user

### Cart Operations
- `GET /api/cart` - Fetch user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/:productId` - Update item quantity
- `DELETE /api/cart/:productId` - Remove item from cart

### Order Management
- `GET /api/orders` - Fetch all orders for authenticated user
- `POST /api/orders/place` - Place a new order manually
- `GET /api/orders/session/:sessionId` - Fetch order details by Stripe session ID

### Checkout
- `POST /api/checkout/create-session` - Create a Stripe checkout session

## Usage Guide

1. **Register/Login**: Create an account or log in to access cart and order features
2. **Browse Products**: Navigate to the home page to view available products
3. **Add to Cart**: Add products to your cart and adjust quantities
4. **Checkout**: Proceed to checkout, enter shipping details, and pay via Stripe
5. **View Orders**: Check your order history on the Orders page

## Project Structure

```text
Ecommerce/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── vite.config.js
│   └── .env
├── README.md
└── package.json
```

## Repository

GitHub Repository URL: https://github.com/Mrfarooqui038501/Ecommerce.git

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

Contact
For issues or suggestions, please open an issue on the GitHub repository or contact the maintainer at [armanfarooqui078601@gmail.com].