# ✅ ACCESSIBILITY SETUP - NEXT STEPS

## 🎉 Good News!

Your backend server is now **running successfully** with accessibility features ready to go! The Google Cloud module dependency issue has been fixed.

---

## 📋 What Just Happened

✅ **Installed** Google Cloud packages:
   - `@google-cloud/text-to-speech`
   - `@google-cloud/speech`

✅ **Fixed** module loading to use lazy initialization
   - Server no longer crashes if credentials aren't set yet
   - Google Cloud client loads only when you try to use TTS

✅ **Verified** server starts correctly:
   - Port 5000 running
   - MongoDB connected
   - All routes registered
   - Ready for action!

---

## 🚀 Next Steps (2 Options)

### Option A: Set Up Google Cloud Now (Recommended)
**Time: 15 minutes**

1. **Create Google Cloud Project**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create new project (or use existing)

2. **Enable APIs**
   - Search for "Text-to-Speech API"
   - Click "Enable"
   - Search for "Speech-to-Text API"
   - Click "Enable"

3. **Create Service Account**
   - Go to "Service Accounts" (left menu)
   - Click "Create Service Account"
   - Name it: "campus-ballot-accessibility"
   - Click "Create and Continue"
   - Grant role: "Editor" (simple) or specific "Text-to-Speech Admin"
   - Click "Continue"
   - Click "Create Key" → "JSON"
   - Download JSON file
   - Save to: `/workspaces/campus-ballot/backend/google-credentials.json`

4. **Set Environment Variable**
   ```bash
   # In backend/.env add:
   GOOGLE_APPLICATION_CREDENTIALS=/workspaces/campus-ballot/backend/google-credentials.json
   ```

5. **Restart Backend**
   ```bash
   cd backend && npm run dev
   ```

### Option B: Use Without Google Cloud (For Now)
**Time: 0 minutes**

- Frontend features work without backend (STT uses browser)
- Integrate components first
- Set up Google Cloud later when ready
- TTS endpoint will fail but app won't crash

---

## 💻 Quick Integration Guide

Now that the backend is running, you can start adding accessibility components to your app:

### 1. Wrap Your App with Accessibility Provider

**File:** `frontend/src/main.jsx` or `frontend/src/App.jsx`

```jsx
import { AccessibilityProvider } from './context/AccessibilityContext';

function App() {
  return (
    <AccessibilityProvider>
      {/* Your existing app code */}
    </AccessibilityProvider>
  );
}

export default App;
```

### 2. Add Settings Panel to Navbar

**File:** Your navbar component

```jsx
import AccessibilitySettingsPanel from './components/accessibility/AccessibilitySettingsPanel';

function Navbar() {
  return (
    <nav>
      {/* Your existing navbar items */}
      
      <AccessibilitySettingsPanel />
    </nav>
  );
}
```

### 3. Add Listen Button to Candidate Cards

**File:** Your candidate card component

```jsx
import TextToSpeechButton from './components/accessibility/TextToSpeechButton';

function CandidateCard({ candidate }) {
  const candidateInfo = `
    Candidate: ${candidate.name}
    Bio: ${candidate.bio}
    Platform: ${candidate.platform}
  `;

  return (
    <div className="candidate-card">
      <img src={candidate.image} alt={candidate.name} />
      <h3>{candidate.name}</h3>
      <p>{candidate.bio}</p>
      
      {/* Add this line */}
      <TextToSpeechButton 
        text={candidateInfo}
        label="Listen to Candidate Info"
        compact={true}
      />
      
      <button onClick={() => voteFor(candidate.id)}>Vote</button>
    </div>
  );
}
```

### 4. Add Voice Voting

**File:** Your voting modal/interface

