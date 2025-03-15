// Home.jsx
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
    <div className="welcome-page">
      <nav className="nav-bar">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </nav>
      <div className="welcome-content">
        <h1>Welcome, Happy to Help You!</h1>
        <p>What do you need?</p>
        <div className="button-group">
          <button onClick={() => navigate('/text-to-speech')}>Text to Speech</button>
          <button onClick={() => navigate('/speech-to-video')}>Speech to Video</button>
          <button onClick={() => navigate('/audio-to-text')}>Speech to Text</button>
          <button onClick={() => navigate('/video-to-speech')}>Video to Speech</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
