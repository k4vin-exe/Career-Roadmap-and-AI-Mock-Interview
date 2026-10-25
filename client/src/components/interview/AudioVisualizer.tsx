import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Activity } from 'lucide-react';

interface AudioVisualizerProps {
  isRecording: boolean;
  mediaStream: MediaStream | null;
  barCount?: number;
}

export default function AudioVisualizer({
  isRecording,
  mediaStream,
  barCount = 20,
}: AudioVisualizerProps) {
  const [frequencies, setFrequencies] = useState<number[]>(() => new Array(barCount).fill(10));
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording || !mediaStream) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setFrequencies(new Array(barCount).fill(12));
      setAudioLevel(0);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.75;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateBars = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Compute average volume level
        let sum = 0;
        const normalizedBars: number[] = [];
        const step = Math.max(1, Math.floor(bufferLength / barCount));

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i * step] || 0;
          sum += val;
          // Scale between 12% and 100% height
          const heightPct = Math.max(12, Math.min(100, Math.round((val / 255) * 100)));
          normalizedBars.push(heightPct);
        }

        const avg = Math.round(sum / bufferLength);
        setAudioLevel(avg);
        setFrequencies(normalizedBars);

        animFrameRef.current = requestAnimationFrame(updateBars);
      };

      updateBars();
    } catch (e) {
      console.warn('AudioVisualizer Web Audio API init skipped:', e);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [isRecording, mediaStream, barCount]);

  return (
    <div className="w-full flex flex-col items-center gap-2 py-2">
      {/* Bars container */}
      <div
        className="w-full max-w-md h-12 flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-2xl bg-surface-muted/60 border border-border/80 backdrop-blur-sm"
      >
        {isRecording ? (
          frequencies.map((height, i) => (
            <motion.div
              key={i}
              className="w-2 rounded-full transition-all duration-75"
              style={{
                height: `${height}%`,
                background:
                  height > 65
                    ? 'linear-gradient(180deg, #10b981 0%, #6366f1 100%)'
                    : height > 35
                    ? 'linear-gradient(180deg, #6366f1 0%, #818cf8 100%)'
                    : 'rgba(99, 102, 241, 0.4)',
                boxShadow: height > 50 ? '0 0 8px rgba(99, 102, 241, 0.3)' : 'none',
              }}
            />
          ))
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
            <Mic size={14} className="opacity-60" />
            <span>Ready to listen — click mic to speak</span>
          </div>
        )}
      </div>

      {/* Live Voice Indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
          <Activity size={13} className={audioLevel > 20 ? 'text-success animate-pulse' : 'text-text-muted'} />
          <span>
            {audioLevel > 35
              ? 'Voice Detected — Good Volume'
              : audioLevel > 10
              ? 'Voice Detected — Speak Clearly'
              : 'Listening... (Awaiting speech)'}
          </span>
        </div>
      )}
    </div>
  );
}
