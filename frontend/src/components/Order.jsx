import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const Orders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [showPlaceOrder, setShowPlaceOrder] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchOrders();
    // Check if we're coming from a successful order placement
    if (location.state?.success) {
      setShowSuccess(true);
      setSuccess('Order placed successfully!');
      // Clear the success state after 3 seconds
      setTimeout(() => {
        setSuccess('');
        setShowSuccess(false);
      }, 3000);
    }
  }, [location]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        'http://localhost:5000/api/orders/place',
        { shippingAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setSuccess('Order placed successfully!');
        setShowSuccess(true);
        setShowPlaceOrder(false);
        fetchOrders(); // Refresh orders list
        setShippingAddress('');
        navigate('/orders', { state: { success: true } });
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-4">Order Placed Successfully!</h2>
        <button
          onClick={() => setShowSuccess(false)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          View Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Place Order Form */}
      {showPlaceOrder ? (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Place New Order</h2>
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-gray-700 mb-2">
                Shipping Address
              </label>
              <textarea
                id="address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                rows="3"
                required
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className={`bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
              <button
                type="button"
                onClick={() => setShowPlaceOrder(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Order History</h2>
          <button
            onClick={() => setShowPlaceOrder(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Place New Order
          </button>
        </div>
      )}

      {/* Orders List */}
      {!showPlaceOrder && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No orders found</p>
              <button
                onClick={() => setShowPlaceOrder(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Place Your First Order
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID: {order._id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      Status: {order.orderStatus}
                    </p>
                  </div>
                  <p className="text-xl font-bold">
                    ₹{order.totalPrice.toFixed(2)}
                  </p>
                </div>
                
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {item.product?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-gray-600">
                    Shipping Address: {order.shippingAddress}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;