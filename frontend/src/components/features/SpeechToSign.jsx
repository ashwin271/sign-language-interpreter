import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SpeechToSign = () => {
  const { theme } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [transcription, setTranscription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [contentHash, setContentHash] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');
  const [audioVisualizerData, setAudioVisualizerData] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Poll for video status if we're processing
  useEffect(() => {
    let intervalId;
    
    if (contentHash && processingStatus === 'processing') {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/video/status/${contentHash}`);
          const data = await response.json();
          
          if (data.status === 'completed') {
            setProcessingStatus('completed');
            setVideoUrl(`${API_URL}${data.video_path}`);
            setGenerating(false);
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error('Error checking video status:', err);
        }
      }, 2000); // Check every 2 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [contentHash, processingStatus]);

  // Clean up audio visualization on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const visualizeAudio = (stream) => {
    // Create audio context and analyzer
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    
    // Connect the microphone stream to the analyzer
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    
    // Set up the visualization loop
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateVisualization = () => {
      if (!isRecording) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Create a simplified array for visualization (take every 4th value)
      const simplifiedData = Array.from(dataArray).filter((_, i) => i % 4 === 0);
      setAudioVisualizerData(simplifiedData);
      
      animationFrameRef.current = requestAnimationFrame(updateVisualization);
    };
    
    updateVisualization();
  };

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        
        // Create audio element for playback
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };
      
      // Start audio visualization
      visualizeAudio(stream);
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Stop visualization
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      setIsRecording(false);
      setAudioVisualizerData([]);
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) {
      setError('Please record audio first.');
      return;
    }

    setTranscribing(true);
    setError('');
    
    try {
      // Create form data to send to backend
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');
      
      const response = await fetch(`${API_URL}/transcribe`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      setTranscription(data.transcription);
    } catch (err) {
      console.error('Error transcribing audio:', err);
      setError(`Failed to transcribe audio: ${err.message}`);
    } finally {
      setTranscribing(false);
    }
  };

  const generateSignVideo = async () => {
    if (!transcription.trim()) {
      setError('Please transcribe audio first or enter text manually.');
      return;
    }
    
    setGenerating(true);
    setError('');
    setVideoUrl('');
    setContentHash('');
    setProcessingStatus('');
    
    try {
      // Encode the text as a URL parameter
      const params = new URLSearchParams({ text: transcription });
      
      const response = await fetch(`${API_URL}/video?${params}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'processing') {
        // Video is being generated in the background
        setContentHash(data.content_hash);
        setProcessingStatus('processing');
      } else if (data.video_path) {
        // Video was already cached
        setVideoUrl(`${API_URL}${data.video_path}`);
        setGenerating(false);
      }
    } catch (err) {
      console.error('Error generating sign language video:', err);
      setError(`Failed to generate video: ${err.message}`);
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`p-6 rounded-lg mb-8 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-blue-50 text-gray-800'}`}>
        <h1 className="text-2xl font-bold mb-2">Speech to Sign Language</h1>
        <p className="text-lg">
          Record your voice and convert it to sign language video.
        </p>
      </div>
      
      <div className={`p-6 rounded-lg mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'}`}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Record Audio</h2>
          
          <div className="flex flex-col gap-4 mb-6">
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
            
            {/* Audio Visualizer */}
            {isRecording && (
              <div className="h-24 bg-gray-900 rounded-lg p-2 flex items-center justify-center">
                <div className="flex items-end h-full w-full space-x-1">
                  {audioVisualizerData.map((value, index) => (
                    <div
                      key={index}
                      className="w-1 bg-blue-500"
                      style={{
                        height: `${Math.max(3, value / 2)}%`,
                        opacity: value / 255 + 0.2,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Audio Playback */}
            {audioUrl && (
              <div className="w-full">
                <audio 
                  ref={audioRef} 
                  src={audioUrl} 
                  controls 
                  className="w-full" 
                />
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
          onClick={transcribeAudio}
          disabled={!audioBlob || transcribing}
          className={`w-full px-4 py-3 rounded-lg text-white font-medium mb-6 ${
            !audioBlob || transcribing
              ? 'bg-gray-400 cursor-not-allowed'
              : theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          } transition`}
        >
          {transcribing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Transcribing...
            </span>
          ) : 'Transcribe Audio'}
        </button>
        
        {transcription && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Transcription</h2>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className="text-lg">{transcription}</p>
            </div>
            
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(transcription);
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
              
              <button
                onClick={() => {
                  setTranscription('');
                }}
                className={`px-4 py-2 rounded-lg ${
                  theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                } text-white transition flex items-center`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </div>
          </div>
        )}
        
        <button
          onClick={generateSignVideo}
          disabled={!transcription || generating}
          className={`w-full px-4 py-3 rounded-lg text-white font-medium ${
            !transcription || generating
              ? 'bg-gray-400 cursor-not-allowed'
              : theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
          } transition`}
        >
          {generating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Sign Language...
            </span>
          ) : 'Generate Sign Language Video'}
        </button>
      </div>
      
      {processingStatus === 'processing' && (
        <div className={`p-6 rounded-lg mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow'}`}>
          <div className="flex flex-col items-center justify-center">
            <svg className="animate-spin mb-4 h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg font-medium">Generating sign language video...</p>
            <p className="text-sm mt-2">This may take a few moments.</p>
          </div>
        </div>
      )}
      
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

export default SpeechToSign;