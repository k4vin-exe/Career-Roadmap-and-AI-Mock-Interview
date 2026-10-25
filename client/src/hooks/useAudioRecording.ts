import { useState, useRef, useCallback, useEffect } from 'react';
import api from '../services/api';

interface UseAudioRecordingReturn {
  transcript: string;
  isRecording: boolean;
  isTranscribing: boolean;
  mediaStream: MediaStream | null;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
  setTranscript: (text: string) => void;
}

export function useAudioRecording(): UseAudioRecordingReturn {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const liveTranscriptRef = useRef<string>('');

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript('');
      liveTranscriptRef.current = '';
      audioChunksRef.current = [];

      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setMediaStream(stream);

      // 2. Select optimal audio codec
      let mimeType = 'audio/webm;codecs=opus';
      if (typeof MediaRecorder !== 'undefined') {
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : '';
        }
      }

      const recorderOptions = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 3. Start local browser Web Speech API in parallel for instant live preview & resilience
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let finalResult = '';
            for (let i = 0; i < event.results.length; i++) {
              finalResult += event.results[i][0].transcript + ' ';
            }
            const clean = finalResult.trim();
            if (clean) {
              liveTranscriptRef.current = clean;
              setTranscript(clean);
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('Browser speech recognition notice:', e.error);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (recErr) {
          console.warn('Web Speech API initialization warning:', recErr);
        }
      }

      mediaRecorder.onstop = async () => {
        // Stop speech recognition if running
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {
            /* ignore */
          }
          recognitionRef.current = null;
        }

        // Stop all tracks to release hardware mic
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        setMediaStream(null);
        setIsRecording(false);

        const currentMime = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: currentMime });

        // If recording is empty or too short
        if (audioBlob.size < 200) {
          if (liveTranscriptRef.current) {
            setTranscript(liveTranscriptRef.current);
            return;
          }
          setError('No audio recorded. Please hold or speak clearly into the microphone.');
          return;
        }

        setIsTranscribing(true);

        try {
          const formData = new FormData();
          const ext = currentMime.includes('mp4') ? 'mp4' : 'webm';
          formData.append('file', audioBlob, `recording.${ext}`);

          const response = await api.post('/interview/transcribe', formData);

          if (response.data.success && response.data.text && response.data.text.trim()) {
            setTranscript(response.data.text.trim());
            liveTranscriptRef.current = response.data.text.trim();
            setError(null);
          } else if (liveTranscriptRef.current) {
            // Use browser speech recognition transcript if backend returned empty
            setTranscript(liveTranscriptRef.current);
            setError(null);
          } else {
            setError('Could not discern speech. Please speak closer to the microphone or type below.');
          }
        } catch (err: any) {
          console.warn('Backend transcription note:', err.response?.data || err.message);
          // If backend transcription encounters an issue, fall back to browser recognition
          if (liveTranscriptRef.current) {
            setTranscript(liveTranscriptRef.current);
            setError(null);
          } else {
            const message =
              err.response?.data?.error ||
              err.response?.data?.message ||
              err.message ||
              'Audio upload failed.';
            setError(`Transcription failed: ${message}`);
          }
        } finally {
          setIsTranscribing(false);
        }
      };

      // Start recording with 250ms timeslice to ensure audio buffers populate continuously
      mediaRecorder.start(250);
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setError('Microphone access was denied. Please allow microphone access in your browser settings.');
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.requestData();
      } catch {
        /* ignore */
      }
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    liveTranscriptRef.current = '';
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          /* ignore */
        }
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          /* ignore */
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    transcript,
    isRecording,
    isTranscribing,
    mediaStream,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
    setTranscript,
  };
}
