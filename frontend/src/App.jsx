import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/common/Layout';
import Home from './components/home/Home';
import SignToText from './components/features/SignToText';
import SignToSpeech from './components/features/SignToSpeech';
import TextToSign from './components/features/TextToSign';
import SpeechToSign from './components/features/SpeechToSign';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/dashboard/Dashboard'
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function AppContent() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/sign-to-text" element={
            <ProtectedRoute>
              <SignToText />
            </ProtectedRoute>
          } />
          <Route path="/sign-to-speech" element={
            <ProtectedRoute>
              <SignToSpeech />
            </ProtectedRoute>
          } />
          <Route path="/text-to-sign" element={
            <ProtectedRoute>
              <TextToSign />
            </ProtectedRoute>
          } />
          <Route path="/speech-to-sign" element={
            <ProtectedRoute>
              <SpeechToSign />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;