/**
 * AudioVisualizer — Next-Gen Soundwave Spectrum Analyzer
 * Real-time Web Audio API FFT frequency analysis with dynamic gradient bars,
 * audio level meter, and an ambient undulating wave when idle.
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Radio } from 'lucide-react';

interface AudioVisualizerProps {
  isRecording: boolean;
  mediaStream: MediaStream | null;
  barCount?: number;
}

export default function AudioVisualizer({
  isRecording,
  mediaStream,
  barCount = 32,
}: AudioVisualizerProps) {
  const [frequencies, setFrequencies] = useState<number[]>(() => new Array(barCount).fill(14));
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

        let sum = 0;
        const normalizedBars: number[] = [];
        const step = Math.max(1, Math.floor(bufferLength / barCount));

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i * step] || 0;
          sum += val;
          // Scale smoothly between 16% and 100%
          const heightPct = Math.max(16, Math.min(100, Math.round((val / 255) * 100)));
          normalizedBars.push(heightPct);
        }

        const avg = Math.round(sum / bufferLength);
        setAudioLevel(avg);
        setFrequencies(normalizedBars);

        animFrameRef.current = requestAnimationFrame(updateBars);
      };

      updateBars();
    } catch (e) {
      console.warn('AudioVisualizer Web Audio API init error:', e);
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
    <div className="w-full flex flex-col items-center gap-2">
      {/* Bars visualizer chamber */}
      <div className="w-full h-16 flex items-center justify-center gap-1 sm:gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-b from-slate-50/90 to-white/95 border border-slate-200/90 shadow-inner relative overflow-hidden backdrop-blur-md">
        {/* Subtle ambient frequency glow */}
        {isRecording && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20 blur-xl transition-all"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(128,103,232,0.6) 0%, rgba(14,165,201,0.3) 50%, transparent 80%)`,
            }}
          />
        )}

        {isRecording ? (
          frequencies.map((height, i) => (
            <motion.div
              key={i}
              className="w-1.5 sm:w-2 rounded-full transition-all duration-75 relative z-10"
              style={{
                height: `${height}%`,
                background:
                  height > 65
                    ? 'linear-gradient(180deg, #45a66b 0%, #0ea5c9 50%, #8067e8 100%)'
                    : height > 35
                    ? 'linear-gradient(180deg, #0ea5c9 0%, #8067e8 100%)'
                    : 'linear-gradient(180deg, rgba(128,103,232,0.8) 0%, rgba(128,103,232,0.3) 100%)',
                boxShadow:
                  height > 50
                    ? '0 0 10px rgba(14, 165, 201, 0.45)'
                    : height > 30
                    ? '0 0 6px rgba(128, 103, 232, 0.3)'
                    : 'none',
              }}
            />
          ))
        ) : (
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500">
            <Radio size={15} className="text-primary animate-pulse" />
            <span>Studio Microphone Ready — Click Speak or press [Spacebar]</span>
          </div>
        )}
      </div>

      {/* Real-time Decibel / Audio Level Pill */}
      {isRecording && (
        <div className="flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs">
          <Activity
            size={13}
            className={audioLevel > 18 ? 'text-success animate-pulse' : 'text-slate-400'}
          />
          <span className={audioLevel > 18 ? 'text-slate-700' : 'text-slate-500'}>
            {audioLevel > 35
              ? '🎙️ Optimal Voice Volume'
              : audioLevel > 10
              ? 'Voice Detected'
              : 'Listening for speech...'}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-[11px] font-mono font-bold text-primary">
            {Math.min(100, Math.round(audioLevel * 2.2))}% dB
          </span>
        </div>
      )}
    </div>
  );
}
