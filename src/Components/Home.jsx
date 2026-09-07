import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaRocket, 
  FaStore, 
  FaShippingFast, 
  FaShieldAlt, 
  FaHeadset, 
  FaShoppingBag, 
  FaLock 
} from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const trendingProducts = [
    { id: '1', name: 'Wireless Headphones', price: '$99.99' },
    { id: '2', name: 'Smart Watch Pro', price: '$149.99' },
    { id: '3', name: 'Mechanical Keyboard', price: '$79.99' },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">
          Welcome to <span className="highlight-text">Arslan Company</span>
        </h1>
        <p className="hero-subtitle">
          Discover modern, high-performance digital tools and products tailored for you.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary">
            <FaRocket />
            <span>Get Started</span>
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            <FaStore />
            <span>View Products</span>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature-card">
          <FaShippingFast className="feature-icon" />
          <h3>Fast Delivery</h3>
          <p>Free shipping on all order values over $50 worldwide.</p>
        </div>
        <div className="feature-card">
          <FaShieldAlt className="feature-icon" />
          <h3>Secure Checkout</h3>
          <p>100% encrypted payment processing with industry standards.</p>
        </div>
        <div className="feature-card">
          <FaHeadset className="feature-icon" />
          <h3>24/7 Support</h3>
          <p>Dedicated customer care team ready to assist anytime.</p>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <h2 className="section-title">Trending Items</h2>
        <div className="product-grid">
          {trendingProducts.map((item) => (
            <div className="home-product-card" key={item.id}>
              <div className="home-product-image-placeholder">
                <FaShoppingBag style={{ fontSize: '2rem', color: '#c084fc' }} />
              </div>
              <h3 className="home-product-name">{item.name}</h3>
              <p className="home-product-price">{item.price}</p>
              <Link to="/login" className="home-btn-card">
                <FaLock />
                <span>Sign In to Purchase</span>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;