// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const PlaceOrder = () => {
//   const navigate = useNavigate();
//   const [shippingAddress, setShippingAddress] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         throw new Error('Authentication required');
//       }

//       const response = await axios.post('/api/orders/place', 
//         { shippingAddress },
//         {
//           headers: { Authorization: `Bearer ${token}` }
//         }
//       );

//       if (response.status === 201) {
//         navigate('/orders');
//       }
//     } catch (err) {
//       console.error('Error placing order:', err);
//       setError(err.response?.data?.message || err.message || 'Failed to place order');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold mb-6">Place Order</h2>
      
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="address" className="block text-gray-700 mb-2">
//             Shipping Address
//           </label>
//           <textarea
//             id="address"
//             value={shippingAddress}
//             onChange={(e) => setShippingAddress(e.target.value)}
//             className="w-full border rounded-md px-3 py-2"
//             rows="3"
//             required
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 
//             ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
//         >
//           {loading ? 'Placing Order...' : 'Place Order'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default PlaceOrder;