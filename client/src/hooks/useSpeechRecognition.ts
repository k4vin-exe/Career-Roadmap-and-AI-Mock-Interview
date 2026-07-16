/**
 * useSpeechRecognition — Web Speech API Hook (Refined)
 *
 * Creates a fresh SpeechRecognition instance on every start to prevent stale 'network' errors.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognitionAPI =
  (window as any).SpeechRecognition ||
  (window as any).webkitSpeechRecognition;

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  confidenceThreshold?: number;
  onEnd?: () => void;
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(
  options: SpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    continuous = true,
    interimResults = true,
    language = 'en-US',
    confidenceThreshold = 0.35,
    onEnd,
  } = options;

  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const accumulatedRef = useRef('');
  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  const isSupported = Boolean(SpeechRecognitionAPI);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }

    shouldListenRef.current = true;
    accumulatedRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError(null);

    // Create fresh instance to avoid stale connection 'network' errors
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let newFinalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        if (result.isFinal) {
          const bestTranscript = result[0].transcript;
          const bestConfidence = result[0].confidence;
          const meetsThreshold = bestConfidence === 0 || bestConfidence >= confidenceThreshold;
          
          if (meetsThreshold && bestTranscript.trim().length > 1) {
            newFinalText += bestTranscript;
          }
        } else {
          interimText += result[0].transcript;
        }
      }

      if (newFinalText) {
        const cleaned = newFinalText.replace(/\s+/g, ' ');
        accumulatedRef.current += cleaned;
        setTranscript(accumulatedRef.current);
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;

      const errorMap: Record<string, string> = {
        'not-allowed': 'Microphone access was denied. Please allow microphone access in your browser.',
        'audio-capture': 'No microphone found. Please connect a microphone and try again.',
        'network': 'Network error. Please check your internet connection.',
        'service-not-allowed': 'Speech recognition service is not available. Please try again later.',
      };

      setError(errorMap[event.error] || `Speech recognition error: ${event.error}`);
      shouldListenRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      
      // Removed aggressive auto-restart to prevent network spamming.
      // If continuous stops, it's safer to let the user click the mic again,
      // or rely on a simple callback.
      shouldListenRef.current = false;
      onEndRef.current?.();
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (_) {
      setTimeout(() => {
        try { recognition.start(); } catch (__) {}
      }, 250);
    }
  }, [isSupported, continuous, interimResults, language, confidenceThreshold]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch (_) {}
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const resetTranscript = useCallback(() => {
    accumulatedRef.current = '';
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
    };
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
