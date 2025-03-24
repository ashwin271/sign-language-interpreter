import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const SignToSpeech = () => {
  const { theme } = useTheme();
  const [isRealtime, setIsRealtime] = useState(false);
  const [realtimeResult, setRealtimeResult] = useState('Waiting...');
  const [recognizedWords, setRecognizedWords] = useState([]);
  const [audioUrl, setAudioUrl] = useState('');
  const [naturalText, setNaturalText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const videoRef = useRef(null);
  const websocketRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const streamRef = useRef(null);
  const audioRef = useRef(null);

  // Function to start real-time recognition
  const startTranslation = async () => {
    if (isRealtime) {
      alert("Translation already started.");
      return;
    }
    
    setError('');
    setRecognizedWords([]);
    setAudioUrl('');
    setNaturalText('');
    
    try {
      // Access the webcam
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Connect to WebSocket
      const wsUrl = 'ws://localhost:8000/gesture/ws';
      websocketRef.current = new WebSocket(wsUrl);
      
      websocketRef.current.onopen = () => {
        console.log('WebSocket connection established');
        setIsRealtime(true);
        // Start sending frames once connection is established
        startSendingFrames();
      };
      
      websocketRef.current.onmessage = (event) => {
        console.log('Received message from server:', event.data);
        try {
          const data = JSON.parse(event.data);
          setRealtimeResult(data.text || 'Waiting...');
          
          // If we have a sequence, update our recognized words
          if (data.sequence && Array.isArray(data.sequence)) {
            setRecognizedWords(data.sequence);
          }
          
          // If sequence is marked as complete, we could do something special
          if (data.sequence_complete) {
            console.log('Sequence complete:', data.sequence);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error. Please try again.');
        stopTranslation();
      };
      
      websocketRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        if (isRealtime) {
          stopTranslation();
        }
      };
    } catch (err) {
      console.error('Error starting translation:', err);
      setError('Unable to access camera or connect to WebSocket.');
    }
  };

  // Function to send video frames to the server
  const startSendingFrames = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const fps = 10; // Reduced frame rate for better reliability
    
    // Make sure video is ready and has dimensions
    if (videoRef.current.videoWidth === 0) {
      console.log('Video not ready yet, waiting...');
      videoRef.current.addEventListener('loadedmetadata', startSendingFrames);
      return;
    }
    
    console.log(`Video dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
    
    const sendFrame = () => {
      if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
        console.log('WebSocket not open, stopping frame sending');
        return;
      }
      
      try {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            console.log(`Sending frame: ${blob.size} bytes`);
            websocketRef.current.send(blob);
          } else {
            console.error('Failed to create blob from canvas');
          }
          
          // Schedule next frame after this one is processed
          setTimeout(sendFrame, 1000 / fps);
        }, 'image/jpeg', 0.8);
      } catch (error) {
        console.error('Error sending frame:', error);
        setTimeout(sendFrame, 1000 / fps);
      }
    };
    
    // Start the frame sending process
    sendFrame();
    console.log('Started sending frames');
  };

  // Function to stop real-time recognition
  const stopTranslation = () => {
    setIsRealtime(false);
    
    // Stop the camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Close WebSocket connection
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  };

  // Function to convert recognized words to speech
  const convertToSpeech = async () => {
    if (recognizedWords.length === 0) {
      setError('No sign language words recognized yet.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Build query params
      const params = new URLSearchParams({
        words: recognizedWords,
        voice: 'af_bella', // Default voice
        lang: 'a',         // Default language (American)
        speed: 1.0         // Default speed
      });
      
      // Call the sign-to-speech endpoint with query params
      const response = await fetch(`http://localhost:8000/tts/sign-to-speech?${params}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert to speech');
      }
      
      const data = await response.json();
      
      // Set the audio URL and natural text
      setAudioUrl(data.audio);
      setNaturalText(data.text);
      
    } catch (err) {
      console.error('Error converting to speech:', err);
      setError(`Failed to convert to speech: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Clean up when the component unmounts
  useEffect(() => {
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Sign Language to Speech Converter</h1>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
          Use your webcam to translate sign language to speech in real-time.
        </p>
      </div>
      
      <div className={`p-6 rounded-lg mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'}`}>
        <h2 className="text-xl font-semibold mb-4">Real-time Recognition</h2>
        
        <div className={`aspect-video max-w-2xl mx-auto rounded-lg overflow-hidden ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
        } mb-6 border-2 border-gray-300`}>
          <video 
            ref={videoRef}
            autoPlay 
            muted
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <p className="text-xl">{realtimeResult}</p>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={isRealtime ? stopTranslation : startTranslation}
            className={`px-6 py-3 rounded-lg text-white font-medium ${
              isRealtime 
                ? 'bg-red-600 hover:bg-red-700' 
                : theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            } transition`}
          >
            {isRealtime ? 'Stop Recognition' : 'Start Recognition'}
          </button>
          
          {recognizedWords.length > 0 && !isRealtime && (
            <button
              onClick={convertToSpeech}
              disabled={loading}
              className={`px-6 py-3 rounded-lg text-white font-medium ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
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
              ) : 'Convert to Speech'}
            </button>
          )}
        </div>
      </div>
      
      {recognizedWords.length > 0 && (
        <div className={`p-6 rounded-lg mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'}`}>
          <h2 className="text-xl font-semibold mb-4">Recognized Words</h2>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className="text-lg">{recognizedWords.join(' ')}</p>
          </div>
        </div>
      )}
      
      {audioUrl && (
        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'}`}>
          <h2 className="text-xl font-semibold mb-4">Speech Result</h2>
          
          {naturalText && (
            <div className={`p-4 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className="text-lg font-medium mb-2">Natural Language:</h3>
              <p className="text-lg">{naturalText}</p>
            </div>
          )}
          
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
            <audio ref={audioRef} src={audioUrl} controls className="w-full" />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <a
              href={audioUrl}
              download="sign-language-speech.wav"
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              } transition flex items-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Audio
            </a>
            
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.play();
                }
              }}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition flex items-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Play Audio
            </button>
            
            {naturalText && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(naturalText);
                }}
                className={`px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                } transition flex items-center`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Text
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SignToSpeech;