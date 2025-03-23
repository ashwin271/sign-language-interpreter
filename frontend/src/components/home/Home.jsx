import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';


const Home = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section - Updated with cleaner design */}
      <div className="flex flex-col md:flex-row items-center py-16 md:py-24">
        <div className="md:w-1/2 text-left mb-10 md:mb-0 md:pr-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            AI-Powered Sign Language Translation
          </h1>
          <p className={`text-xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            SignLingo bridges the communication gap between sign language and spoken language with real-time, accurate translations.
          </p>
          
          {isAuthenticated ? (
            <Link 
              to="/dashboard" 
              className={`inline-block px-6 py-3 text-lg rounded-lg text-white font-medium ${
                theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } transition shadow-lg hover:shadow-xl mr-4`}
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/signup" 
                className={`inline-block px-6 py-3 text-lg rounded-lg text-white font-medium ${
                  theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                } transition shadow-lg hover:shadow-xl text-center`}
              >
                Get Started Free
              </Link>
              <Link 
                to="/login" 
                className={`inline-block px-6 py-3 text-lg rounded-lg font-medium ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                } transition shadow-lg hover:shadow-xl text-center`}
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
        
        <div className="md:w-1/2">
          <div className={`rounded-xl overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <img 
              src="https://placehold.co/600x400/667EEA/FFFFFF/png?text=SignLingo+Demo" 
              alt="SignLingo Demo" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
      
      {/* Key Features Section - Redesigned with icons and clearer descriptions */}
      <div className="py-16 md:py-20">
        <h2 className="text-3xl font-bold mb-4 text-center">Complete Translation Solution</h2>
        <p className={`text-center max-w-3xl mx-auto mb-12 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Our platform offers comprehensive tools to make sign language communication accessible for everyone.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Feature 1 */}
          <div className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center mb-6">
              <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold ml-4">Sign Language to Text</h3>
            </div>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Record or upload sign language videos and instantly convert them to written text. Our AI accurately recognizes signs and translates them in real-time.
            </p>
            {isAuthenticated && (
              <Link 
                to="/sign-to-text" 
                className={`inline-flex items-center text-sm font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                Try Sign to Text
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
          
          {/* Feature 2 */}
          <div className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center mb-6">
              <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-green-900' : 'bg-green-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold ml-4">Text to Sign Language</h3>
            </div>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Type or paste text and watch it transform into accurate sign language videos. Perfect for learning sign language or communicating with the deaf community.
            </p>
            {isAuthenticated && (
              <Link 
                to="/text-to-sign" 
                className={`inline-flex items-center text-sm font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                Try Text to Sign
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
          
          {/* Feature 3 */}
          <div className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center mb-6">
              <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-purple-900' : 'bg-purple-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold ml-4">Speech to Sign Language</h3>
            </div>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Speak naturally and see your words converted to sign language in real-time. Ideal for face-to-face conversations with deaf individuals.
            </p>
            {isAuthenticated && (
              <Link 
                to="/speech-to-sign" 
                className={`inline-flex items-center text-sm font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                Try Speech to Sign
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
          
          {/* Feature 4 */}
          <div className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center mb-6">
              <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-yellow-900' : 'bg-yellow-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold ml-4">Sign Language to Speech</h3>
            </div>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Translate sign language into spoken audio in real-time. Our technology recognizes signs and converts them to natural-sounding speech.
            </p>
            {isAuthenticated && (
              <Link 
                to="/sign-to-speech" 
                className={`inline-flex items-center text-sm font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                Try Sign to Speech
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* How It Works - Simplified and more professional */}
      <div className="py-16 bg-gradient-to-b from-transparent to-opacity-5 rounded-xl">
        <h2 className="text-3xl font-bold mb-4 text-center">How SignLingo Works</h2>
        <p className={`text-center max-w-3xl mx-auto mb-12 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Our platform uses advanced AI to make sign language translation simple and accurate
        </p>
        
        <div className="flex flex-col md:flex-row justify-between items-center max-w-4xl mx-auto">
          {/* Step 1 */}
          <div className="flex flex-col items-center mb-8 md:mb-0">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-4 ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Input</h3>
            <p className={`text-center max-w-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Provide sign language video, text, or speech depending on your translation needs
            </p>
          </div>
          
          {/* Arrow */}
          <div className="hidden md:block">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col items-center mb-8 md:mb-0">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-4 ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
            <p className={`text-center max-w-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Our advanced AI models analyze and process the input with high accuracy
            </p>
          </div>
          
          {/* Arrow */}
          <div className="hidden md:block">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-4 ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Translation Output</h3>
            <p className={`text-center max-w-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Receive accurate translations as text, sign language video, or speech
            </p>
          </div>
        </div>
      </div>
      
      {/* Technology Section - New section highlighting the tech */}
      <div className={`py-16 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}>
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-center">Powered by Advanced Technology</h2>
          <p className={`text-center max-w-3xl mx-auto mb-12 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            SignLingo uses cutting-edge AI and machine learning to deliver accurate, real-time translations
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-6 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-md'}`}>
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-indigo-900' : 'bg-indigo-100'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Computer Vision</h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Advanced image recognition algorithms that accurately detect and interpret sign language gestures
              </p>
            </div>
            
            <div className={`p-6 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-md'}`}>
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-teal-900' : 'bg-teal-100'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${theme === 'dark' ? 'text-teal-300' : 'text-teal-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Neural Networks</h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Deep learning models trained on extensive sign language datasets for high-accuracy translations
              </p>
            </div>
            
            <div className={`p-6 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-md'}`}>
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-rose-900' : 'bg-rose-100'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${theme === 'dark' ? 'text-rose-300' : 'text-rose-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Natural Language Processing</h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Advanced NLP techniques that ensure translations maintain proper grammar and context
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section - Simplified and more focused */}
      <div className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to break communication barriers?</h2>
        <p className={`text-xl mb-8 max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Join thousands of users who are already using SignLingo to communicate effectively across sign and spoken languages.
        </p>
        
        {isAuthenticated ? (
          <Link 
            to="/dashboard" 
            className={`inline-block px-8 py-4 text-lg rounded-lg text-white font-medium ${
              theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            } transition shadow-lg hover:shadow-xl`}
          >
            Go to Dashboard
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className={`inline-block px-8 py-4 text-lg rounded-lg text-white font-medium ${
                theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } transition shadow-lg hover:shadow-xl`}
            >
              Create Free Account
            </Link>
            <Link 
              to="/login" 
              className={`inline-block px-8 py-4 text-lg rounded-lg font-medium ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              } transition shadow-lg hover:shadow-xl`}
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;