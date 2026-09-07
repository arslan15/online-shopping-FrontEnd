import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  FaUser, 
  FaBriefcase, 
  FaEnvelope, 
  FaBars, 
  FaTimes, 
  FaSignInAlt, 
  FaSignOutAlt,
  FaTachometerAlt,
  FaShoppingCart,
} from 'react-icons/fa';
import logoImg from '../../assets/react.svg';
import './Header.css';

// User navigation links
const USER_NAV_ITEMS = [
  { path: '/user', label: 'Dashboard', icon: FaTachometerAlt },
  { path: '/about', label: 'About', icon: FaUser },
  { path: '/portfolio', label: 'Portfolio', icon: FaBriefcase },
  { path: '/contact', label: 'Contact', icon: FaEnvelope },
];

const GUEST_NAV_ITEMS = [
  { path: '/', label: 'Home', icon: FaTachometerAlt },
  { path: '/about', label: 'About', icon: FaUser },
  { path: '/portfolio', label: 'Portfolio', icon: FaBriefcase },
  { path: '/contact', label: 'Contact', icon: FaEnvelope },
];

// Admin navigation links
const ADMIN_NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: FaTachometerAlt },
  { path: '/about', label: 'About', icon: FaUser },
  { path: '/portfolio', label: 'Portfolio', icon: FaBriefcase },
  { path: '/contact', label: 'Contact', icon: FaEnvelope },
];

function Header({ companyName = "Arslan Company", isLoggedIn = false, isAdmin = false, isUser = false, cartCount = 0, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);

  const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogoutClick = () => {
    closeMenu();
    if (onLogout) onLogout();
  };

  // Close mobile menu when clicking outside header
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Select navigation items and branding based on role
  const navItems = isAdmin 
    ? ADMIN_NAV_ITEMS 
    : isUser 
      ? USER_NAV_ITEMS 
      : GUEST_NAV_ITEMS;

  const brandLink = isAdmin ? '/admin' : isUser ? '/user' : '/';

  return (
    <header className="header" ref={headerRef}>
      <div className="header-container">
        {/* Dynamic Brand / Logo */}
        <Link to={brandLink} className="logo" onClick={closeMenu} aria-label="Home">
  <div className="logo-icon-wrapper">
    <img src={logoImg} alt="Arslan Company Logo" className="logo-img" />
  </div>
  <span className="logo-text">
    <span className="brand-primary">Arslan</span>{' '}
    <span className="brand-secondary">Company</span>
  </span>
</Link>

        {/* Dynamic Navigation Menu */}
        <nav className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`} aria-label="Main Navigation">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/' || path === '/admin' || path === '/user'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <Icon className="nav-icon" aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}

          {/* Render Cart link with Badge Counter exclusively for 'isUser' */}
          {isUser && (
            <NavLink
              to="/cart"
              className={({ isActive }) => `nav-link cart-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
              aria-label={`Shopping Cart with ${cartCount} items`}
            >
              <div className="cart-icon-wrapper">
                <FaShoppingCart className="nav-icon" aria-hidden="true" />
                {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
              </div>
              <span>Cart</span>
            </NavLink>
          )}

          {/* Conditional Login / Logout Button */}
          {isLoggedIn ? (
            <button className="auth-btn logout-btn" onClick={handleLogoutClick} aria-label="Log Out">
              <FaSignOutAlt className="nav-icon" aria-hidden="true" />
              <span>Logout</span>
            </button>
          ) : (
            <NavLink 
              to="/login" 
              className="login-btn" 
              onClick={closeMenu}
              aria-label="Log In"
            >
              <FaSignInAlt className="nav-icon" aria-hidden="true" />
              <span>Login</span>
            </NavLink>
          )}
        </nav>

        {/* Mobile Toggle Button */}
        <button 
          className="mobile-toggle" 
          onClick={toggleMenu} 
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>
    </header>
  );
}

export default Header;