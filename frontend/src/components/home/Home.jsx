import React from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="home-container">
      <nav className="home-nav">
        <h1>Welcome to Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </nav>
      <div className="home-content">
        <h2>Dashboard Content</h2>
        <p>Welcome to your dashboard! This is a protected route.</p>
      </div>
    </div>
  );
};

export default Home;

