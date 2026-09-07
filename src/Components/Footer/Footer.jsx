import React,{useContext} from 'react'
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope,FaWhatsapp,FaFacebook,FaInstagram } from 'react-icons/fa'
import './Footer.css'
import { Link } from 'react-router-dom';
import MyContext from '../../MyContext';

function Footer() {
  const { currentUser } = useContext(MyContext);
  const currentYear = new Date().getFullYear()
  const phoneNumber = "923329580707";
  const username ="asarslansaeed1";
  const defaultMessage = encodeURIComponent("Hello! I need help with an inquiry.");
  const instagramUrl = `https://ig.me/m/${username}?text=${encodeURIComponent(defaultMessage)}`;

  const getDashboardPath = () => {
    if (!currentUser) return { path: '/', label: 'Home' };
    return currentUser.role === 'Admin'
      ? { path: '/admin', label: 'Dashboard' }
      : { path: '/user', label: 'Dashboard' };
  };
  const dynamicLink = getDashboardPath();
  const handleInstagramClick = (e) => {
    e.preventDefault();
    const defaultMessage = "Hello! 👋 I have a question about your services.";
    // Copy to clipboard
    navigator.clipboard.writeText(defaultMessage);    
    // Open Instagram DM
    window.open("https://ig.me/m/asarslansaeed1", "_blank", "noopener,noreferrer");
  };
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Brand / Logo Column */}
        <div className="footer-brand">
          <a href="/" className="footer-logo">
            Syed Arslan <span>Saeed</span>
          </a>
          <p className="footer-tagline">
            Building responsive, performant, and modern web applications.
          </p>
        </div>

        {/* Quick Links Column */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li>
            <Link to={dynamicLink.path}>{dynamicLink.label}</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/portfolio">Portfolio</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
          </ul>
        </div>

        {/* Social Connections Column */}
        <div className="footer-socials">
          <h4>Connect</h4>
          <div className="social-icons">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="GitHub"
            >
              <FaGithub />
            </a>
            <a 
              href="https://www.linkedin.com/in/arslan-saeed-39981056/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=asarslansaeed1678@gmail.com"
              aria-label="Email"
            >
              <FaEnvelope />
            </a>
           <a 
          href={`https://wa.me/${phoneNumber}?text=${defaultMessage}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          aria-label="Chat on WhatsApp"
          style={styles.iconLink}
        >
          <FaWhatsapp size={28} color="#25D366" />
</a>
<a 
        href="https://www.facebook.com/arslan.saeed.9883/" 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Facebook Page"
        style={{ color: '#1877F2', fontSize: '24px', textDecoration: 'none' }}
      >
        <FaFacebook />
      </a>
      {/* Instagram Link */}
        <a 
          href={instagramUrl} 
          onClick={handleInstagramClick}
      aria-label="DM us on Instagram"
          target="_blank" 
          rel="noopener noreferrer"
        
          style={{ color: '#E4405F', fontSize: '24px' }}
        >
          <FaInstagram />
        </a>
          </div>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="footer-bottom">
        <p>&copy; {currentYear} Syed Arslan Saeed. All rights reserved.</p>
      </div>
    </footer>
  )
}
const styles = {
  iconLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    transition: 'transform 0.2s ease',
  },
};

export default Footer