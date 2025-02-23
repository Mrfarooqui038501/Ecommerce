import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, User, LogIn, UserPlus, Home } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">ShopApp</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
              <Home size={20} />
              <span>Home</span>
            </Link>

            <Link to="/cart" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
              <ShoppingCart size={20} />
              <span>Cart</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/orders" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                  <Package size={20} />
                  <span>Orders</span>
                </Link>
                
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                    <User size={20} />
                    <span>Profile</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600"
                  >
                    <LogIn size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                  <LogIn size={20} />
                  <span>Login</span>
                </Link>
                
                <Link to="/register" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                  <UserPlus size={20} />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;