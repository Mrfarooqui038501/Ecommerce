import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = ({ cart, setCart }) => {
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to place order');
      }

      if (!shippingAddress.trim()) {
        throw new Error('Shipping address is required');
      }

      const response = await axios.post(
        'https://ecommerce-vzc6.onrender.com/api/orders/place',
        { shippingAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      
      setCart({ items: [], total: 0 });
      
      
      localStorage.removeItem('cart');
      
      
      navigate('/order-success', { 
        state: { orderId: response.data._id } 
      });
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">Checkout</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Shipping Address
          </label>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows="4"
            required
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-bold mb-2">Order Summary</h3>
          {cart.items.map(item => (
            <div key={item.product._id} className="flex justify-between py-2">
              <span>{item.product.name} x {item.quantity}</span>
              <span>₹{item.product.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 font-bold flex justify-between">
            <span>Total:</span>
            <span>₹{cart.total}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !cart.items.length}
          className={`
            w-full p-3 rounded-md text-white
            ${loading || !cart.items.length 
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;