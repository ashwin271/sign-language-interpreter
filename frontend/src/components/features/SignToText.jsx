import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const SignToText = () => {
  const { theme } = useTheme();
  const [isRealtime, setIsRealtime] = useState(false);
  const [realtimeResult, setRealtimeResult] = useState('Waiting...');
  const [error, setError] = useState('');
  
  const videoRef = useRef(null);
  const websocketRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const streamRef = useRef(null);

  // Function to start real-time recognition
  const startTranslation = async () => {
    if (isRealtime) {
      alert("Translation already started.");
      return;
    }
    
    setError('');
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
    <div className="max-w-4xl mx-auto text-center p-6">
      <h1 className="text-3xl font-bold mb-4">Sign Language Translator</h1>
      
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
        <h3 className="text-lg font-semibold mb-2">Real-time Translation</h3>
        <p className="text-xl">{realtimeResult}</p>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <button
        onClick={isRealtime ? stopTranslation : startTranslation}
        className={`px-6 py-3 rounded-lg text-white font-medium ${
          isRealtime 
            ? 'bg-red-600 hover:bg-red-700' 
            : theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
        } transition`}
      >
        {isRealtime ? 'Stop Translation' : 'Start Translation'}
      </button>
    </div>
  );
};

export default SignToText;