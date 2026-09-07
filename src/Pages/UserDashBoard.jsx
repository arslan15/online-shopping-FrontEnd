import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ProductCard from '../Components/Product/ProductCard';
import './UserDashboard.css';
import { toast } from 'react-toastify';
import MyContext from '../MyContext';
import { 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaKey, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSearch, 
  FaTimes 
} from 'react-icons/fa';

const UserDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Password Form States
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { handleAddToCart, currentUser } = useContext(MyContext);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No token found. Please log in.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${BASE_URL}/Products`, {
          headers: {
            Authorization: `Bearer ${token.replace(/"/g, '')}`,
          },
        });

        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [BASE_URL]);

  const handlePasswordInputChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    setUpdatingPassword(true);

    try {
      const token = localStorage.getItem('token') || '';

      const response = await axios.put(
        `${BASE_URL}/users/change-password`,
        {
          userId: currentUser?.id || currentUser?._id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token.replace(/"/g, '')}`,
          },
        }
      );

      toast.success(response.data?.message || 'Password updated successfully!');
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally { 
      setUpdatingPassword(false);
    }
  };

  // Filter products by title or category type
  const filteredProducts = products.filter((product) => {
    const query = searchTerm.toLowerCase().trim();
    const nameMatch = product.productName?.toLowerCase().includes(query);
    const categoryMatch = product.productCategoryType?.toLowerCase().includes(query);
    return nameMatch || categoryMatch;
  });

  if (loading) return <p className="dashboard-loading">Loading products...</p>;
  if (error) return <p className="dashboard-error">{error}</p>;

  return (
    <div className="user-dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header-section d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="prominent-dashboard-title">
            Welcome, {currentUser?.name || 'Valued User'}!
          </h1>
          <p className="prominent-dashboard-subtitle">Browse through our latest collection of items</p>
        </div>
        <button 
          className="btn-toggle-password"
          onClick={() => setShowPasswordForm(!showPasswordForm)}
        >
          <FaKey />
          <span>{showPasswordForm ? 'Close Form' : 'Change Password'}</span>
        </button>
      </div>

      {/* Search Bar Component (Positioned underneath Change Password button) */}
      <div className="search-bar-container mb-4">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon-left" />
          <input
            type="text"
            className="dashboard-search-input"
            placeholder="Search books or categories by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="btn-clear-search" 
              onClick={() => setSearchTerm('')}
              aria-label="Clear Search"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Change Password Form */}
      {showPasswordForm && (
        <div className="password-card-wrapper">
          <div className="password-card">
            <div className="password-card-header">
              <div className="password-icon-badge">
                <FaKey />
              </div>
              <h3>Change Password</h3>
              <p>Ensure your account is using a strong, unique password</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="password-form">
              {/* Current Password */}
              <div className="form-field-group">
                <label>Current Password</label>
                <div className="input-with-icon">
                  <FaLock className="field-icon-left" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    placeholder="••••••••"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="field-icon-right"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="form-field-group">
                <label>New Password</label>
                <div className="input-with-icon">
                  <FaLock className="field-icon-left" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="field-icon-right"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="form-field-group">
                <label>Confirm New Password</label>
                <div className="input-with-icon">
                  <FaLock className="field-icon-left" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="field-icon-right"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="password-form-actions">
                <button 
                  type="submit" 
                  className="btn-update-password" 
                  disabled={updatingPassword}
                >
                  <FaCheckCircle />
                  <span>{updatingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
                <button 
                  type="button" 
                  className="btn-cancel-password" 
                  onClick={() => setShowPasswordForm(false)}
                >
                  <FaTimesCircle />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Product Grid Container */}
      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product._id || product.id}
              productName={product.productName}
              productCategoryType={product.productCategoryType}
              ProductQty={product.ProductQty}
              ProductDescription={product.ProductDescription}
              price={product.price}
              ImageUrl={product.ImageUrl}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))
        ) : (
          <p className="no-products-found">
            {searchTerm 
              ? `No items found matching "${searchTerm}"` 
              : 'No products available at the moment.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;