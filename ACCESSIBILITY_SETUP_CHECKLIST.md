# Accessibility Features Setup Checklist ✅

## 🎯 Overview
You now have complete accessibility features ready for disabled students! This includes Text-to-Speech, Speech-to-Text, and accessibility settings.

---

## 📋 What's Included

### Backend Components ✅
- ✅ `backend/controllers/accessibilityController.js` - TTS/STT API logic
- ✅ `backend/routes/accessibilityRoutes.js` - API endpoints
- ✅ Integrated into `backend/server.js`

### Frontend Components ✅
- ✅ `frontend/src/context/AccessibilityContext.jsx` - State management
- ✅ `frontend/src/components/accessibility/TextToSpeechButton.jsx` - TTS button
- ✅ `frontend/src/components/accessibility/SpeechToTextButton.jsx` - STT button
- ✅ `frontend/src/components/accessibility/AccessibilitySettingsPanel.jsx` - Settings UI
- ✅ CSS styling files for all components
- ✅ Integration examples and documentation

---

## 🚀 Quick Start

### 1️⃣ **Install Backend Dependencies**

```bash
cd backend
npm install @google-cloud/text-to-speech @google-cloud/speech
```

### 2️⃣ **Set Up Google Cloud (IMPORTANT!)**

```bash
# Create .env in backend folder with:
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/google-credentials.json
```

