// frontend/src/context/AccessibilityContext.jsx

import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    ttsEnabled: false,
    sttEnabled: false,
    fontSize: 'medium',
    highContrast: false,
    speakingRate: 1.0,
    preferredVoice: 'en-US-Neural2-A',
    screenReaderOptimized: false,
    simplifiedUI: false,
    boldText: false,
    reduceAnimations: false,
    captionsEnabled: true,
  });

  const [isListening, setIsListening] = useState(false);
  const [currentlySpeaking, setCurrentlySpeaking] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [sttSupported, setSttSupported] = useState(false);

  // Check for browser STT support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSttSupported(!!SpeechRecognition);

    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Fetch available voices
    fetchAvailableVoices();
  }, []);

  // Fetch available voices from backend
  const fetchAvailableVoices = async () => {
    try {
      const response = await axios.get('/api/accessibility/voices');
      if (response.data.success) {
        setAvailableVoices(response.data.voices);
      }
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      // Fallback voices if API fails
      setAvailableVoices([
        { name: 'en-US-Neural2-A', displayName: 'Female - US English' },
        { name: 'en-US-Neural2-C', displayName: 'Male - US English' },
      ]);
    }
  };

  // Update settings and save to localStorage
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('accessibilitySettings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Text-to-Speech function
  const speak = useCallback(async (text, options = {}) => {
    if (!settings.ttsEnabled) {
      console.warn('TTS is disabled');
      return;
    }

    try {
      setCurrentlySpeaking({ text, status: 'loading' });

      const speakingRate = options.speakingRate || settings.speakingRate;
      const voiceName = options.voiceName || settings.preferredVoice;

      const response = await axios.post('/api/accessibility/text-to-speech', {
        text,
        languageCode: 'en-US',
        voiceName,
        speakingRate,
      });

      if (response.data.success) {
        // Create audio element and play
        const audio = new Audio(`data:${response.data.contentType};base64,${response.data.audio}`);
        audio.onplay = () => setCurrentlySpeaking({ text, status: 'playing' });
        audio.onend = () => setCurrentlySpeaking(null);
        audio.onerror = () => setCurrentlySpeaking({ text, status: 'error' });
        audio.play();

        return audio;
      }
    } catch (error) {
      console.error('Text-to-Speech Error:', error);
      setCurrentlySpeaking({ text, status: 'error' });
      throw error;
    }
  }, [settings]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    // Stop Web Audio API playback
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    setCurrentlySpeaking(null);
  }, []);

  // Speech-to-Text function
  const startListening = useCallback((options = {}) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser');
      return null;
    }

    if (!settings.sttEnabled) {
      console.warn('STT is disabled');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = options.continuous || false;
    recognition.interimResults = options.interimResults || true;
    recognition.language = options.language || 'en-US';

    let interimTranscript = '';
    let finalTranscript = '';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Call callback with interim and final results
      if (options.onResult) {
        options.onResult({
          interimTranscript,
          finalTranscript: finalTranscript.trim(),
          isFinal: event.results[event.results.length - 1].isFinal,
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech Recognition Error:', event.error);
      if (options.onError) {
        options.onError(event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (options.onEnd) {
        options.onEnd(finalTranscript.trim());
      }
    };

    recognition.start();
    return recognition;
  }, [settings]);

  // Stop listening
  const stopListening = useCallback((recognition) => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  }, []);

  // Confirm transcription with backend
  const confirmTranscription = useCallback(async (transcribedText, confidence = 0.9) => {
    try {
      const response = await axios.post('/api/accessibility/speech-to-text-confirm', {
        transcribedText,
        confidence,
        timestamp: new Date(),
      });
      return response.data;
    } catch (error) {
      console.error('Transcription Confirmation Error:', error);
      throw error;
    }
  }, []);

  const value = {
    settings,
    updateSettings,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    confirmTranscription,
    isListening,
    currentlySpeaking,
    sttSupported,
    availableVoices,
    fetchAvailableVoices,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Custom hook to use accessibility context
export const useAccessibility = () => {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
