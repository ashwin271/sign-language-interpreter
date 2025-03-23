import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { theme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className={`py-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-50`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </div>
            <span className="text-2xl font-bold">SignLingo</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`font-medium hover:text-blue-500 transition ${
              theme === 'dark' ? 'text-gray-200 hover:text-blue-400' : 'text-gray-700'
            }`}>Home</Link>
            
            {isAuthenticated ? (
              <>
                <div className="relative group">
                  <button className={`flex items-center font-medium hover:text-blue-500 transition ${
                    theme === 'dark' ? 'text-gray-200 hover:text-blue-400' : 'text-gray-700'
                  }`}>
                    Features
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 hidden group-hover:block ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                  }`}>
                    <Link to="/sign-to-text" className={`block px-4 py-2 text-sm ${
                      theme === 'dark' ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}>Sign to Text</Link>
                    <Link to="/text-to-sign" className={`block px-4 py-2 text-sm ${
                      theme === 'dark' ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}>Text to Sign</Link>
                    <Link to="/sign-to-speech" className={`block px-4 py-2 text-sm ${
                      theme === 'dark' ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}>Sign to Speech</Link>
                    <Link to="/speech-to-sign" className={`block px-4 py-2 text-sm ${
                      theme === 'dark' ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}>Speech to Sign</Link>
                  </div>
                </div>
                <Link to="/dashboard" className={`font-medium hover:text-blue-500 transition ${
                  theme === 'dark' ? 'text-gray-200 hover:text-blue-400' : 'text-gray-700'
                }`}>Dashboard</Link>
              </>
            ) : (
              <>
                <Link to="/about" className={`font-medium hover:text-blue-500 transition ${
                  theme === 'dark' ? 'text-gray-200 hover:text-blue-400' : 'text-gray-700'
                }`}>About</Link>
                <Link to="/pricing" className={`font-medium hover:text-blue-500 transition ${
                  theme === 'dark' ? 'text-gray-200 hover:text-blue-400' : 'text-gray-700'
                }`}>Pricing</Link>
              </>
            )}
          </nav>
          
          {/* Right Side - Auth & Theme */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                  <div className={`px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {user?.name || 'User'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    theme === 'dark' 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    theme === 'dark' 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    theme === 'dark' 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden mt-4 py-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <Link 
              to="/" 
              className={`block px-4 py-2 font-medium ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`block px-4 py-2 font-medium ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className={`px-4 py-2 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Features
                </div>
                <Link 
                  to="/sign-to-text" 
                  className={`block px-6 py-2 font-medium ${theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign to Text
                </Link>
                <Link 
                  to="/text-to-sign" 
                  className={`block px-6 py-2 font-medium ${theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Text to Sign
                </Link>
                <Link 
                  to="/sign-to-speech" 
                  className={`block px-6 py-2 font-medium ${theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign to Speech
                </Link>
                <Link 
                  to="/speech-to-sign" 
                  className={`block px-6 py-2 font-medium ${theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Speech to Sign
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/about" 
                  className={`block px-4 py-2 font-medium ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  to="/pricing" 
                  className={`block px-4 py-2 font-medium ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <div className="px-4 py-2 space-y-2">
                  <Link 
                    to="/login" 
                    className={`block px-4 py-2 rounded-lg font-medium text-center ${
                      theme === 'dark' 
                        ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup" 
                    className={`block px-4 py-2 rounded-lg font-medium text-center ${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;