// layouts/MainLayout.jsx
import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import '../App.css';
import MyContext from '../MyContext';

function MainLayout() {
  // Check if current user is an admin
  const { companyName, currentUser, handleLogout,cartCount } = useContext(MyContext);
  const isAdmin = currentUser?.role === 'Admin';
  const isUser = currentUser?.role === 'User' ? true : false;
  return (
    <div className="app-container">
      <Header 
        companyName={companyName}
        isLoggedIn={Boolean(currentUser)}
        isAdmin={isAdmin}
        isUser ={isUser}
        cartCount={cartCount}
        onLogout={handleLogout} 
      />
    
      <main className="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;