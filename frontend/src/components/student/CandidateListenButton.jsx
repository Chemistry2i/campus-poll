import React from 'react';
import TextToSpeechButton from '../accessibility/TextToSpeechButton.jsx';

/**
 * Student-facing wrapper for TextToSpeechButton.
 * Accepts either a plain `text` prop or a `candidate` object.
 */
export default function CandidateListenButton({
  text,
  candidate,
  label = 'Listen',
  compact = true,
  className,
  ...rest
}) {
  const resolvedText =
    text ??
    (candidate && (candidate.bio || candidate.description || candidate.manifesto || candidate.name)) ??
    '';

  return (
    <TextToSpeechButton
      text={resolvedText}
      label={label}
      compact={compact}
      className={className}
      {...rest}
    />
  );
}
