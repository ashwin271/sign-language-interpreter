import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const FeatureCard = ({ title, description, icon, linkTo }) => {
  const { theme } = useTheme();
  
  return (
    <Link 
      to={linkTo}
      className={`block p-6 rounded-lg transition transform hover:scale-105 ${
        theme === 'dark' 
          ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
          : 'bg-white hover:bg-gray-50 shadow-md'
      }`}
    >
      <div className="flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        {description}
      </p>
    </Link>
  );
};

const Home = () => {
  const { theme } = useTheme();
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Breaking Barriers in Sign Language Communication
        </h1>
        <p className={`text-xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Our platform bridges the gap between sign language and spoken language, 
          making communication accessible for everyone.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FeatureCard
          title="Sign to Text"
          description="Convert sign language videos to written text instantly."
          linkTo="/sign-to-text"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          }
        />
        
        <FeatureCard
          title="Text to Sign"
          description="Transform written text into sign language videos."
          linkTo="/text-to-sign"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
        />
        
        <FeatureCard
          title="Sign to Speech"
          description="Convert sign language videos directly to spoken audio."
          linkTo="/sign-to-speech"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          }
        />
        
        <FeatureCard
          title="Speech to Sign"
          description="Transform spoken words into sign language videos."
          linkTo="/speech-to-sign"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          }
        />
      </div>
      
      <div className={`mt-16 p-8 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}>
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                1
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Choose Translation Type</h3>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Select the type of translation you need from our four options.
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                2
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Input Your Content</h3>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Upload a video, type text, or speak into your microphone.
            </p>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Upload a video, type text, or speak into your microphone.
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                3
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Get Instant Translation</h3>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Our AI instantly processes and delivers accurate translations.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-6">Ready to break communication barriers?</h2>
        <Link 
          to="/sign-to-text" 
          className={`inline-block px-8 py-3 rounded-lg text-white font-medium ${
            theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          } transition`}
        >
          Get Started Now
        </Link>
      </div>
    </div>
  );
};

export default Home;