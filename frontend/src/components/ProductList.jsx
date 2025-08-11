import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    productId: '',
    name: '',
    description: '',
    price: '',
    quantity: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(new Set()); // Track loading state per product
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    checkAdminStatus();
    
    const interval = setInterval(fetchProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkAdminStatus = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(payload.isAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://ecommerce-i6ct.onrender.com/api/products');
      setProducts(response.data);
    } catch (error) {
      setError('Error fetching products');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleInputChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://ecommerce-i6ct.onrender.com/api/products', newProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Product added successfully');
      setNewProduct({
        productId: '',
        name: '',
        description: '',
        price: '',
        quantity: ''
      });
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding product');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://ecommerce-i6ct.onrender.com/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Product deleted successfully');
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error deleting product');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddToCart = async (productId, currentQuantity) => {
    // Check if this product is already being processed
    if (loadingProducts.has(productId)) {
      return;
    }

    // Add product to loading set
    setLoadingProducts(prev => new Set([...prev, productId]));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to add items to cart');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      await axios.post(
        'https://ecommerce-i6ct.onrender.com/api/cart/add',
        { productId, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update product quantity locally
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product._id === productId
            ? { ...product, quantity: currentQuantity - 1 }
            : product
        )
      );
      
      setSuccess('Added to cart successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding to cart');
      setTimeout(() => setError(''), 3000);
    } finally {
      // Remove product from loading set
      setLoadingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">Products</h2>
      
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

      {isAdmin && (
        <form onSubmit={handleAddProduct} className="mb-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Add New Product</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="productId"
              placeholder="Product ID"
              value={newProduct.productId}
              onChange={handleInputChange}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={handleInputChange}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={newProduct.price}
              onChange={handleInputChange}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              min="0"
              step="0.01"
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={newProduct.quantity}
              onChange={handleInputChange}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              min="0"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={newProduct.description}
              onChange={handleInputChange}
              className="border p-2 rounded col-span-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              required
            />
          </div>
          <button 
            type="submit" 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
          >
            Add Product
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => {
          const isLoading = loadingProducts.has(product._id);
          
          return (
            <div key={product._id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm">ID: {product.productId}</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    Delete
                  </button>
                )}
              </div>
              
              <p className="text-gray-700 mb-4 min-h-[3rem]">{product.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <p className="font-bold text-lg text-green-600">₹{product.price}</p>
                <p className={`text-sm font-medium ${
                  product.quantity > 0 
                    ? product.quantity > 10 
                      ? 'text-green-600' 
                      : 'text-orange-600'
                    : 'text-red-600'
                }`}>
                  {product.quantity > 0 
                    ? `In Stock: ${product.quantity}` 
                    : 'Out of Stock'
                  }
                </p>
              </div>
              
              <button
                onClick={() => handleAddToCart(product._id, product.quantity)}
                className={`w-full px-4 py-2 rounded font-medium transition-all duration-200 ${
                  isLoading || product.quantity <= 0
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md transform hover:-translate-y-0.5'
                }`}
                disabled={isLoading || product.quantity <= 0}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : product.quantity <= 0 ? (
                  'Out of Stock'
                ) : (
                  'Add to Cart'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 mb-4">No products available</p>
          {isAdmin && (
            <p className="text-gray-400">Add some products using the form above</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;