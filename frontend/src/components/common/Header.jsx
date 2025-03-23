import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';

const Header = () => {
  const { theme } = useTheme();
  
  return (
    <header className={`py-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          SignLingo
        </Link>
        
        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="hover:text-blue-500 transition">Home</Link>
          <Link to="/sign-to-text" className="hover:text-blue-500 transition">Sign to Text</Link>
          <Link to="/text-to-sign" className="hover:text-blue-500 transition">Text to Sign</Link>
          <Link to="/sign-to-speech" className="hover:text-blue-500 transition">Sign to Speech</Link>
          <Link to="/speech-to-sign" className="hover:text-blue-500 transition">Speech to Sign</Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link to="/login" className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition`}>
            Login
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;