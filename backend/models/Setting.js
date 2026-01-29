const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  general: {
    siteName: { type: String, default: 'Campus Ballot' },
    siteLogo: { type: String, default: '' }
  },
  emailSettings: {
    smtpServer: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    senderEmail: { type: String, default: '' },
    username: { type: String, default: '' },
    password: { type: String, default: '' },
    tlsEnabled: { type: Boolean, default: true }
  },
  smsSettings: {
    enabled: { type: Boolean, default: false },
    provider: { type: String, default: 'twilio' },
    accountSid: { type: String, default: '' },
    authToken: { type: String, default: '' },
    phoneNumber: { type: String, default: '' }
  },
  systemParameters: {
    electionTimeout: { type: Number, default: 24 }, // hours
    votingStartTime: { type: String, default: '08:00' },
    votingEndTime: { type: String, default: '17:00' },
    maxLoginAttempts: { type: Number, default: 5 },
    passwordExpiryDays: { type: Number, default: 90 },
    maintenanceMode: { type: Boolean, default: false }
  },
  featureToggles: {
    enableVotingNotifications: { type: Boolean, default: true },
    enableCandidateApproval: { type: Boolean, default: true },
    enableResultsPublication: { type: Boolean, default: true },
    enableCandidateComparison: { type: Boolean, default: true },
    enableVoteReceipts: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Ensure a single-document collection behaviour is easy to query (we'll keep just one document)
const Setting = mongoose.model('Setting', settingsSchema);
module.exports = Setting;
