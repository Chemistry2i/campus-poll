// frontend/src/components/accessibility/SpeechToTextButton.jsx

import React, { useState, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { FaMicrophone, FaStop, FaCheckCircle, FaTimes } from 'react-icons/fa';
import './SpeechToTextButton.css';

const SpeechToTextButton = ({ 
  onTranscriptComplete,
  label = 'Speak',
  className = '',
  ariaLabel = 'Start listening',
  compact = false,
  continuous = false,
  interimResults = true,
}) => {
  const { startListening, stopListening, settings, sttSupported, confirmTranscription } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const recognitionRef = useRef(null);

  if (!settings.sttEnabled || !sttSupported) {
    return null;
  }

  const handleStartListening = () => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setShowConfirmation(false);
    setIsListening(true);

    recognitionRef.current = startListening({
      continuous,
      interimResults,
      onResult: (result) => {
        setInterimTranscript(result.interimTranscript);
        if (result.isFinal) {
          setTranscript(result.finalTranscript);
        }
      },
      onError: (error) => {
        setError(`Error: ${error}`);
        setIsListening(false);
      },
      onEnd: (finalTranscript) => {
        setIsListening(false);
        setTranscript(finalTranscript);
        if (finalTranscript && !continuous) {
          setShowConfirmation(true);
        }
        if (onTranscriptComplete && finalTranscript) {
          onTranscriptComplete(finalTranscript);
        }
      },
    });
  };

  const handleStopListening = () => {
    stopListening(recognitionRef.current);
    setIsListening(false);
    if (transcript) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmTranscript = async () => {
    try {
      await confirmTranscription(transcript);
      setShowConfirmation(false);
      if (onTranscriptComplete) {
        onTranscriptComplete(transcript);
      }
      // Reset after confirmation
      setTimeout(() => {
        setTranscript('');
        setInterimTranscript('');
      }, 1000);
    } catch (err) {
      setError('Failed to confirm transcription');
      console.error(err);
    }
  };

  const handleCancelTranscript = () => {
    setShowConfirmation(false);
    setTranscript('');
    setInterimTranscript('');
  };

  if (compact) {
    return (
      <button
        onClick={isListening ? handleStopListening : handleStartListening}
        className={`stt-button-compact ${isListening ? 'listening' : ''} ${className}`}
        aria-label={ariaLabel}
        title={isListening ? 'Stop listening' : 'Start listening'}
      >
        {isListening ? <FaStop /> : <FaMicrophone />}
      </button>
    );
  }

  return (
    <div className={`stt-button-container ${className}`}>
      {showConfirmation && transcript && (
        <div className="stt-confirmation-modal">
          <div className="stt-confirmation-content">
            <h4>Confirm Transcription</h4>
            <p className="stt-transcript-display">"{transcript}"</p>
            <div className="stt-confirmation-actions">
              <button
                className="stt-confirm-btn"
                onClick={handleConfirmTranscript}
                aria-label="Confirm transcription"
              >
                <FaCheckCircle /> Confirm
              </button>
              <button
                className="stt-cancel-btn"
                onClick={handleCancelTranscript}
                aria-label="Cancel transcription"
              >
                <FaTimes /> Retry
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={isListening ? handleStopListening : handleStartListening}
        className={`stt-button ${isListening ? 'listening' : ''}`}
        aria-label={ariaLabel}
        aria-pressed={isListening}
      >
        {isListening ? (
          <>
            <FaStop className="icon-spinning" />
            <span>Stop Listening</span>
          </>
        ) : (
          <>
            <FaMicrophone />
            <span>{label}</span>
          </>
        )}
      </button>

      {isListening && (interimTranscript || transcript) && (
        <div className="stt-live-transcript">
          {transcript && <p className="stt-final">{transcript}</p>}
          {interimTranscript && <p className="stt-interim">{interimTranscript}</p>}
        </div>
      )}

      {error && <span className="stt-error">{error}</span>}
    </div>
  );
};

export default SpeechToTextButton;
