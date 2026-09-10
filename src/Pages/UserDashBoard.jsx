import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ProductCard from '../Components/Product/ProductCard';
import './UserDashboard.css';
import { usePagination } from '../hooks/usePagination';
import MyContext from '../MyContext';
import { 
  FaSearch, FaTimes, FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';

const UserDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiPagination, setApiPagination] = useState(null);

  const { handleAddToCart } = useContext(MyContext);

  // Initialize generic pagination hook with serverPagination flag
  const {
    currentItems: displayedProducts,
    currentPage,
    setCurrentPage,
    totalPages,
    limit,
    setLimit,
    searchTerm,
    setSearchTerm,
    clearSearch,
  } = usePagination(products, {
    searchFields: ['productName', 'productCategoryType', 'ProductDescription'],
    initialLimit: 10,
    serverPagination: apiPagination, // Synchronizes hook with backend metadata
  });

  // Fetch paginated products from server
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
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
          // Extract array safely from API response wrapper
          if (Array.isArray(rawData)) {
            setProducts(rawData);
          } else if (rawData && Array.isArray(rawData.data)) {
            setProducts(rawData.data);
          } else if (rawData && Array.isArray(rawData.products)) {
            setProducts(rawData.products);
          } else {
            setProducts([]);
          }

          // Extract and set server pagination metadata
          if (rawData?.pagination) {
            setApiPagination(rawData.pagination);
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
      {/* Search Input Bar */}
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

      {/* Grid displays items */}
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
          <div
            className="pagination-wrapper"
            style={{
              marginTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                width: '100%',
              }}
            >
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                style={{
                  padding: '6px 12px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <FaChevronLeft className="btn-icon" /> Previous
              </button>

              <div
                className="page-indicator"
                style={{
                  padding: '6px 10px',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                }}
              >
                <span>
                  Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
                </span>
              </div>

              <button
                className="pagination-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                style={{
                  padding: '6px 12px',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Next <FaChevronRight className="btn-icon" />
              </button>
            </div>

            <div
              className="items-per-page-container"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              <label htmlFor="limit-select" style={{ marginRight: '6px' }}>
                Show:
              </label>
              <select
                id="limit-select"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="items-per-page-select"
                style={{ padding: '4px 8px', borderRadius: '4px' }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDashboard;