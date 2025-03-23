import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const features = [
    {
      title: 'Sign to Text',
      description: 'Convert sign language to written text',
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      path: '/sign-to-text'
    },
    {
      title: 'Text to Sign',
      description: 'Convert text to sign language videos',
      icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
      path: '/text-to-sign'
    },
    {
      title: 'Sign to Speech',
      description: 'Convert sign language to spoken audio',
      icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z',
      path: '/sign-to-speech'
    },
    {
      title: 'Speech to Sign',
      description: 'Convert spoken words to sign language',
      icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
      path: '/speech-to-sign'
    }
  ];
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
          Welcome back, {user?.name || 'User'}!
        </p>
      </div>
      
      {/* User Stats */}
      <div className={`mb-8 p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'}`}>
        <h2 className="text-xl font-semibold mb-4">Your Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className="text-sm text-gray-500 mb-1">Total Translations</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className="text-sm text-gray-500 mb-1">Sign to Text</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className="text-sm text-gray-500 mb-1">Text to Sign</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className="text-sm text-gray-500 mb-1">Usage Time</p>
            <p className="text-2xl font-bold">0h</p>
          </div>
        </div>
      </div>
      
      {/* Quick Access */}
      <div className={`mb-8 p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'}`}>
        <h2 className="text-xl font-semibold mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link 
              key={index}
              to={feature.path}
              className={`p-6 rounded-lg flex flex-col h-full transition-transform hover:scale-105 ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className={`p-2 rounded-lg mb-4 self-start ${
                theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'}`}>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className={`p-8 rounded-lg flex flex-col items-center justify-center ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mb-4 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-center">No recent activity found.</p>
          <p className={`text-sm text-center mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Use any of our translation features to see your activity here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;