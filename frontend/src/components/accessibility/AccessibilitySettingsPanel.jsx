// frontend/src/components/accessibility/AccessibilitySettingsPanel.jsx

import React, { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { FaSlidersH, FaTimes, FaVolumeUp, FaMicrophone, FaEye, FaFont, FaWheelchair } from 'react-icons/fa';
import './AccessibilitySettingsPanel.css';

const AccessibilitySettingsPanel = () => {
  const { settings, updateSettings, availableVoices, sttSupported } = useAccessibility();
  const [showPanel, setShowPanel] = useState(false);

  const fontSizes = [
    { label: 'Small', value: 'small', pixels: 12 },
    { label: 'Medium', value: 'medium', pixels: 16 },
    { label: 'Large', value: 'large', pixels: 18 },
    { label: 'X-Large', value: 'xlarge', pixels: 20 },
  ];

  const speakingRates = [
    { label: '0.5x Slow', value: 0.5 },
    { label: '0.75x Slower', value: 0.75 },
    { label: 'Normal', value: 1.0 },
    { label: '1.25x Faster', value: 1.25 },
    { label: '1.5x Very Fast', value: 1.5 },
    { label: '2.0x Slowest', value: 2.0 },
  ];

  const handleToggleSetting = (setting) => {
    updateSettings({ [setting]: !settings[setting] });
  };

  const handleSettingChange = (setting, value) => {
    updateSettings({ [setting]: value });
  };

  const resetToDefaults = () => {
    updateSettings({
      ttsEnabled: false,
      sttEnabled: false,
      fontSize: 'medium',
      highContrast: false,
      speakingRate: 1.0,
      screenReaderOptimized: false,
      simplifiedUI: false,
      boldText: false,
      reduceAnimations: false,
      captionsEnabled: true,
    });
  };

  return (
    <>
      {/* Accessibility Toggle Button */}
      <button
        className="accessibility-toggle-btn"
        onClick={() => setShowPanel(!showPanel)}
        aria-label="Open accessibility settings"
        title="Accessibility Settings"
      >
        <FaWheelchair />
        <span className="sr-only">Accessibility Settings</span>
      </button>

      {/* Settings Panel */}
      {showPanel && (
        <div className="accessibility-panel" role="dialog" aria-label="Accessibility Settings">
          <div className="accessibility-panel-header">
            <h2>
              <FaSlidersH /> Accessibility Settings
            </h2>
            <button
              className="close-btn"
              onClick={() => setShowPanel(false)}
              aria-label="Close accessibility settings"
            >
              <FaTimes />
            </button>
          </div>

          <div className="accessibility-panel-content">
            {/* Text-to-Speech Section */}
            <section className="accessibility-section">
              <div className="section-header">
                <FaVolumeUp className="section-icon" />
                <h3>Text-to-Speech (TTS)</h3>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.ttsEnabled}
                    onChange={() => handleToggleSetting('ttsEnabled')}
                    aria-label="Enable text-to-speech"
                  />
                  <span>Enable Text-to-Speech</span>
                </label>
              </div>

              {settings.ttsEnabled && (
                <>
                  <div className="setting-group">
                    <label htmlFor="voice-select">Preferred Voice:</label>
                    <select
                      id="voice-select"
                      value={settings.preferredVoice}
                      onChange={(e) => handleSettingChange('preferredVoice', e.target.value)}
                      aria-label="Select voice"
                    >
                      {availableVoices.map(voice => (
                        <option key={voice.name} value={voice.name}>
                          {voice.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="setting-group">
                    <label htmlFor="speaking-rate">Speaking Rate:</label>
                    <select
                      id="speaking-rate"
                      value={settings.speakingRate}
                      onChange={(e) => handleSettingChange('speakingRate', parseFloat(e.target.value))}
                      aria-label="Select speaking rate"
                    >
                      {speakingRates.map(rate => (
                        <option key={rate.value} value={rate.value}>
                          {rate.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </section>

            {/* Speech-to-Text Section */}
            {sttSupported && (
              <section className="accessibility-section">
                <div className="section-header">
                  <FaMicrophone className="section-icon" />
                  <h3>Speech-to-Text (STT)</h3>
                </div>

                <div className="setting-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.sttEnabled}
                      onChange={() => handleToggleSetting('sttEnabled')}
                      aria-label="Enable speech-to-text"
                    />
                    <span>Enable Speech-to-Text</span>
                  </label>
                  <p className="setting-description">
                    Use voice input for voting and navigation
                  </p>
                </div>
              </section>
            )}

            {/* Visual Settings Section */}
            <section className="accessibility-section">
              <div className="section-header">
                <FaEye className="section-icon" />
                <h3>Visual Settings</h3>
              </div>

              <div className="setting-group">
                <label htmlFor="font-size">Font Size:</label>
                <div className="font-size-buttons">
                  {fontSizes.map(size => (
                    <button
                      key={size.value}
                      className={`font-size-btn ${settings.fontSize === size.value ? 'active' : ''}`}
                      onClick={() => handleSettingChange('fontSize', size.value)}
                      style={{ fontSize: `${size.pixels}px` }}
                      aria-label={`Font size ${size.label}`}
                      aria-pressed={settings.fontSize === size.value}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={() => handleToggleSetting('highContrast')}
                    aria-label="Enable high contrast mode"
                  />
                  <span>High Contrast Mode</span>
                </label>
                <p className="setting-description">
                  Increases contrast for better visibility
                </p>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.boldText}
                    onChange={() => handleToggleSetting('boldText')}
                    aria-label="Enable bold text"
                  />
                  <span>Bold Text</span>
                </label>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.reduceAnimations}
                    onChange={() => handleToggleSetting('reduceAnimations')}
                    aria-label="Reduce animations"
                  />
                  <span>Reduce Animations</span>
                </label>
                <p className="setting-description">
                  Minimizes motion effects
                </p>
              </div>
            </section>

            {/* Screen Reader & UI Settings */}
            <section className="accessibility-section">
              <div className="section-header">
                <FaFont className="section-icon" />
                <h3>Other Settings</h3>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.screenReaderOptimized}
                    onChange={() => handleToggleSetting('screenReaderOptimized')}
                    aria-label="Optimize for screen reader"
                  />
                  <span>Screen Reader Optimized</span>
                </label>
                <p className="setting-description">
                  Better compatibility with screen readers
                </p>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.simplifiedUI}
                    onChange={() => handleToggleSetting('simplifiedUI')}
                    aria-label="Enable simplified UI"
                  />
                  <span>Simplified UI</span>
                </label>
                <p className="setting-description">
                  Reduces visual clutter and complexity
                </p>
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.captionsEnabled}
                    onChange={() => handleToggleSetting('captionsEnabled')}
                    aria-label="Enable captions"
                  />
                  <span>Captions & Transcripts</span>
                </label>
              </div>
            </section>
          </div>

          <div className="accessibility-panel-footer">
            <button
              className="reset-btn"
              onClick={resetToDefaults}
              aria-label="Reset to default settings"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close panel */}
      {showPanel && (
        <div
          className="accessibility-panel-overlay"
          onClick={() => setShowPanel(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default AccessibilitySettingsPanel;
