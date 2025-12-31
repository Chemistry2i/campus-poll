import React from 'react';
import SpeechToTextButton from '../accessibility/SpeechToTextButton.jsx';

/**
 * Student-facing voice voting button.
 * Tries to resolve a spoken transcript to a candidate and calls `onVote`.
 *
 * Props:
 * - electionId: optional, passed back to onVote
 * - candidates: array of candidate objects (optional) used for naive name matching
 * - resolveCandidate: function(transcript, candidates) -> candidateId (optional, overrides naive match)
 * - onVote: function({ electionId, candidateId, transcript }) called when a candidateId is resolved
 * - onTranscript: function(transcript) optional callback invoked with raw transcript
 * - label: button label (default: "Vote by Voice")
 * - confirm: whether to show confirmation UI in underlying component (default: true)
 */
export default function VoiceVoteButton({
  electionId,
  candidates = [],
  resolveCandidate,
  onVote,
  onTranscript,
  label = 'Vote by Voice',
  className,
  confirm = true,
  ...rest
}) {
  const handleTranscriptComplete = async (transcript) => {
    if (onTranscript) onTranscript(transcript);

    let candidateId;
    if (typeof resolveCandidate === 'function') {
      candidateId = await resolveCandidate(transcript, candidates);
    } else if (Array.isArray(candidates) && candidates.length > 0) {
      const lower = String(transcript || '').toLowerCase();
      const match = candidates.find((c) =>
        [c.name, c.fullName, c.candidateName, c.title]
          .filter(Boolean)
          .some((n) => {
            const s = String(n).toLowerCase();
            return s === lower || lower.includes(s);
          })
      );
      candidateId = match && (match.id || match._id || match.candidateId);
    }

    if (onVote && candidateId) {
      onVote({ electionId, candidateId, transcript });
    }
  };

  return (
    <SpeechToTextButton
      label={label}
      onTranscriptComplete={handleTranscriptComplete}
      className={className}
      confirm={confirm}
      {...rest}
    />
  );
}
