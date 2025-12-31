// backend/controllers/accessibilityController.js

const axios = require('axios');

/**
 * Text-to-Speech Controller
 * Uses Google Cloud Text-to-Speech API
 */

// Initialize Google Cloud TTS (lazy, so missing creds don't crash startup)
const textToSpeech = require('@google-cloud/text-to-speech');
let cachedClient = null;

const hasGoogleCreds = () => {
  return Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT
  );
};

const getClient = () => {
  if (cachedClient) return cachedClient;
  cachedClient = new textToSpeech.TextToSpeechClient();
  return cachedClient;
};

/**
 * Convert text to speech audio
 * @route POST /api/accessibility/text-to-speech
 */
exports.textToSpeech = async (req, res) => {
  try {
    const { text, languageCode = 'en-US', voiceName = 'en-US-Neural2-A', speakingRate = 1.0 } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Check text length (Google Cloud limit: 5000 characters)
    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text exceeds maximum length of 5000 characters' });
    }

    if (!hasGoogleCreds()) {
      return res.status(503).json({
        error: 'Text-to-Speech is not configured. Set GOOGLE_APPLICATION_CREDENTIALS or Google Cloud project credentials.',
      });
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

    const ttsClient = getClient();
    const [response] = await ttsClient.synthesizeSpeech(request);
    const audioContent = response.audioContent;

    // Send audio as base64
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
    if (!hasGoogleCreds()) {
      return res.status(200).json({
        success: false,
        voices: [],
        message: 'Google Cloud credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS to enable voice listing.',
      });
    }

    const request = {};
    const ttsClient = getClient();
    const [response] = await ttsClient.listVoices(request);
    const voices = response.voices;

    // Format voices for frontend
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
 * Browser-based Speech-to-Text (client-side)
 * This endpoint validates and processes the transcribed text
 * @route POST /api/accessibility/speech-to-text-confirm
 */
exports.confirmTranscription = async (req, res) => {
  try {
    const { transcribedText, confidence, originalContext } = req.body;

    if (!transcribedText) {
      return res.status(400).json({ error: 'Transcribed text is required' });
    }

    // Here you can add validation, logging, or further processing
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
    
    // Default settings if user doesn't have custom preferences
    const defaultSettings = {
      ttsEnabled: true,
      sttEnabled: true,
      fontSize: 'medium', // small, medium, large, xlarge
      highContrast: false,
      speakingRate: 1.0,
      preferredVoice: 'en-US-Neural2-A',
      screenReaderOptimized: false,
      simplifiedUI: false,
      boldText: false,
      reduceAnimations: false,
      captionsEnabled: true,
    };

    // TODO: Fetch from database if settings are saved
    // For now, return defaults
    res.status(200).json({
      success: true,
      settings: defaultSettings,
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

    // TODO: Save to database
    // For now, return the updated settings
    res.status(200).json({
      success: true,
      message: 'Accessibility settings updated',
      settings,
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
 * Health check for accessibility service
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
