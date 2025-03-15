import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReactMic } from 'react-mic';
import "./home.css";

const AudioToText = () => {
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleAudioUpload = async (file) => {
    if (file) {
      setIsLoading(true);
      setOutputText("Processing your audio file...");

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:8000/transcribe', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to transcribe audio');
        }

        const data = await response.json();
        setOutputText(data.transcription);
      } catch (error) {
        console.error('Error:', error);
        setOutputText("Error processing audio file. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const onData = (recordedBlob) => {
    console.log('Received chunk of real-time data:', recordedBlob);
  };

  const onStop = (recordedBlob) => {
    console.log('Recorded Blob:', recordedBlob);
    handleAudioUpload(recordedBlob.blob);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleAudioUpload(file);
  };

  return (
    <div className="page-container">
      <nav className="nav-bar">
        <button onClick={() => navigate("/home")} className="back-button">
          Back
        </button>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </nav>
      <div className="content-area">
        <h1>Audio to Text Converter</h1>
        <div className="upload-section">
          <label htmlFor="audio-upload" className="upload-button">
            {isLoading ? "Processing..." : "Upload Audio File"}
          </label>
          <input
            id="audio-upload"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            disabled={isLoading}
          />
        </div>
        <div className="recording-section">
          <ReactMic
            record={isRecording}
            className="sound-wave"
            onStop={onStop}
            onData={onData}
            strokeColor="#000000"
            backgroundColor="#FF4081"
          />
          <div className="recording-controls">
            <button onClick={startRecording} disabled={isRecording}>
              Start Recording
            </button>
            <button onClick={stopRecording} disabled={!isRecording}>
              Stop Recording
            </button>
          </div>
        </div>
        <div className="output-area">
          {outputText ? (
            <p>{outputText}</p>
          ) : (
            <p>No output yet. Upload an audio file or record to convert.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioToText;
