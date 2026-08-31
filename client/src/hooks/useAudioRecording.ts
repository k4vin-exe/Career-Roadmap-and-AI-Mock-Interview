import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

interface UseAudioRecordingReturn {
  transcript: string;
  isRecording: boolean;
  isTranscribing: boolean;
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
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript('');
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Stop all tracks to release microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        setIsRecording(false);
        setIsTranscribing(true);

        try {
          const formData = new FormData();
          // Backend multer expects 'file'
          formData.append('file', audioBlob, 'recording.webm');

          const token = localStorage.getItem('token');
          // Use Vite proxy path '/api' — no need for VITE_API_URL
          const response = await axios.post('/api/interview/transcribe', formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              // Do NOT set Content-Type manually — axios sets multipart boundary automatically
            },
          });

          if (response.data.success) {
            setTranscript(response.data.text);
          } else {
            setError('Failed to transcribe audio.');
          }
        } catch (err: any) {
          console.error('Transcription error details:', err.response?.data || err.message);
          const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Network error during transcription.';
          setError(`Transcription failed: ${message}`);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      setError('Microphone access was denied. Please allow microphone access in your browser.');
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    transcript,
    isRecording,
    isTranscribing,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
    setTranscript,
  };
}
