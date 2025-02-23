import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CartIcon = () => {
  const [itemCount, setItemCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetchCartCount();
    // Set up interval to refresh cart count
    const interval = setInterval(fetchCartCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const totalItems = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
      setItemCount(totalItems);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  return (
    <Link 
      to="/cart"
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        transform transition-transform duration-300 ease-in-out
        ${isHovered ? 'scale-110' : 'scale-100'}
      `}>
        <ShoppingCart 
          size={24} 
          className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
        />
        {itemCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {itemCount}
          </div>
        )}
      </div>
    </Link>
  );
};

export default CartIcon;