// frontend/src/components/accessibility/AccessibilityIntegrationExample.jsx

/**
 * This file shows examples of how to integrate accessibility features
 * into your existing components
 */

// Example 1: Add to App.jsx (wrapper)
export const AppExample = `
import { AccessibilityProvider } from './context/AccessibilityContext';

function App() {
  return (
    <AccessibilityProvider>
      <YourApp />
    </AccessibilityProvider>
  );
}
`;

// Example 2: Add to Navbar/Header
export const NavbarExample = `
import AccessibilitySettingsPanel from './components/accessibility/AccessibilitySettingsPanel';

function Navbar() {
  return (
    <nav className="navbar">
      {/* Other nav items */}
      <AccessibilitySettingsPanel />
    </nav>
  );
}
`;

// Example 3: Add to Election Card
export const ElectionCardExample = `
import TextToSpeechButton from './components/accessibility/TextToSpeechButton';

function ElectionCard({ election }) {
  const electionDescription = \`
    Election: \${election.title}
    Description: \${election.description}
    Status: \${election.status}
    Starts: \${election.startDate}
    Ends: \${election.endDate}
  \`;

  return (
    <div className="election-card">
      <h3>{election.title}</h3>
      <p>{election.description}</p>
      
      {/* Add listen button */}
      <TextToSpeechButton 
        text={electionDescription}
        label="Listen to Details"
        compact={true}
      />
    </div>
  );
}
`;

// Example 4: Add to Candidate Card
export const CandidateCardExample = `
import TextToSpeechButton from './components/accessibility/TextToSpeechButton';

function CandidateCard({ candidate }) {
  const candidateInfo = \`
    Candidate: \${candidate.name}
    Position: \${candidate.position}
    Bio: \${candidate.bio}
    Platform: \${candidate.platform || 'Not provided'}
  \`;

  return (
    <div className="candidate-card">
      <img src={candidate.image} alt={candidate.name} />
      <h4>{candidate.name}</h4>
      <p>{candidate.bio}</p>
      
      {/* Listen to candidate info */}
      <TextToSpeechButton 
        text={candidateInfo}
        label="Listen to Bio"
        compact={true}
      />
      
      <button onClick={() => handleVote(candidate.id)}>
        Vote
      </button>
    </div>
  );
}
`;

// Example 5: Voice Voting
export const VoiceVotingExample = `
import { useState } from 'react';
import SpeechToTextButton from './components/accessibility/SpeechToTextButton';

function VotingModal({ candidates, onVote }) {
  const [selectedCandidateByVoice, setSelectedCandidateByVoice] = useState(null);

  const handleVoiceInput = (transcript) => {
    // Find candidate by name in transcript
    const match = candidates.find(c => 
      transcript.toLowerCase().includes(c.name.toLowerCase())
    );
    
    if (match) {
      setSelectedCandidateByVoice(match);
      // Auto-confirm vote if very confident
      onVote(match.id);
    } else {
      alert('Candidate not recognized. Please try again.');
    }
  };

  return (
    <div className="voting-modal">
      <h2>Choose Your Candidate</h2>
      
      {/* Voice voting option */}
      <SpeechToTextButton 
        label="Vote by Voice"
        onTranscriptComplete={handleVoiceInput}
        compact={false}
      />
      
      {/* Show candidates */}
      <div className="candidates-list">
        {candidates.map(candidate => (
          <button 
            key={candidate.id}
            onClick={() => onVote(candidate.id)}
          >
            {candidate.name}
          </button>
        ))}
      </div>
    </div>
  );
}
`;

// Example 6: Using the hook directly
export const HookExample = `
import { useAccessibility } from './context/AccessibilityContext';

function MyComponent() {
  const { 
    speak, 
    stopSpeaking, 
    startListening, 
    settings, 
    currentlySpeaking,
    isListening 
  } = useAccessibility();

  const handleReadText = () => {
    speak('This is important voting information for all students.');
  };

  const handleListenForInput = () => {
    startListening({
      onResult: (result) => {
        console.log('Interim:', result.interimTranscript);
        if (result.isFinal) {
          console.log('Final:', result.finalTranscript);
        }
      },
      onEnd: (finalText) => {
        console.log('Listening ended, user said:', finalText);
      },
    });
  };

  return (
    <div>
      {settings.ttsEnabled && (
        <button onClick={handleReadText}>
          {currentlySpeaking ? 'Stop Reading' : 'Read Aloud'}
        </button>
      )}
      
      {settings.sttEnabled && (
        <button onClick={handleListenForInput}>
          {isListening ? 'Listening...' : 'Speak Command'}
        </button>
      )}
    </div>
  );
}
`;

// Example 7: Custom accessibility hook
export const CustomHookExample = `
import { useAccessibility } from './context/AccessibilityContext';

// Create a custom hook for common patterns
export const useVotingAccessibility = (candidate) => {
  const { speak, startListening, confirmTranscription } = useAccessibility();

  const announceCandidate = () => {
    const announcement = \`
      Now reading candidate \${candidate.name}.
      Platform: \${candidate.platform}.
      Bio: \${candidate.bio}
    \`;
    speak(announcement);
  };

  const confirmVoiceVote = (transcript) => {
    if (transcript.toLowerCase().includes('confirm') || 
        transcript.toLowerCase().includes('yes')) {
      return true;
    }
    return false;
  };

  return { announceCandidate, confirmVoiceVote };
};
`;

// Example 8: Settings integration
export const SettingsIntegrationExample = `
import { useAccessibility } from './context/AccessibilityContext';

function UserProfileSettings() {
  const { settings, updateSettings, availableVoices } = useAccessibility();

  return (
    <div className="accessibility-settings">
      <h3>Accessibility Preferences</h3>
      
      <label>
        <input 
          type="checkbox" 
          checked={settings.ttsEnabled}
          onChange={(e) => updateSettings({ 
            ttsEnabled: e.target.checked 
          })}
        />
        Enable Text-to-Speech
      </label>

      {settings.ttsEnabled && (
        <>
          <label>
            Voice:
            <select 
              value={settings.preferredVoice}
              onChange={(e) => updateSettings({ 
                preferredVoice: e.target.value 
              })}
            >
              {availableVoices.map(v => (
                <option key={v.name} value={v.name}>
                  {v.displayName}
                </option>
              ))}
            </select>
          </label>

          <label>
            Speed:
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.25"
              value={settings.speakingRate}
              onChange={(e) => updateSettings({ 
                speakingRate: parseFloat(e.target.value) 
              })}
            />
          </label>
        </>
      )}
    </div>
  );
}
`;

export default {
  AppExample,
  NavbarExample,
  ElectionCardExample,
  CandidateCardExample,
  VoiceVotingExample,
  HookExample,
  CustomHookExample,
  SettingsIntegrationExample,
};
