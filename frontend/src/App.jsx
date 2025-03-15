import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Home from './components/home/Home';
import AudioToText from './components/home/AudioToText'
import TextToSpeech from './components/home/TextToSpeech'
import VideoToSpeech from './components/home/VideoToSpeech'
import SpeechToVideo from './components/home/SpeechToVideo'
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={<Navigate to="/login" replace />} 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/audio-to-text"
            element={
              <ProtectedRoute>
                <AudioToText />
              </ProtectedRoute>
            }
          />

          <Route
            path="/speech-to-video"
            element={
              <ProtectedRoute>
                <SpeechToVideo />
              </ProtectedRoute>
            }
          />

          <Route
            path="/text-to-speech"
            element={
              <ProtectedRoute>
                <TextToSpeech />
              </ProtectedRoute>
            }
          />

          <Route
            path="/video-to-speech"
            element={
              <ProtectedRoute>
                <VideoToSpeech />
              </ProtectedRoute>
            }
          />
          {/* 404 Route */}
          <Route 
            path="*" 
            element={<Navigate to="/login" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
