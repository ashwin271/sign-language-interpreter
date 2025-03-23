import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/common/Layout';
import Home from './components/home/Home';
import SignToText from './components/features/SignToText';
import SignToSpeech from './components/features/SignToSpeech';
import TextToSign from './components/features/TextToSign';
import SpeechToSign from './components/features/SpeechToSign';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-to-text" element={<SignToText />} />
            <Route path="/sign-to-speech" element={<SignToSpeech />} />
            <Route path="/text-to-sign" element={<TextToSign />} />
            <Route path="/speech-to-sign" element={<SpeechToSign />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;