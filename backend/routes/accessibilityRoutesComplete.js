// backend/routes/accessibilityRoutesComplete.js
// Complete routes with database persistence

const express = require('express');
const router = express.Router();
const accessibilityController = require('../controllers/accessibilityControllerWithDB');
const { protect } = require('../middleware/authMiddleware');

/**
 * Public Routes (no auth required)
 */

// Health check
router.get('/health', accessibilityController.healthCheck);

// Get available voices for TTS
router.get('/voices', accessibilityController.getAvailableVoices);

/**
 * Protected Routes (auth required)
 */

// Text-to-Speech conversion
router.post('/text-to-speech', protect, accessibilityController.textToSpeech);

// Speech-to-Text confirmation
router.post('/speech-to-text-confirm', protect, accessibilityController.confirmTranscription);

// Get user's accessibility settings
router.get('/settings/:userId', protect, accessibilityController.getAccessibilitySettings);

// Update user's accessibility settings
router.put('/settings/:userId', protect, accessibilityController.updateAccessibilitySettings);

// Reset settings to defaults
router.post('/reset/:userId', protect, accessibilityController.resetSettings);

// Get usage statistics
router.get('/stats/:userId', protect, accessibilityController.getUsageStats);

// Get enabled features
router.get('/features/:userId', protect, accessibilityController.getEnabledFeatures);

module.exports = router;
