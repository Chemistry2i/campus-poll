// backend/controllers/accessibilityControllerWithDB.js
// Updated version with database persistence

const axios = require('axios');
const AccessibilitySettings = require('../models/AccessibilitySettings');

/**
 * Text-to-Speech Controller with Database
 * Uses Google Cloud Text-to-Speech API + MongoDB
 */

// Initialize Google Cloud TTS
const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();

/**
 * Convert text to speech audio
 * @route POST /api/accessibility/text-to-speech
 */
exports.textToSpeech = async (req, res) => {
  try {
    const { text, languageCode = 'en-US', voiceName = 'en-US-Neural2-A', speakingRate = 1.0 } = req.body;
    const userId = req.user.id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text exceeds maximum length of 5000 characters' });
    }

    const request = {
      input: { text },
      voice: { 
        languageCode,
        name: voiceName,
      },
      audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate,
        pitch: 0,
      },
    };

    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent;

    // Record TTS usage
    try {
      const settings = await AccessibilitySettings.findOne({ userId });
      if (settings) {
        await settings.recordTtsUsage();
      }
    } catch (dbError) {
      console.warn('Could not record TTS usage:', dbError.message);
    }

    res.status(200).json({
      success: true,
      audio: audioContent.toString('base64'),
      contentType: 'audio/mpeg',
    });
  } catch (error) {
    console.error('Text-to-Speech Error:', error);
    res.status(500).json({ 
      error: 'Failed to convert text to speech',
      details: error.message 
    });
  }
};

/**
 * Get available voices for Text-to-Speech
 * @route GET /api/accessibility/voices
 */
exports.getAvailableVoices = async (req, res) => {
  try {
    const request = {};
    const [response] = await client.listVoices(request);
    const voices = response.voices;

    const formattedVoices = voices.map(voice => ({
      name: voice.name,
      displayName: voice.ssmlGender + ' - ' + voice.name.split('-').slice(0, 2).join('-'),
      languageCode: voice.naturalLanguageCodes[0],
      ssmlGender: voice.ssmlGender,
    }));

    res.status(200).json({
      success: true,
      voices: formattedVoices,
    });
  } catch (error) {
    console.error('Get Voices Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch available voices',
      details: error.message 
    });
  }
};

/**
 * Speech-to-Text confirmation
 * @route POST /api/accessibility/speech-to-text-confirm
 */
exports.confirmTranscription = async (req, res) => {
  try {
    const { transcribedText, confidence } = req.body;
    const userId = req.user.id;

    if (!transcribedText) {
      return res.status(400).json({ error: 'Transcribed text is required' });
    }

    // Record STT usage
    try {
      const settings = await AccessibilitySettings.findOne({ userId });
      if (settings) {
        await settings.recordSttUsage();
      }
    } catch (dbError) {
      console.warn('Could not record STT usage:', dbError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Transcription confirmed',
      transcribedText,
      confidence,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Transcription Confirm Error:', error);
    res.status(500).json({ 
      error: 'Failed to confirm transcription',
      details: error.message 
    });
  }
};

/**
 * Get accessibility settings for user
 * @route GET /api/accessibility/settings/:userId
 */
exports.getAccessibilitySettings = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find or create settings
    let settings = await AccessibilitySettings.findOne({ userId });

    if (!settings) {
      settings = new AccessibilitySettings({ userId });
      await settings.save();
    }

    res.status(200).json({
      success: true,
      settings: settings.toJSON(),
    });
  } catch (error) {
    console.error('Get Accessibility Settings Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch accessibility settings',
      details: error.message 
    });
  }
};

/**
 * Update accessibility settings for user
 * @route PUT /api/accessibility/settings/:userId
 */
exports.updateAccessibilitySettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const settings = req.body;

    // Validate settings
    const validFontSizes = ['small', 'medium', 'large', 'xlarge'];
    const validSpeakingRates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

    if (settings.fontSize && !validFontSizes.includes(settings.fontSize)) {
      return res.status(400).json({ error: 'Invalid font size' });
    }

    if (settings.speakingRate && !validSpeakingRates.includes(settings.speakingRate)) {
      return res.status(400).json({ error: 'Invalid speaking rate' });
    }

    // Find and update
    let userSettings = await AccessibilitySettings.findOne({ userId });

    if (!userSettings) {
      userSettings = new AccessibilitySettings({ userId, ...settings });
    } else {
      Object.assign(userSettings, settings);
    }

    await userSettings.save();

    res.status(200).json({
      success: true,
      message: 'Accessibility settings updated',
      settings: userSettings.toJSON(),
    });
  } catch (error) {
    console.error('Update Accessibility Settings Error:', error);
    res.status(500).json({ 
      error: 'Failed to update accessibility settings',
      details: error.message 
    });
  }
};

/**
 * Get accessibility usage stats
 * @route GET /api/accessibility/stats/:userId
 */
exports.getUsageStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const settings = await AccessibilitySettings.findOne({ userId });

    if (!settings) {
      return res.status(404).json({ error: 'No accessibility settings found' });
    }

    const stats = settings.getUsageStats();

    res.status(200).json({
      success: true,
      stats,
      enabledFeatures: settings.getEnabledFeatures(),
    });
  } catch (error) {
    console.error('Get Usage Stats Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch usage statistics',
      details: error.message 
    });
  }
};

/**
 * Get all enabled features for user
 * @route GET /api/accessibility/features/:userId
 */
exports.getEnabledFeatures = async (req, res) => {
  try {
    const { userId } = req.params;

    const settings = await AccessibilitySettings.findOne({ userId });

    if (!settings) {
      return res.status(404).json({ error: 'No accessibility settings found' });
    }

    res.status(200).json({
      success: true,
      features: settings.getEnabledFeatures(),
      hasAccessibilityNeeds: settings.hasAccessibilityNeeds,
    });
  } catch (error) {
    console.error('Get Enabled Features Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch enabled features',
      details: error.message 
    });
  }
};

/**
 * Reset settings to defaults
 * @route POST /api/accessibility/reset/:userId
 */
exports.resetSettings = async (req, res) => {
  try {
    const { userId } = req.params;

    let settings = await AccessibilitySettings.findOne({ userId });

    if (!settings) {
      settings = new AccessibilitySettings({ userId });
    }

    // Reset to defaults
    settings.ttsEnabled = false;
    settings.sttEnabled = false;
    settings.fontSize = 'medium';
    settings.highContrast = false;
    settings.boldText = false;
    settings.reduceAnimations = false;
    settings.screenReaderOptimized = false;
    settings.simplifiedUI = false;
    settings.captionsEnabled = true;
    settings.speakingRate = 1.0;
    settings.preferredVoice = 'en-US-Neural2-A';

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Settings reset to defaults',
      settings: settings.toJSON(),
    });
  } catch (error) {
    console.error('Reset Settings Error:', error);
    res.status(500).json({ 
      error: 'Failed to reset settings',
      details: error.message 
    });
  }
};

/**
 * Health check
 * @route GET /api/accessibility/health
 */
exports.healthCheck = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Accessibility service is healthy',
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Accessibility service health check failed',
      details: error.message 
    });
  }
};
