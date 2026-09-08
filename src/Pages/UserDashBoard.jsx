import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ProductCard from '../Components/Product/ProductCard';
import './UserDashboard.css';
import { usePagination } from '../hooks/usePagination';
import { toast } from 'react-toastify';
import MyContext from '../MyContext';
import { 
   FaSearch, FaTimes, FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';

const UserDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 

  // Initialize generic pagination hook
  const {
    currentItems: displayedProducts,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    limit,
    setLimit,
    searchTerm,
    setSearchTerm,
    clearSearch,
  } = usePagination(products, {
    searchFields: ['productName', 'productCategoryType'],
    initialLimit: 10,
  });

  const { handleAddToCart, currentUser } = useContext(MyContext);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Fetch ALL products once (no server pagination params)
useEffect(() => {
  let isMounted = true;

  const fetchProducts = async () => {
    // Fallback directly to your live Render endpoint
    const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://online-shopping-backend-0kqg.onrender.com/api';
    const token = localStorage.getItem('token');
    const cleanToken = token ? token.replace(/"/g, '') : '';

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${apiUrl}/Products?page=${currentPage}&limit=${limit}`,
        {
          headers: cleanToken ? { Authorization: `Bearer ${cleanToken}` } : {},
        }
      );

      const rawData = response.data;

      if (isMounted) {
        // Extract array safely from Render wrapper
        if (Array.isArray(rawData)) {
          setProducts(rawData);
        } else if (rawData && Array.isArray(rawData.data)) {
          setProducts(rawData.data);
        } else if (rawData && Array.isArray(rawData.products)) {
          setProducts(rawData.products);
        } else {
          setProducts([]);
        }

        // Extract total pages from server response
        if (rawData && rawData.pagination && rawData.pagination.totalPages) {
          setTotalPages(rawData.pagination.totalPages);
        }
      }
    } catch (err) {
      if (isMounted) {
        console.error('Error fetching products:', err);
        setError(
          err.response?.data?.message || 
          'Failed to load products. (Check if Render backend is awake)'
        );
        setProducts([]);
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchProducts();

  return () => {
    isMounted = false;
  };
}, [currentPage, limit]);

  return (
    <div className="user-dashboard-container">
      {/* Search Input */}
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
            <button className="btn-clear-search" onClick={clearSearch}>
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Grid displays items paginated by hook */}
      {loading ? (
        <p className="dashboard-loading">Loading products...</p>
      ) : error ? (
        <p className="dashboard-error">{error}</p>
      ) : (
        <>
          <div className="product-grid">
            {displayedProducts.length > 0 ? (
              displayedProducts.map((product) => (
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

          {/* Pagination Controls */}
      <div className="pagination-wrapper">
  {/* Left Section: Navigation Controls Bar */}
  <div className="pagination-controls-bar">
    <button
      className="pagination-btn"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((prev) => prev - 1)}
    >
      <FaChevronLeft className="btn-icon" /> Previous
    </button>

    <div className="page-indicator">
      <span>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
    </div>

    <button
      className="pagination-btn"
      disabled={currentPage >= totalPages}
      onClick={() => setCurrentPage((prev) => prev + 1)}
    >
      Next <FaChevronRight className="btn-icon" />
    </button>

    {/* Dropdown placed right next to controls with spacing */}
    <div className="items-per-page-container">
      <label htmlFor="limit-select">Show:</label>
      <select 
        id="limit-select" 
        value={limit} 
        onChange={(e) => setLimit(Number(e.target.value))}
        className="items-per-page-select"
      >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </div>
  </div>
</div>
        </>
      )}
    </div>
  );
};

export default UserDashboard;