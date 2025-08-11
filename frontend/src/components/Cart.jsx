import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import ShippingDetails from './ShippingDetails'; 

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Base API URL - using the deployed backend URL
const API_BASE_URL = 'https://ecommerce-i6ct.onrender.com';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingItems, setUpdatingItems] = useState(new Set()); // Track which items are being updated
  const navigate = useNavigate();

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view cart');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(response.data);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Error fetching cart. Please try again.');
      }
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCart();

    // Reduced polling frequency to avoid too many requests
    const interval = setInterval(fetchCart, 10000);
    return () => clearInterval(interval);
  }, [fetchCart]);

  const handleQuantityChange = async (productId, currentQuantity, newQuantity) => {
    if (newQuantity < 1) return;

    // Prevent multiple simultaneous updates for the same item
    if (updatingItems.has(productId)) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to update cart');
        return;
      }

      // Add product to updating set
      setUpdatingItems(prev => new Set([...prev, productId]));

      // Optimistically update the UI
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.map((item) =>
          item.product._id === productId ? { ...item, quantity: newQuantity } : item
        ),
      }));

      // Make API call
      await axios.put(
        `${API_BASE_URL}/api/cart/${productId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch updated cart to ensure consistency
      await fetchCart();
      setSuccess('Cart updated successfully');
      setTimeout(() => setSuccess(''), 2000);

    } catch (error) {
      console.error('Error updating quantity:', error);
      setError(error.response?.data?.message || 'Error updating quantity. Please try again.');
      setTimeout(() => setError(''), 3000);
      
      // Revert optimistic update on error
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.map((item) =>
          item.product._id === productId ? { ...item, quantity: currentQuantity } : item
        ),
      }));
    } finally {
      // Remove product from updating set
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId) => {
    // Prevent multiple simultaneous removes for the same item
    if (updatingItems.has(productId)) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to remove items');
        return;
      }

      // Add product to updating set
      setUpdatingItems(prev => new Set([...prev, productId]));

      // Store original cart for potential rollback
      const originalCart = { ...cart };

      // Optimistically update the UI
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.filter((item) => item.product._id !== productId),
      }));

      // Make API call
      await axios.delete(`${API_BASE_URL}/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Item removed from cart');
      setTimeout(() => setSuccess(''), 2000);
      
      // Fetch updated cart to ensure consistency
      await fetchCart();

    } catch (error) {
      console.error('Error removing item:', error);
      setError('Error removing item. Please try again.');
      setTimeout(() => setError(''), 3000);
      
      // Revert optimistic update on error
      fetchCart();
    } finally {
      // Remove product from updating set
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateShippingDetails = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of requiredFields) {
      if (!shippingDetails[field].trim()) {
        return `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
      }
    }
    if (!/\S+@\S+\.\S+/.test(shippingDetails.email)) {
      return 'Please enter a valid email address';
    }
    if (shippingDetails.phone.length !== 10 || !/^\d+$/.test(shippingDetails.phone)) {
      return 'Phone number must be 10 digits';
    }
    if (shippingDetails.pincode.length !== 6 || !/^\d+$/.test(shippingDetails.pincode)) {
      return 'Pincode must be 6 digits';
    }
    return '';
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please login to checkout');
        navigate('/login');
        return;
      }

      if (!cart.items.length) {
        setError('Your cart is empty');
        return;
      }

      const validationError = validateShippingDetails();
      if (validationError) {
        setError(validationError);
        setTimeout(() => setError(''), 4000);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/checkout/create-session`,
        { items: cart.items, shippingDetails },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.url) {
        // Store order details before redirect
        localStorage.setItem(
          'orderDetails',
          JSON.stringify({
            orderId: response.data.orderId,
            items: cart.items,
            shippingDetails,
            total: cart.total,
          })
        );
        
        // Clear cart state and redirect
        setCart({ items: [], total: 0 });
        window.location.href = response.data.url;
        return;
      }

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId,
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        setError(error.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(error.response?.data?.message || 'Error processing checkout. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">Shopping Cart</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <button 
            onClick={() => setError('')}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative">
          <button 
            onClick={() => setSuccess('')}
            className="absolute top-2 right-2 text-green-500 hover:text-green-700"
          >
            ×
          </button>
          {success}
        </div>
      )}

      {loading && cart.items.length === 0 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      )}

      {!loading && (!cart.items || cart.items.length === 0) ? (
        <div className="text-center py-8">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <Link
            to="/"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div>
          {cart.items.map((item) => {
            const isUpdating = updatingItems.has(item.product._id);
            
            return (
              <div 
                key={item.product._id} 
                className={`bg-white p-6 rounded-lg shadow-md mb-4 ${isUpdating ? 'opacity-60' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-grow">
                    <h3 className="font-bold text-xl mb-2">{item.product.name}</h3>
                    <p className="text-gray-600">{item.product.description}</p>
                    <p className="font-bold text-lg mt-2">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </p>

                    <div className="flex items-center mt-4 space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.product._id, item.quantity, item.quantity - 1)
                          }
                          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.quantity <= 1 || isUpdating}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {isUpdating ? '...' : item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.product._id, item.quantity, item.quantity + 1)
                          }
                          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isUpdating}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.product._id)}
                        className="text-red-500 hover:text-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <ShippingDetails
            shippingDetails={shippingDetails}
            onChange={handleShippingChange}
            error={error}
          />

          <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            <div className="mb-4">
              <h4 className="font-bold">Shipping Details:</h4>
              <p>
                {shippingDetails.fullName || 'N/A'}, {shippingDetails.email || 'N/A'}
              </p>
              <p>{shippingDetails.phone || 'N/A'}</p>
              <p>
                {shippingDetails.address || 'N/A'}, {shippingDetails.city || 'N/A'},{' '}
                {shippingDetails.state || 'N/A'} - {shippingDetails.pincode || 'N/A'}
              </p>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-xl font-bold">₹{cart.total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading || !cart.items.length || updatingItems.size > 0}
              className={`w-full ${
                loading || !cart.items.length || updatingItems.size > 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white px-6 py-3 rounded-lg transition duration-200`}
            >
              {loading ? 'Processing...' : updatingItems.size > 0 ? 'Updating Cart...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;