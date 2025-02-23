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
        // Fallback to localStorage if session_id is not present (for demo purposes)
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

        const response = await axios.get(`http://localhost:5000/api/orders/session/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrderDetails({
          orderId: response.data._id,
          items: response.data.items,
          shippingDetails: response.data.shippingDetails,
          total: response.data.total,
        });
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again.');
      }
    };

    fetchOrderDetails();
  }, [location]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center">
        <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold mb-4">Order Placed Successfully!</h2>
        {orderDetails?.orderId && (
          <p className="text-gray-600 mb-8">Order ID: {orderDetails.orderId}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
          {error}
        </div>
      )}

      {orderDetails ? (
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
          <h3 className="text-xl font-bold mb-4">Order Details</h3>

          <div className="mb-6">
            <h4 className="font-bold text-lg mb-2">Shipping Details</h4>
            <p>{orderDetails.shippingDetails.fullName}</p>
            <p>{orderDetails.shippingDetails.email}</p>
            <p>{orderDetails.shippingDetails.phone}</p>
            <p>
              {orderDetails.shippingDetails.address}, {orderDetails.shippingDetails.city},{' '}
              {orderDetails.shippingDetails.state} - {orderDetails.shippingDetails.pincode}
            </p>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-lg mb-2">Ordered Products</h4>
            {orderDetails.items.map((item) => (
              <div
                key={item.product}
                className="flex justify-between items-center border-b py-2"
              >
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
            <span className="text-xl font-bold">₹{orderDetails.total.toFixed(2)}</span>
          </div>
        </div>
      ) : (
        !error && (
          <p className="text-center text-gray-600 mt-4">Loading order details...</p>
        )
      )}

      <div className="text-center mt-8 space-x-4">
        <Link
          to="/orders"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          View Orders
        </Link>
        <Link
          to="/"
          className="inline-block bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;