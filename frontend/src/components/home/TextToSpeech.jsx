// TextToSpeech.jsx
import React, { useState } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';
import "./home.css";

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const { speak, voices } = useSpeechSynthesis();
  const [voiceIndex, setVoiceIndex] = useState(0);

  const handleSpeak = () => {
    speak({ text, voice: voices[voiceIndex] });
  };

  return (
    <div>
      <h2>Text to Speech</h2>
      <textarea
        rows="4"
        cols="50"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text here..."
      />
      <div>
        <label htmlFor="voice">Voice: </label>
        <select
          id="voice"
          onChange={(e) => setVoiceIndex(e.target.value)}
        >
          {voices.map((voice, index) => (
            <option key={`${voice.name}-${index}`} value={index}>
              {`${voice.lang} - ${voice.name}`}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleSpeak}>Speak</button>
    </div>
  );
};

export default TextToSpeech;
