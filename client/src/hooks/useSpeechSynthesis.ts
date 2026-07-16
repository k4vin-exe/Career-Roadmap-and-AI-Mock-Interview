/**
 * useSpeechSynthesis — Web Speech API TTS Hook
 *
 * Key fix: voices are fetched fresh at speak-time using getVoices(),
 * NOT from stale React state. If voices haven't loaded yet, we wait
 * for the 'voiceschanged' event before speaking.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechSynthesisOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
}

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
}

// Ranked list of the best natural-sounding voices
const PREFERRED_VOICE_NAMES = [
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Jenny Online (Natural) - English (United States)',
  'Microsoft Guy Online (Natural) - English (United States)',
  'Microsoft Aria - English (United States)',
  'Microsoft Jenny - English (United States)',
  'Samantha',
  'Karen',
  'Daniel',
  'Google US English',
  'Google UK English Female',
  'Google UK English Male',
];

function pickBestVoice(voiceName?: string): SpeechSynthesisVoice | null {
  // Always call getVoices() fresh — never rely on stale React state
  const all = window.speechSynthesis.getVoices();
  if (!all.length) return null;

  if (voiceName) {
    return all.find((v) => v.name === voiceName) || null;
  }

  // Try preferred list
  for (const name of PREFERRED_VOICE_NAMES) {
    const v = all.find((v) => v.name === name);
    if (v) return v;
  }

  // Any Microsoft online en voice
  const msOnline = all.find(
    (v) => v.name.includes('Microsoft') && v.lang.startsWith('en') && !v.localService
  );
  if (msOnline) return msOnline;

  // Any online en-US voice
  const onlineUs = all.find((v) => v.lang === 'en-US' && !v.localService);
  if (onlineUs) return onlineUs;

  // Any English voice — guaranteed fallback
  return all.find((v) => v.lang.startsWith('en')) || all[0] || null;
}

export function useSpeechSynthesis(
  options: SpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const { rate = 0.88, pitch = 0.95, volume = 1, voiceName } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pendingTextRef = useRef<string | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load voices and handle the async Chrome voiceschanged event
  useEffect(() => {
    if (!isSupported) return;

    const handleVoicesChanged = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);

      // If speak() was called before voices loaded, execute it now
      if (pendingTextRef.current) {
        const text = pendingTextRef.current;
        pendingTextRef.current = null;
        doSpeak(text);
      }
    };

    // Chrome: getVoices() returns [] on first call, fires voiceschanged when ready
    const initial = window.speechSynthesis.getVoices();
    if (initial.length > 0) {
      setVoices(initial);
    }

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  // Core speak logic — always fetches voices fresh
  const doSpeak = useCallback((text: string) => {
    if (!isSupported || !text.trim()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = 'en-US';

    const voice = pickBestVoice(voiceName);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      // 'interrupted' is not a real error — it's caused by cancel()
      if (e.error !== 'interrupted') setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, rate, pitch, volume, voiceName]);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text.trim()) return;

    const currentVoices = window.speechSynthesis.getVoices();

    if (currentVoices.length === 0) {
      // Voices not ready yet — queue it, will fire when voiceschanged fires
      pendingTextRef.current = text;
      return;
    }

    doSpeak(text);
  }, [isSupported, doSpeak]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    pendingTextRef.current = null;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        pendingTextRef.current = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported, voices };
}