**How to get Google credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (if you don't have one)
3. Enable APIs:
   - Text-to-Speech API
   - Speech-to-Text API
4. Create Service Account:
   - Go to Service Accounts
   - Click "Create Service Account"
   - Grant roles: Editor (or specific TTS/STT permissions)
   - Create JSON key and download it
   - Place in your backend folder

### 3️⃣ **Wrap App with AccessibilityProvider**

In `frontend/src/main.jsx` or `App.jsx`:

```jsx
import { AccessibilityProvider } from './context/AccessibilityContext';

function App() {
  return (
    <AccessibilityProvider>
      {/* Your existing app */}
    </AccessibilityProvider>
  );
}

export default App;
```

### 4️⃣ **Add Settings Panel to Navbar**

In your header/navbar component:

```jsx
import AccessibilitySettingsPanel from './components/accessibility/AccessibilitySettingsPanel';

function Navbar() {
  return (
    <nav>
      {/* Your navbar items */}
      <AccessibilitySettingsPanel /> {/* Add this line */}
    </nav>
  );
}
```

---

## 🎨 Features Available

### For Students with Visual Impairments
- ✅ Text-to-Speech for all content
- ✅ Multiple voice options
- ✅ Adjustable speech rate (0.5x to 2x)
- ✅ High contrast mode
- ✅ Bold text option
- ✅ Larger fonts (Small, Medium, Large, X-Large)
- ✅ Screen reader optimization

### For Students with Hearing Impairments
- ✅ Speech-to-Text for voice input
- ✅ Captions/transcripts
- ✅ Visual indicators for audio

### For Students with Motor Impairments
- ✅ Voice voting (speech-to-text)
- ✅ Keyboard navigation (already implemented)
- ✅ Reduced animations option
- ✅ Simplified UI option

### For Neurodivergent Students
- ✅ High contrast mode
- ✅ Reduced animations
- ✅ Simplified UI
- ✅ Audio reading support

---

## 📝 How to Use in Components

### Add TTS to Candidate Card

```jsx
import TextToSpeechButton from './components/accessibility/TextToSpeechButton';

function CandidateCard({ candidate }) {
  return (
    <div>
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

### Add STT for Voice Voting

```jsx
import SpeechToTextButton from './components/accessibility/SpeechToTextButton';

function VotingModal({ candidates }) {
  const handleVoiceVote = (transcript) => {
    const candidate = candidates.find(c => 
      c.name.toLowerCase().includes(transcript.toLowerCase())
    );
    if (candidate) submitVote(candidate.id);
  };

  return (
    <SpeechToTextButton 
      label="Vote by Voice"
      onTranscriptComplete={handleVoiceVote}
    />
  );
}
```

### Use Accessibility Hook

```jsx
import { useAccessibility } from './context/AccessibilityContext';

function MyComponent() {
  const { speak, startListening, settings } = useAccessibility();

  return (
    <button onClick={() => speak('Hello world')}>
      Listen
    </button>
  );
}
```

---

## 🔧 Integration Checklist

- [ ] Install Google Cloud dependencies
- [ ] Set up Google Cloud credentials
- [ ] Set `GOOGLE_APPLICATION_CREDENTIALS` in `.env`
- [ ] Wrap App with `AccessibilityProvider`
- [ ] Add `AccessibilitySettingsPanel` to navbar
- [ ] Add `TextToSpeechButton` to:
  - [ ] Candidate cards
  - [ ] Election descriptions
  - [ ] Important information sections
- [ ] Add `SpeechToTextButton` to:
  - [ ] Voting interface
  - [ ] Navigation
- [ ] Test TTS/STT in browser
- [ ] Test with keyboard navigation
- [ ] Test with screen reader

---

## 🧪 Testing

### Test TTS Endpoint
```bash
curl -X POST http://localhost:5000/api/accessibility/text-to-speech \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text":"Hello world"}'
```

### Test Voices Endpoint
```bash
curl http://localhost:5000/api/accessibility/voices
```

### Test Health Check
```bash
curl http://localhost:5000/api/accessibility/health
```

---

## 📱 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| TTS     | ✅     | ✅      | ✅     | ✅   |
| STT     | ✅     | ⚠️      | ✅     | ✅   |

**Note:** STT requires HTTPS or localhost. Firefox has limited support.

---

## 🐛 Troubleshooting

### "TTS not working"
- [ ] Check `GOOGLE_APPLICATION_CREDENTIALS` is set
- [ ] Verify service account has Text-to-Speech permissions
- [ ] Check backend logs for errors
- [ ] Verify you're authenticated (token in header)

### "STT not working"
- [ ] Check browser supports Web Speech API
- [ ] Ensure HTTPS is used (or localhost for dev)
- [ ] Check microphone permissions in browser
- [ ] Check browser console for errors

### "Provider not found error"
- [ ] Ensure `AccessibilityProvider` wraps your app
- [ ] Check import path is correct
- [ ] Clear browser cache and restart dev server

### "Google credentials error"
- [ ] Verify file path is correct and absolute
- [ ] Check file has read permissions
- [ ] Verify Service Account has correct roles
- [ ] Try generating new credentials

---

## 📚 Documentation Files

- **[ACCESSIBILITY_INTEGRATION_GUIDE.md](./ACCESSIBILITY_INTEGRATION_GUIDE.md)** - Complete integration guide
- **[AccessibilityIntegrationExample.jsx](./frontend/src/components/accessibility/AccessibilityIntegrationExample.jsx)** - Code examples

---

## 🎓 Campus Compliance

This implementation helps your voting system comply with:
- ✅ ADA (Americans with Disabilities Act)
- ✅ Section 508 Compliance
- ✅ WCAG 2.1 AA Standards
- ✅ Campus accessibility requirements

---

## 📞 Next Steps

1. **Setup Google Cloud** (most important!)
2. **Test TTS/STT** endpoints
3. **Integrate into your existing components**
4. **Get feedback from disabled students**
5. **Iterate and improve**

---

## 🚀 You're All Set!

The accessibility features are ready to use. Start by:

1. Setting up Google Cloud credentials
2. Testing the endpoints
3. Adding `AccessibilitySettingsPanel` to your navbar
4. Adding `TextToSpeechButton` to candidate cards
5. Adding `SpeechToTextButton` to voting interface

**Questions?** Check the integration guide or examples for detailed code samples!

---

**Made with ♥️ for accessibility**
