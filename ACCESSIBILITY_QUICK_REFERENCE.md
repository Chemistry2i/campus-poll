# ⚡ Accessibility Features - Quick Reference

## 🎯 The Bottom Line

✅ **Text-to-Speech** - Click to listen to any content  
✅ **Speech-to-Text** - Speak to vote or navigate  
✅ **Settings Panel** - Customize fonts, voices, contrast  
✅ **Works with disabled students** - Blind, deaf, mobility, dyslexic  
✅ **Ready to use** - Just add Google credentials  

---

## 🚀 Get Started in 5 Minutes

### 1. Set Up Google Cloud (2 min)
```bash
# Create account at: https://console.cloud.google.com
# Enable: Text-to-Speech API
# Create: Service Account → Download JSON key
# In .env: GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
```

### 2. Install Dependencies (1 min)
```bash
cd backend
npm install @google-cloud/text-to-speech @google-cloud/speech
```

### 3. Wrap Your App (1 min)
```jsx
// In App.jsx or main.jsx
import { AccessibilityProvider } from './context/AccessibilityContext';

<AccessibilityProvider>
  <YourApp />
</AccessibilityProvider>
```

### 4. Add Components (1 min)
```jsx
// In navbar
<AccessibilitySettingsPanel />

// In candidate card
<TextToSpeechButton text={candidate.bio} label="Listen" />

// In voting modal
<SpeechToTextButton onTranscriptComplete={handleVote} />
```

Done! ✅

---

## 📁 Files to Know

| What | Where | What It Does |
|------|-------|-----------|
| **Context** | `context/AccessibilityContext.jsx` | Manages TTS/STT state |
| **TTS Button** | `components/accessibility/TextToSpeechButton.jsx` | "Read aloud" button |
| **STT Button** | `components/accessibility/SpeechToTextButton.jsx` | "Speak to vote" button |
| **Settings** | `components/accessibility/AccessibilitySettingsPanel.jsx` | User preferences UI |
| **Backend API** | `controllers/accessibilityController.js` | Handles TTS/STT |

---

## 🎨 Usage Copy-Paste

### Add Listen Button
```jsx
import TextToSpeechButton from './components/accessibility/TextToSpeechButton';

<TextToSpeechButton 
  text="Candidate bio here"
  label="Listen to Bio"
  compact={true}
/>
```

### Add Voice Voting
```jsx
import SpeechToTextButton from './components/accessibility/SpeechToTextButton';

<SpeechToTextButton 
  label="Vote by Voice"
  onTranscriptComplete={(text) => {
    console.log('User said:', text);
  }}
/>
```

### Use Hook
```jsx
import { useAccessibility } from './context/AccessibilityContext';

const { speak, startListening, settings } = useAccessibility();
```

---

## 🧪 Quick Test

```bash
# Test voice endpoint
curl http://localhost:5000/api/accessibility/voices

# Test TTS (with token)
curl -X POST http://localhost:5000/api/accessibility/text-to-speech \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"text":"Test"}'
```

---

## 🎯 Features Matrix

| Student Type | Feature | Button |
|---|---|---|
| Blind | Text-to-Speech | TextToSpeechButton |
| Deaf | Captions | Built-in |
| Motor | Voice Voting | SpeechToTextButton |
| Dyslexic | Listen + Read | TextToSpeechButton |
| ADHD | Simplified UI | Settings |

---

## 🔧 Troubleshooting

| Error | Fix |
|-------|-----|
| "TTS not working" | Check GOOGLE_APPLICATION_CREDENTIALS path |
| "STT not available" | Browser needs HTTPS (or localhost) |
| "Module not found" | Run `npm install @google-cloud/text-to-speech` |
| "Settings not saving" | Check localStorage is enabled |

---

## 📊 What Students Can Do

| Feature | Student Action | Result |
|---------|---|---|
| **Listen** | Click listen button on candidate bio | Audio plays candidate info |
| **Vote by Voice** | "John Smith" (says candidate name) | Vote registered for John |
| **Change Voice** | Settings → Select voice | TTS uses new voice |
| **Bigger Font** | Settings → Font size → Large | Text is bigger |
| **High Contrast** | Settings → High Contrast | Dark mode with bright colors |

---

## 🎓 Campus Value

- **Accessibility** - Helps disabled students
- **Legal** - ADA/Section 508 compliant
- **Equity** - Everyone can vote equally
- **Data** - Track accessibility feature usage

---

## 📈 Monitoring

Track in database:
- `totalTtsRequests` - How many times TTS was used
- `totalSttRequests` - How many times STT was used
- `lastTtsUsed` - When was TTS last used
- `lastSttUsed` - When was STT last used

---

## ✅ Deployment Checklist

- [ ] Google credentials file added to server
- [ ] GOOGLE_APPLICATION_CREDENTIALS env var set
- [ ] AccessibilityProvider wraps app
- [ ] Components added to pages
- [ ] Test TTS endpoint
- [ ] Test STT in browser
- [ ] Check HTTPS (for production)
- [ ] Test with accessibility tools (NVDA, JAWS)

---

## 🎯 Implementation Priority

### Must Have (Week 1)
1. Add AccessibilitySettingsPanel to navbar
2. Add TextToSpeechButton to candidate cards
3. Test with students

### Should Have (Week 2)
1. Add SpeechToTextButton to voting
2. Customize voices/speeds
3. Gather feedback

### Nice to Have (Week 3+)
1. Advanced preferences
2. Usage analytics
3. Tutorial/help section

---

## 💡 Best Practices

✅ **Do:**
- Test with actual disabled users
- Start with TTS, add STT later
- Customize colors to match your design
- Monitor usage metrics
- Gather feedback

❌ **Don't:**
- Force accessibility features on
- Use low-quality voices
- Forget to test HTTPS
- Ignore user feedback
- Hide accessibility features

---

## 🎤 Sample Transcript Flow

```
Student: "Vote John Smith"
         ↓
Browser recognizes: "John Smith"
         ↓
Shows confirmation: "Did you mean: John Smith?"
         ↓
Student: "Yes, confirm"
         ↓
Vote recorded for John Smith ✅
```

---

## 🌍 Language Support

TTS supports multiple languages:
- English (US, UK, AU, IN)
- Spanish, French, German, Italian
- Japanese, Mandarin, Korean
- And more!

Just pass `languageCode` in request.

---

## 🚀 Speed Tips

- TTS caches audio (no re-fetch)
- STT uses browser (no server call needed)
- Settings saved in localStorage
- Lazy load accessibility components

---

## 📱 Mobile Support

✅ Works on:
- iPhone (iOS 14.5+)
- Android phones (Chrome, Firefox)
- Tablets (iPad, Android)

⚠️ Limited on:
- Older iOS versions
- Some Android devices

---

## 🎯 Next Level

After basic setup, consider:
1. **Analytics Dashboard** - Track usage
2. **Accessibility Report** - WCAG compliance
3. **User Feedback Form** - Gather input
4. **Accessibility Training** - For staff
5. **Annual Audit** - Update features

---

**Start simple, improve with feedback. You've got this! 💪**

Last updated: December 28, 2025
