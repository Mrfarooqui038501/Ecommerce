import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const OrderSuccess = () => {
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const sessionId = new URLSearchParams(location.search).get('session_id');
      if (!sessionId) {
        // Fallback to localStorage if session_id is missing
        const storedDetails = JSON.parse(localStorage.getItem('orderDetails'));
        if (storedDetails) {
          setOrderDetails(storedDetails);
          localStorage.removeItem('orderDetails'); // Clean up
        } else {
          setError('No session ID found. Unable to retrieve order details.');
        }
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view order details');
          return;
        }

        const response = await axios.get(`https://ecommerce-i6ct.onrender.com/api/orders/session/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrderDetails({
          orderId: response.data._id,
          items: response.data.items,
          shippingDetails: {
            fullName: response.data.shippingAddress.split(', ')[0], // Parse shippingAddress string
            email: response.data.shippingAddress.split(', ')[1],
            phone: response.data.shippingAddress.split(', ')[2],
            address: response.data.shippingAddress.split(', ')[3],
            city: response.data.shippingAddress.split(', ')[4],
            state: response.data.shippingAddress.split(', ')[5],
            pincode: response.data.shippingAddress.split(', ')[6],
          },
          total: response.data.totalPrice,
        });
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(
          err.response?.status === 404
            ? 'Order not found. It may still be processing.'
            : 'Failed to load order details. Please try again.'
        );
      }
    };

    fetchOrderDetails();
  }, [location]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Error</h2>
        <p className="text-gray-600 mb-8">{error}</p>
        <Link to="/orders" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          View Orders
        </Link>
      </div>
    );
  }

  if (!orderDetails) {
    return <div className="text-center py-8">Loading order details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center">
        <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-4">Order Placed Successfully!</h2>
        {orderDetails.orderId && (
          <p className="text-gray-600 mb-8">Order ID: {orderDetails.orderId}</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h3 className="text-xl font-bold mb-4">Order Details</h3>

        <div className="mb-6">
          <h4 className="font-bold text-lg mb-2">Shipping Details</h4>
          <p>{orderDetails.shippingDetails?.fullName || 'N/A'}</p>
          <p>{orderDetails.shippingDetails?.email || 'N/A'}</p>
          <p>{orderDetails.shippingDetails?.phone || 'N/A'}</p>
          <p>
            {orderDetails.shippingDetails?.address || 'N/A'}, {orderDetails.shippingDetails?.city || 'N/A'},{' '}
            {orderDetails.shippingDetails?.state || 'N/A'} - {orderDetails.shippingDetails?.pincode || 'N/A'}
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-bold text-lg mb-2">Ordered Products</h4>
          {orderDetails.items.map((item) => (
            <div key={item.product} className="flex justify-between items-center border-b py-2">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">Total:</span>
          <span className="text-xl font-bold">₹{orderDetails.total ? orderDetails.total.toFixed(2) : 'N/A'}</span>
        </div>
      </div>

      <div className="text-center mt-8 space-x-4">
        <Link to="/orders" className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          View Orders
        </Link>
        <Link to="/" className="inline-block bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;