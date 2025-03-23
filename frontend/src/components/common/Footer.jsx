import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`pt-12 pb-8 ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className={`p-1 rounded-md ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">SignLingo</h3>
            </div>
            <p className="mb-4 text-sm">
              Breaking communication barriers with AI-powered sign language translation technology.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/sign-to-text" className="hover:underline transition-colors duration-200 hover:text-blue-500">
                  Sign Language to Text
                </Link>
              </li>
              <li>
                <Link to="/text-to-sign" className="hover:underline transition-colors duration-200 hover:text-blue-500">
                  Text to Sign Language
                </Link>
              </li>
              <li>
                <Link to="/sign-to-speech" className="hover:underline transition-colors duration-200 hover:text-blue-500">
                  Sign Language to Speech
                </Link>
              </li>
              <li>
                <Link to="/speech-to-sign" className="hover:underline transition-colors duration-200 hover:text-blue-500">
                  Speech to Sign Language
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company Pages */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:underline transition-colors duration-200 hover:text-blue-500">
                  About
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:underline transition-colors duration-200 hover:text-blue-500">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:underline transition-colors duration-200 hover:text-blue-500">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:underline transition-colors duration-200 hover:text-blue-500">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;