```jsx
import SpeechToTextButton from './components/accessibility/SpeechToTextButton';

function VotingModal({ candidates, onVote }) {
  const handleVoiceVote = (transcript) => {
    // Match transcript to candidate name
    const candidate = candidates.find(c =>
      c.name.toLowerCase().includes(transcript.toLowerCase())
    );

    if (candidate) {
      onVote(candidate.id);
      alert(`Voted for ${candidate.name}`);
    } else {
      alert('Candidate not recognized. Please try again.');
    }
  };

  return (
    <div className="voting-modal">
      <h2>Select Your Candidate</h2>
      
      {/* Add voice voting */}
      <SpeechToTextButton 
        label="Vote by Voice"
        onTranscriptComplete={handleVoiceVote}
        compact={false}
      />

      {/* Show candidates for visual selection */}
      <div className="candidates-list">
        {candidates.map(candidate => (
          <button
            key={candidate.id}
            onClick={() => onVote(candidate.id)}
            className="candidate-button"
          >
            {candidate.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 📚 Documentation to Read

In order of importance:

1. **[ACCESSIBILITY_QUICK_REFERENCE.md](./ACCESSIBILITY_QUICK_REFERENCE.md)** (5 min)
   - Copy-paste code snippets
   - Quick setup guide

2. **[ACCESSIBILITY_SETUP_CHECKLIST.md](./ACCESSIBILITY_SETUP_CHECKLIST.md)** (15 min)
   - Step-by-step setup
   - Component integration
   - Testing guide

3. **[ACCESSIBILITY_INTEGRATION_GUIDE.md](./ACCESSIBILITY_INTEGRATION_GUIDE.md)** (30 min)
   - Complete technical reference
   - All API endpoints
   - Troubleshooting

4. **[FILE_STRUCTURE_GUIDE.md](./FILE_STRUCTURE_GUIDE.md)** (10 min)
   - Where all files are
   - How they connect

---

## 🧪 Test Your Setup

### Test API Endpoints

```bash
# Test health check (no auth needed)
curl http://localhost:5000/api/accessibility/health

# Test voices endpoint (no auth needed, but needs Google credentials)
curl http://localhost:5000/api/accessibility/voices
```

### Test Frontend

1. Open browser to `http://localhost:5173` (your frontend)
2. Check console for any errors
3. Try the accessibility settings button (should appear fixed in corner)
4. Try enabling TTS
5. Try enabling STT (browser-based, works immediately)

---

## ⚡ Key Files for Integration

| Component | Location | Purpose |
|-----------|----------|---------|
| **Context** | `frontend/src/context/AccessibilityContext.jsx` | State management |
| **TTS Button** | `frontend/src/components/accessibility/TextToSpeechButton.jsx` | Listen button |
| **STT Button** | `frontend/src/components/accessibility/SpeechToTextButton.jsx` | Voice input |
| **Settings** | `frontend/src/components/accessibility/AccessibilitySettingsPanel.jsx` | User preferences |
| **Backend API** | `backend/controllers/accessibilityController.js` | TTS/STT logic |

---

## 🎯 Integration Checklist

- [ ] Read ACCESSIBILITY_QUICK_REFERENCE.md
- [ ] Set up Google Cloud credentials (optional but recommended)
- [ ] Add AccessibilityProvider to App.jsx
- [ ] Add AccessibilitySettingsPanel to navbar
- [ ] Add TextToSpeechButton to candidate cards
- [ ] Add SpeechToTextButton to voting interface
- [ ] Test in browser
- [ ] Test with disabled users
- [ ] Gather feedback
- [ ] Make improvements

---

## 🆘 If You Hit Issues

### "Google Cloud not working"
- Make sure GOOGLE_APPLICATION_CREDENTIALS path is correct and absolute
- Check file permissions on credentials JSON
- Verify Service Account has Text-to-Speech permissions
- Check backend logs for error messages

### "STT not working in browser"
- Ensure you're using HTTPS (or localhost for dev)
- Check browser console for errors
- Verify microphone permissions
- Check if browser supports Web Speech API

### "Components not showing"
- Did you wrap app with AccessibilityProvider?
- Check browser console for React errors
- Verify component imports are correct
- Check CSS is loading

### "Port 5000 already in use"
- Kill existing process: `pkill -f "node server.js"`
- Or use different port: `PORT=5001 npm run dev`

---

## 📊 Current Status

```
✅ Backend server running on port 5000
✅ MongoDB connected
✅ Accessibility routes registered
✅ Google Cloud integration ready
✅ All frontend components created
✅ Documentation complete

Status: 🟢 READY FOR INTEGRATION
```

---

## 🚀 You're Ready!

**Everything is set up and working!**

Next step: Choose Option A or B above and follow the guide!

### Fastest Path (30 minutes):
1. Read ACCESSIBILITY_QUICK_REFERENCE.md
2. Add AccessibilityProvider to App.jsx
3. Add AccessibilitySettingsPanel to navbar
4. Add buttons to candidate cards
5. Test in browser

**Then:** Set up Google Cloud credentials for full TTS support!

---

**Questions?** Check the documentation files or look at code examples in `AccessibilityIntegrationExample.jsx`

**Let's make voting accessible! 💪**
