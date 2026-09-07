import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import MainLayout from './Components/MainLayout';
import About from './Components/About/About';
import Contact from './Components/Contact/Contact';
import NotFound from './Components/NotFound/NotFound';
import Portfolio from './Components/Portfolio/Portfolio';
import Home from './Components/Home';
import Login from './Components/Login/LoginForm';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import ProtectedRoute from './Components/ProtectedRoute';
import AdminDashboard from './Pages/AdminDashboard';
import UserDashboard from './Pages/UserDashBoard';
import MyContext from './MyContext';
import axios from 'axios';
import Cart from './Pages/Cart';
import { WhatsAppWidget } from 'react-whatsapp-widget';
import 'react-whatsapp-widget/dist/index.css';

function App() {
  const companyName = "Arslan Company";
  const navigate = useNavigate();
  const BASE_URL = "";

  // 1. Initial user dataset
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@test.com',
      password: '123',
      role: 'Admin',
      isActive: true,
    },
    {
      id: 2,
      name: 'John Doe',
      email: 'john@test.com',
      password: '123',
      role: 'User',
      isActive: true,
    },
  ]);
  
  // 2. Load active session from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
// 3. Persistent Cart State in localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('app_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  // 4. Keep localStorage updated when user status changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('app_cart', JSON.stringify(cart));
  }, [cart]);

  // 5. Cart Handlers
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const productId = product._id || product.id;
      const existing = prevCart.find((item) => (item._id || item.id) === productId);

      if (existing) {
        return prevCart.map((item) =>
          (item._id || item.id) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    toast.success(`${product.productName} added to cart!`);
  };

  const handleRemoveFromCart = (productId,qty) => {
    
    if(qty >=2){
     setCart((prev) =>
      prev.map((item) =>
        (item._id || item.id) === productId
          ? { ...item, quantity: item.quantity - 1 } // Replace 'quantity' with your cart's quantity key name
          : item
      )
    );
    toast.info("Item Removed from cart");
    }
    else{
    setCart((prev) => prev.filter((item) => (item._id || item.id) !== productId));
    toast.info("Item removed from cart");
    navigate("/user");
    }
    //toast.info("Item removed from cart");
  
    //navigate("/user");
    
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // 6. Submit Order & Send Email Notification
  const placeOrder = async (shippingAddress) => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return false;
    }

    try {
      const totalAmount = cart.reduce((sum, item) => sum + (item.price || 10) * item.quantity, 0);
      const response = await axios.post(`${BASE_URL}/orders/place-order`, {
        cart,
        shippingAddress,
        totalAmount,
      });

      toast.success(response.data.message || 'Order placed! Confirmation email sent.');
      clearCart();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order.');
      return false;
    }
  };
  // 7. Login handler & role-based redirect
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'Admin') {
      navigate('/admin');
    } else {
      navigate('/user');
    }
  };

  // 8. Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.clear();
    navigate('/login');
  };

  return <>
  <ToastContainer 
        position="top-left" 
        autoClose={3000} 
        theme="dark" 
        transition={Slide} 
      />
      <WhatsAppWidget 
        phoneNumber="923329580707" // Use your full international number without + or spaces
        companyName="Customer Support"
        message="Hello! 👋 How can we help you today?"
        replyTimeText="Typically replies within a few minutes"
      />
     <MyContext.Provider 
        value={{ 
          companyName, 
          currentUser, 
          users, 
          setUsers, 
          handleLoginSuccess, 
          handleLogout,
          cart,
          cartCount,
          handleAddToCart,
          handleRemoveFromCart,
          clearCart,
          placeOrder
        }}
      >
    <Routes>
      {/* MainLayout Route wrapping public pages AND protected dashboards */}
      <Route
        path="/"
        element={
          <MainLayout/>
        }
      >
        <Route index element={<Home />} />
        <Route path="home" element={<Home />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        
        <Route
          path="login"
          element={
            <Login
              users={users}
              setUsers={setUsers}
              onLoginSuccess={handleLoginSuccess}
            />
          }
        />

        {/* Protected User Route - nested inside MainLayout so Header/Footer stay visible */}
        <Route element={<ProtectedRoute user={currentUser} allowedRole="User" />}>
          <Route path="user" element={<UserDashboard />} />
          <Route path="cart" element={<Cart />} />
        </Route>

        {/* Protected Admin Route - nested inside MainLayout so Header/Footer stay visible */}
        <Route element={<ProtectedRoute user={currentUser} allowedRole="Admin" />}>
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </MyContext.Provider>
  </>
}

export default App;