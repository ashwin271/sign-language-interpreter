import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

const VideoToSpeech = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();

  // Handle video upload
  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideoFile(URL.createObjectURL(file));
    }
  };

  // Start recording video using webcam
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    videoRef.current.play();

    mediaRecorderRef.current = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: "video/mp4" });
      setRecordedVideo(URL.createObjectURL(blob));
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
  };

  // Simulate generating an audio file (backend integration placeholder)
  const generateAudioFile = () => {
    setTimeout(() => {
      setAudioFile("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"); // Placeholder URL
    }, 2000);
  };

  return (
    <div className="video-to-speech-container">
      <h2>Video to Speech</h2>

      {/* Upload Button */}
      <div className="upload-section">
        <input type="file" id="videoUpload" accept="video/*" onChange={handleVideoUpload} />
      </div>

      {/* Record Button */}
      <div className="record-section">
        <button onClick={startRecording} disabled={isRecording}>Record</button>
      </div>

      {/* Live Video Display */}
      <div className="video-box">
        {isRecording ? (
          <video ref={videoRef} width="500" autoPlay muted></video>
        ) : (
          recordedVideo ? <video src={recordedVideo} controls width="500"></video> :
          videoFile ? <video src={videoFile} controls width="500"></video> :
          <div className="placeholder">Display Video (Live)</div>
        )}
      </div>

      {/* Stop Button */}
      <div className="stop-section">
        <button onClick={stopRecording} disabled={!isRecording}>Stop</button>
      </div>

      {/* Voice Output Box */}
      <div className="voice-output">
        <button onClick={generateAudioFile} disabled={audioFile !== null}>Generate Voice</button>
        {audioFile && (
          <div>
            <h3>Voice Output</h3>
            <audio controls src={audioFile}></audio>
            <a href={audioFile} download="generated_audio.mp3">
              <button>Download</button>
            </a>
          </div>
        )}
      </div>

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate("/home")}>Back</button>
    </div>
  );
};

export default VideoToSpeech;
