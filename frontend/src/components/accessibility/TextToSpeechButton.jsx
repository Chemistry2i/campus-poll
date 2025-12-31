// frontend/src/components/accessibility/TextToSpeechButton.jsx

import React, { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { FaVolumeUp, FaVolumeMute, FaSpinner } from 'react-icons/fa';
import './TextToSpeechButton.css';

const TextToSpeechButton = ({ 
  text, 
  label = 'Listen', 
  className = '',
  ariaLabel = 'Read aloud',
  speakingRate = null,
  voiceName = null,
  compact = false,
}) => {
  const { speak, stopSpeaking, currentlySpeaking, settings } = useAccessibility();
  const [error, setError] = useState(null);

  if (!settings.ttsEnabled) {
    return null;
  }

  const isCurrentlySpeaking = currentlySpeaking?.text === text;

  const handleClick = async () => {
    if (isCurrentlySpeaking) {
      stopSpeaking();
    } else {
      try {
        setError(null);
        await speak(text, { speakingRate, voiceName });
      } catch (err) {
        setError('Failed to play audio');
        console.error(err);
      }
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        className={`tts-button-compact ${isCurrentlySpeaking ? 'playing' : ''} ${className}`}
        aria-label={ariaLabel}
        title={isCurrentlySpeaking ? 'Stop' : 'Listen'}
        disabled={currentlySpeaking?.status === 'loading'}
      >
        {currentlySpeaking?.status === 'loading' ? (
          <FaSpinner className="spinner" />
        ) : isCurrentlySpeaking ? (
          <FaVolumeMute />
        ) : (
          <FaVolumeUp />
        )}
      </button>
    );
  }

  return (
    <div className={`tts-button-container ${className}`}>
      <button
        onClick={handleClick}
        className={`tts-button ${isCurrentlySpeaking ? 'playing' : ''}`}
        aria-label={ariaLabel}
        disabled={currentlySpeaking?.status === 'loading'}
      >
        {currentlySpeaking?.status === 'loading' ? (
          <>
            <FaSpinner className="spinner" />
            <span>Loading audio...</span>
          </>
        ) : isCurrentlySpeaking ? (
          <>
            <FaVolumeMute />
            <span>Stop</span>
          </>
        ) : (
          <>
            <FaVolumeUp />
            <span>{label}</span>
          </>
        )}
      </button>
      {error && <span className="tts-error">{error}</span>}
    </div>
  );
};

export default TextToSpeechButton;
