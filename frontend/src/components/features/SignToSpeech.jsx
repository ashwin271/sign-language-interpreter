import React, { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const SignToSpeech = () => {
  const { theme } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const file = new File([blob], "recorded-video.webm", { type: 'video/webm' });
        setVideoFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please ensure you have granted camera permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setError('Please upload a valid video file.');
      }
    }
  };

  const handleSubmit = async () => {
    if (!videoFile) {
      setError('Please record or upload a video first.');
      return;
    }

    setLoading(true);
    setError('');
    setAudioUrl('');
    
    try {
      // Create form data to send to backend
      const formData = new FormData();
      formData.append('video', videoFile);
      
      // Replace with your actual API endpoint
      const response = await fetch('http://your-backend-api/sign-to-speech', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to process video');
      }
      
      const data = await response.json();
      setAudioUrl(data.audioUrl);
    } catch (err) {
      console.error('Error processing video:', err);
      setError('Failed to process video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Sign Language to Speech Converter</h1>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
          Record or upload a sign language video and our AI will convert it to speech.
        </p>
      </div>
      
      <div className={`p-6 rounded-lg mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'}`}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Record or Upload Video</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-4 py-2 rounded-lg ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            
            <div className="relative">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isRecording}
              />
              <button
                className={`px-4 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-200 hover:bg-gray-300'
                } transition w-full`}
                disabled={isRecording}
              >
                Upload Video
              </button>
            </div>
          </div>
          
          <div className={`aspect-video rounded-lg overflow-hidden ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
          } flex items-center justify-center`}>
            {isRecording ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            ) : previewUrl ? (
              <video
                src={previewUrl}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  No video recorded or uploaded yet
                </p>
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!videoFile || loading}
          className={`w-full px-4 py-3 rounded-lg text-white font-medium ${
            !videoFile || loading
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
              Processing...
            </span>
          ) : 'Convert to Speech'}
        </button>
      </div>
      
      {audioUrl && (
        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'}`}>
          <h2 className="text-xl font-semibold mb-4">Speech Result</h2>
          
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
            <audio ref={audioRef} src={audioUrl} controls className="w-full" />
          </div>
          
          <div className="mt-4 flex gap-4">
            <a
              href={audioUrl}
              download="sign-language-speech.mp3"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default SignToSpeech;