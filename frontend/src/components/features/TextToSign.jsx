import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const TextToSign = () => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Please enter some text to convert.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://your-backend-api/text-to-sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to convert text to sign language');
      }
      
      const data = await response.json();
      setVideoUrl(data.videoUrl);
    } catch (err) {
      console.error('Error converting text to sign:', err);
      setError('Failed to convert text to sign language. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Text to Sign Language Converter</h1>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
          Enter text and our AI will convert it to sign language video.
        </p>
      </div>
      
      <div className={`p-6 rounded-lg mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'}`}>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="text-input" className="block text-lg font-medium mb-2">
              Enter Text
            </label>
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text here..."
              className={`w-full p-3 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                  : 'bg-white border-gray-300 focus:border-blue-500'
              } border focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition`}
              rows="5"
            />
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className={`w-full px-4 py-3 rounded-lg text-white font-medium ${
              loading || !text.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            } transition`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Converting...
              </span>
            ) : 'Convert to Sign Language'}
          </button>
        </form>
      </div>
      
      {videoUrl && (
        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'}`}>
          <h2 className="text-xl font-semibold mb-4">Sign Language Video</h2>
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            <video 
              src={videoUrl} 
              controls 
              className="w-full h-full"
              autoPlay
            />
          </div>
          
          <div className="mt-4 flex gap-4">
            <a
              href={videoUrl}
              download="sign-language-video.mp4"
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              } transition flex items-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Video
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextToSign;