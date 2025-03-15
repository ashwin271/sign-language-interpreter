import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

const SpeechToVideo = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isRecording) {
      startAudioVisualization();
    } else {
      stopAudioVisualization();
    }
  }, [isRecording]);

  const startAudioVisualization = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;
    const bufferLength = analyserRef.current.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);

    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      setAudioData(audioBlob);
      audioChunksRef.current = [];

      // Simulating a backend response with a sample video URL
      setTimeout(() => {
        setVideoUrl('https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4');
      }, 2000);
    };
    mediaRecorderRef.current.start();

    drawFrequency();
  };

  const stopAudioVisualization = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const drawFrequency = () => {
    const canvas = document.getElementById('frequencyCanvas');
    const canvasCtx = canvas.getContext('2d');

    const draw = () => {
      if (!isRecording) return;

      requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      canvasCtx.fillStyle = 'rgb(200, 200, 200)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArrayRef.current.length) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        barHeight = dataArrayRef.current[i];
        canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }
    };

    draw();
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleBackClick = () => {
    navigate('/home');
  };

  return (
    <div className="speech-to-video-container">
      <h2>Speech to Video</h2>
      <div className="controls">
        <button onClick={handleStartRecording} disabled={isRecording}>
          Start Recording
        </button>
        <button onClick={handleStopRecording} disabled={!isRecording}>
          Stop Recording
        </button>
        <button onClick={handleBackClick}>Back</button>
      </div>
      <canvas id="frequencyCanvas" width="600" height="200"></canvas>

      {videoUrl && (
        <div className="video-output">
          <h3>Generated Video</h3>
          <video src={videoUrl} controls width="600"></video>
          <p className="video-url-box">Video URL: <a href={videoUrl} target="_blank" rel="noopener noreferrer">{videoUrl}</a></p>
        </div>
      )}
    </div>
  );
};

export default SpeechToVideo;
