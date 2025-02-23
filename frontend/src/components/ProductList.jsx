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
  const [loading, setLoading] = useState(false);
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
      const response = await axios.get('http://localhost:5000/api/products');
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
      await axios.post('http://localhost:5000/api/products', newProduct, {
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
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
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
    setLoading(true);
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
        'http://localhost:5000/api/cart/add',
        { productId, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      
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
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">Products</h2>
      
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
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={handleInputChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={newProduct.price}
              onChange={handleInputChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={newProduct.quantity}
              onChange={handleInputChange}
              className="border p-2 rounded"
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={newProduct.description}
              onChange={handleInputChange}
              className="border p-2 rounded col-span-2"
              required
            />
          </div>
          <button 
            type="submit" 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Product
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-xl mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm">ID: {product.productId}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="text-gray-700 mb-4">{product.description}</p>
            <div className="flex justify-between items-center mb-4">
              <p className="font-bold text-lg">₹{product.price}</p>
              <p className={`text-${product.quantity > 0 ? 'gray' : 'red'}-600`}>
                {product.quantity > 0 ? `In Stock: ${product.quantity}` : 'Out of Stock'}
              </p>
            </div>
            <button
              onClick={() => handleAddToCart(product._id, product.quantity)}
              className={`w-full ${
                loading || product.quantity <= 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white px-4 py-2 rounded transition-colors duration-200`}
              disabled={loading || product.quantity <= 0}
            >
              {loading ? 'Adding...' : product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;