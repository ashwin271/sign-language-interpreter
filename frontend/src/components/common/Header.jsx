import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { theme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const featuresDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (featuresDropdownRef.current && !featuresDropdownRef.current.contains(event.target)) {
        setFeaturesDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
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
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={`font-medium hover:text-blue-500 transition ${
                  theme === 'dark' ? 'text-gray-200 hover:text-blue-400' : 'text-gray-700'
                }`}>Dashboard</Link>
                
                {/* Features Dropdown */}
                <div className="relative" ref={featuresDropdownRef}>
                  <button 
                    onClick={() => setFeaturesDropdownOpen(!featuresDropdownOpen)}
                    className={`flex items-center font-medium hover:text-blue-500 transition ${
                      theme === 'dark' ? 'text-gray-200 hover:text-blue-400' : 'text-gray-700'
                    }`}
                  >
                    Features
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform ${featuresDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {featuresDropdownOpen && (
                    <div className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                    }`}>
                      <Link 
                        to="/sign-to-text" 
                        className={`block px-4 py-2 text-sm ${
                          theme === 'dark' ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setFeaturesDropdownOpen(false)}
                      >
                        Sign to Text
                      </Link>
                      <Link 
                        to="/text-to-sign" 
                        className={`block px-4 py-2 text-sm ${
                          theme === 'dark' ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setFeaturesDropdownOpen(false)}
                      >
                        Text to Sign
                      </Link>
                      <Link 
                        to="/sign-to-speech" 
                        className={`block px-4 py-2 text-sm ${
                          theme === 'dark' ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setFeaturesDropdownOpen(false)}
                      >
                        Sign to Speech
                      </Link>
                      <Link 
                        to="/speech-to-sign" 
                        className={`block px-4 py-2 text-sm ${
                          theme === 'dark' ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setFeaturesDropdownOpen(false)}
                      >
                        Speech to Sign
                      </Link>
                    </div>
                  )}
                </div>
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
              <div className="relative" ref={profileDropdownRef}>
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center space-x-2 ${
                    theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-blue-600' : 'bg-blue-100'
                  }`}>
                    {user?.name ? (
                      <span className={theme === 'dark' ? 'text-white' : 'text-blue-600'}>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <span className="hidden sm:inline">{user?.name || 'Account'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {profileDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                  }`}>
                    <Link 
                      to="/profile" 
                      className={`block px-4 py-2 text-sm ${
                        theme === 'dark' ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link 
                      to="/settings" 
                      className={`block px-4 py-2 text-sm ${
                        theme === 'dark' ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                    <button 
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        theme === 'dark' ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className={`px-4 py-2 rounded-lg font-medium ${
                    theme === 'dark' 
                      ? 'text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className={`px-4 py-2 rounded-lg font-medium ${
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
                <div className="border-t border-gray-600 my-2"></div>
                <div className={`px-4 py-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user?.name || 'Your Account'}
                </div>
                <Link 
                  to="/profile" 
                  className={`block px-6 py-2 font-medium ${theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/settings" 
                  className={`block px-6 py-2 font-medium ${theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-6 py-2 font-medium ${theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  Sign Out
                </button>
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