import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`pt-12 pb-8 ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
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
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Features */}
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
          
          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:underline transition-colors duration-200 hover:text-blue-500">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:underline transition-colors duration-200 hover:text-blue-500">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:underline transition-colors duration-200 hover:text-blue-500">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:underline transition-colors duration-200 hover:text-blue-500">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:underline transition-colors duration-200 hover:text-blue-500">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:underline transition-colors duration-200 hover:text-blue-500">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:underline transition-colors duration-200 hover:text-blue-500">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:underline transition-colors duration-200 hover:text-blue-500">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom section with copyright */}
        <div className={`pt-8 mt-8 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0">
              © {currentYear} SignLingo. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-sm hover:underline transition-colors duration-200 hover:text-blue-500">
                Privacy
              </Link>
              <Link to="/terms" className="text-sm hover:underline transition-colors duration-200 hover:text-blue-500">
                Terms
              </Link>
              <Link to="/cookies" className="text-sm hover:underline transition-colors duration-200 hover:text-blue-500">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;