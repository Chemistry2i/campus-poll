// backend/models/AccessibilitySettings.js

const mongoose = require('mongoose');

const accessibilitySettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    
    // Text-to-Speech Settings
    ttsEnabled: {
      type: Boolean,
      default: false,
    },
    preferredVoice: {
      type: String,
      default: 'en-US-Neural2-A',
      enum: [
        'en-US-Neural2-A',
        'en-US-Neural2-C',
        'en-US-Neural2-E',
        'en-US-Neural2-F',
        'en-US-Standard-A',
        'en-US-Standard-B',
        'en-US-Standard-C',
        'en-US-Standard-D',
        'en-US-Standard-E',
        'en-US-Standard-F',
      ],
    },
    speakingRate: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 2.0,
    },
    
    // Speech-to-Text Settings
    sttEnabled: {
      type: Boolean,
      default: false,
    },
    sttLanguage: {
      type: String,
      default: 'en-US',
    },
    
    // Visual Settings
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'xlarge'],
      default: 'medium',
    },
    highContrast: {
      type: Boolean,
      default: false,
    },
    boldText: {
      type: Boolean,
      default: false,
    },
    reduceAnimations: {
      type: Boolean,
      default: false,
    },
    
    // UI/UX Settings
    screenReaderOptimized: {
      type: Boolean,
      default: false,
    },
    simplifiedUI: {
      type: Boolean,
      default: false,
    },
    captionsEnabled: {
      type: Boolean,
      default: true,
    },
    
    // Preferences
    autoPlayAudio: {
      type: Boolean,
      default: false,
    },
    enableVoiceVoting: {
      type: Boolean,
      default: false,
    },
    voiceVotingConfirmation: {
      type: Boolean,
      default: true,
    },
    
    // Accessibility usage stats
    totalTtsRequests: {
      type: Number,
      default: 0,
    },
    totalSttRequests: {
      type: Number,
      default: 0,
    },
    lastTtsUsed: {
      type: Date,
      default: null,
    },
    lastSttUsed: {
      type: Date,
      default: null,
    },
    
    // Metadata
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to update lastTtsUsed when TTS is used
accessibilitySettingsSchema.methods.recordTtsUsage = function() {
  this.totalTtsRequests += 1;
  this.lastTtsUsed = new Date();
  return this.save();
};

// Middleware to update lastSttUsed when STT is used
accessibilitySettingsSchema.methods.recordSttUsage = function() {
  this.totalSttRequests += 1;
  this.lastSttUsed = new Date();
  return this.save();
};

// Get summary stats
accessibilitySettingsSchema.methods.getUsageStats = function() {
  return {
    totalTtsRequests: this.totalTtsRequests,
    totalSttRequests: this.totalSttRequests,
    lastTtsUsed: this.lastTtsUsed,
    lastSttUsed: this.lastSttUsed,
    totalRequests: this.totalTtsRequests + this.totalSttRequests,
  };
};

// Get enabled features
accessibilitySettingsSchema.methods.getEnabledFeatures = function() {
  return {
    tts: this.ttsEnabled,
    stt: this.sttEnabled,
    voiceVoting: this.enableVoiceVoting,
    highContrast: this.highContrast,
    screenReaderOptimized: this.screenReaderOptimized,
    simplifiedUI: this.simplifiedUI,
  };
};

// Virtual for active accessibility needs
accessibilitySettingsSchema.virtual('hasAccessibilityNeeds').get(function() {
  return (
    this.ttsEnabled ||
    this.sttEnabled ||
    this.highContrast ||
    this.boldText ||
    this.reduceAnimations ||
    this.screenReaderOptimized ||
    this.simplifiedUI ||
    this.fontSize !== 'medium'
  );
});

// Ensure virtuals are included in JSON
accessibilitySettingsSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('AccessibilitySettings', accessibilitySettingsSchema);
