// ACCESSIBILITY INTEGRATION GUIDE

## Overview
This guide explains how to integrate accessibility features (Text-to-Speech, Speech-to-Text) into your campus ballot application.

## Components Created

### 1. **Backend (Node.js)**

#### Controller: `accessibilityController.js`
- `textToSpeech()` - Converts text to audio using Google Cloud TTS
- `getAvailableVoices()` - Lists available TTS voices
- `confirmTranscription()` - Confirms STT transcription
- `getAccessibilitySettings()` - Retrieves user accessibility preferences
- `updateAccessibilitySettings()` - Saves user preferences

#### Routes: `accessibilityRoutes.js`
```
POST   /api/accessibility/text-to-speech        (protected)
GET    /api/accessibility/voices                 (public)
POST   /api/accessibility/speech-to-text-confirm (protected)
GET    /api/accessibility/settings/:userId       (protected)
PUT    /api/accessibility/settings/:userId       (protected)
GET    /api/accessibility/health                 (public)
```

### 2. **Frontend (React)**

#### Context: `AccessibilityContext.jsx`
Provides:
- `settings` - User's accessibility settings
- `updateSettings()` - Update settings
- `speak()` - Text-to-Speech function
- `stopSpeaking()` - Stop audio playback
- `startListening()` - Start speech recognition
- `stopListening()` - Stop speech recognition
- `confirmTranscription()` - Confirm transcribed text
- `isListening` - Current listening state
- `currentlySpeaking` - Current speaking state
- `sttSupported` - Browser STT support check
- `availableVoices` - List of available voices

#### Components

**TextToSpeechButton.jsx**
```jsx
import TextToSpeechButton from './components/accessibility/TextToSpeechButton';

<TextToSpeechButton 
  text="Candidate bio text here"
  label="Listen to Bio"
  compact={true}
/>
```

**SpeechToTextButton.jsx**
```jsx
import SpeechToTextButton from './components/accessibility/SpeechToTextButton';

<SpeechToTextButton 
  label="Vote by Voice"
  onTranscriptComplete={(transcript) => {
    console.log('User said:', transcript);
  }}
  compact={false}
/>
```

**AccessibilitySettingsPanel.jsx**
```jsx
import AccessibilitySettingsPanel from './components/accessibility/AccessibilitySettingsPanel';

// Add to your header/navbar
<AccessibilitySettingsPanel />
```

## How to Use

### 1. Wrap Your App with AccessibilityProvider

In your main App.jsx:

```jsx
import { AccessibilityProvider } from './context/AccessibilityContext';

function App() {
  return (
    <AccessibilityProvider>
      {/* Your app components */}
    </AccessibilityProvider>
  );
}
```

### 2. Use Accessibility Hook in Components

```jsx
import { useAccessibility } from './context/AccessibilityContext';

function MyComponent() {
  const { speak, settings, startListening } = useAccessibility();

  const handleListenClick = () => {
    speak('This is a candidate bio...');
  };

  return (
    <div>
      <button onClick={handleListenClick}>
        Listen to Bio
      </button>
    </div>
  );
}
```

### 3. Add to Candidate Cards

```jsx
import TextToSpeechButton from './components/accessibility/TextToSpeechButton';

function CandidateCard({ candidate }) {
  return (
    <div className="candidate-card">
      <h3>{candidate.name}</h3>
      <p>{candidate.bio}</p>
      
      <TextToSpeechButton 
        text={candidate.bio}
        label="Listen to Bio"
        compact={true}
      />
    </div>
  );
}
```

### 4. Add Voice Voting

```jsx
import SpeechToTextButton from './components/accessibility/SpeechToTextButton';

function VotingInterface({ candidates }) {
  const handleVoteByVoice = (transcript) => {
    // Match transcript to candidate name
    const candidate = candidates.find(c => 
      c.name.toLowerCase().includes(transcript.toLowerCase())
    );
    if (candidate) {
      submitVote(candidate.id);
    }
  };

  return (
    <div>
      <SpeechToTextButton 
        label="Vote by Voice"
        onTranscriptComplete={handleVoteByVoice}
      />
    </div>
  );
}
```

## Google Cloud Setup (Important!)

### Prerequisites:
1. Create a Google Cloud Project
2. Enable APIs:
   - Text-to-Speech API
   - Speech-to-Text API (optional - uses browser API)

3. Create a Service Account and download JSON credentials

4. Set environment variable in backend `.env`:
```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### Install Google Cloud Libraries:

```bash
cd backend
npm install @google-cloud/text-to-speech @google-cloud/speech
```

## Features

✅ **Text-to-Speech**
- Multiple voices available
- Adjustable speaking rate (0.5x to 2x)
- Compact and full-size buttons
- Real-time playback control

✅ **Speech-to-Text**
- Real-time transcription
- Interim results as user speaks
- Confirmation modal to verify transcription
- Browser-based (no server needed for STT)

✅ **Accessibility Settings**
- Toggle TTS/STT on/off
- Font size adjustment (Small, Medium, Large, X-Large)
- High contrast mode
- Bold text
- Reduce animations
- Screen reader optimization
- Simplified UI
- Caption support

✅ **WCAG Compliant**
- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast
- Focus indicators

## Styling & Customization

All components have CSS files for styling:
- `TextToSpeechButton.css`
- `SpeechToTextButton.css`
- `AccessibilitySettingsPanel.css`

Colors can be customized in the CSS files or use CSS variables.

## Testing

```bash
# Test TTS endpoint
curl -X POST http://localhost:5000/api/accessibility/text-to-speech \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text":"Hello world"}'

# Get available voices
curl http://localhost:5000/api/accessibility/voices

# Health check
curl http://localhost:5000/api/accessibility/health
```

## Troubleshooting

### "Text-to-Speech not working"
1. Check GOOGLE_APPLICATION_CREDENTIALS is set
2. Verify service account has Text-to-Speech API permissions
3. Check browser console for errors

### "Speech-to-Text not available"
1. Ensure browser supports Web Speech API (Chrome, Edge, Safari)
2. Check if HTTPS is being used (STT requires secure context)
3. Verify microphone permissions

### "AccessibilityProvider not found"
1. Ensure provider wraps your app
2. Check import path is correct
3. Verify no typos in hook usage

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| TTS     | ✅     | ✅      | ✅     | ✅   |
| STT     | ✅     | ⚠️      | ✅     | ✅   |
| Settings| ✅     | ✅      | ✅     | ✅   |

## Next Steps

1. Add TTS/STT buttons to candidate cards in elections view
2. Integrate voice voting into voting modal
3. Add accessibility shortcuts to keyboard shortcuts
4. Create accessibility guide for users
5. Test with actual disabled users
6. Gather feedback and iterate

## Resources

- [Google Cloud Text-to-Speech Docs](https://cloud.google.com/text-to-speech/docs)
- [Web Speech API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Accessibility Guidelines for Campus Voting](https://www.eac.gov/voting-equipment/accessibility)
