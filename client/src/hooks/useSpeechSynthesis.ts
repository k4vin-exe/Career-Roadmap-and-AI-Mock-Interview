/**
 * useSpeechSynthesis — Web Speech API TTS Hook
 *
 * Wraps the browser's native SpeechSynthesis API.
 * Used to have the AI "speak" questions aloud to the candidate.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechSynthesisOptions {
  rate?: number;    // 0.1 to 10 (default: 1)
  pitch?: number;   // 0 to 2 (default: 1)
  volume?: number;  // 0 to 1 (default: 1)
  voiceName?: string; // Optional voice name override
}

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
}

export function useSpeechSynthesis(
  options: SpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const { rate = 0.95, pitch = 1, volume = 1, voiceName } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load available voices (Chrome loads them async)
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return;

      // Stop any ongoing speech first
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Select voice: prefer a natural-sounding English voice
      if (voiceName) {
        utterance.voice = voices.find((v) => v.name === voiceName) || null;
      } else {
        // Prefer a natural Google/Microsoft online voice
        const preferred = voices.find(
          (v) =>
            v.name.includes('Google') ||
            v.name.includes('Microsoft') ||
            (v.lang.startsWith('en') && !v.localService)
        );
        utterance.voice = preferred || voices.find((v) => v.lang.startsWith('en')) || null;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, voices, rate, pitch, volume, voiceName]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported, voices };
}
