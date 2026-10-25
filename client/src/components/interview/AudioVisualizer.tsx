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
  barCount = 28,
}: AudioVisualizerProps) {
  const [frequencies, setFrequencies] = useState<number[]>(() => new Array(barCount).fill(12));
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
      setFrequencies(new Array(barCount).fill(10));
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
      analyser.smoothingTimeConstant = 0.78;
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
          // Scale smoothly between 14% and 100%
          const heightPct = Math.max(14, Math.min(100, Math.round((val / 255) * 100)));
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
    <div className="w-full flex flex-col items-center gap-2.5">
      {/* Bars container */}
      <div className="w-full max-w-lg h-14 flex items-center justify-center gap-1.5 px-5 py-2 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs backdrop-blur-md">
        {isRecording ? (
          frequencies.map((height, i) => (
            <motion.div
              key={i}
              className="w-1.5 md:w-2 rounded-full transition-all duration-75"
              style={{
                height: `${height}%`,
                background:
                  height > 60
                    ? 'linear-gradient(180deg, #45a66b 0%, #8067e8 100%)'
                    : height > 30
                    ? 'linear-gradient(180deg, #8067e8 0%, #a855f7 100%)'
                    : 'rgba(128, 103, 232, 0.35)',
                boxShadow: height > 45 ? '0 0 10px rgba(128, 103, 232, 0.4)' : 'none',
              }}
            />
          ))
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Radio size={14} className="text-primary animate-pulse" />
            <span>Studio Voice Ready — Speak clearly into your mic</span>
          </div>
        )}
      </div>

      {/* Live Audio Status */}
      {isRecording && (
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80">
          <Activity
            size={13}
            className={audioLevel > 18 ? 'text-success animate-pulse' : 'text-slate-400'}
          />
          <span className={audioLevel > 18 ? 'text-slate-700' : 'text-slate-500'}>
            {audioLevel > 35
              ? 'Excellent Voice Level'
              : audioLevel > 10
              ? 'Voice Detected'
              : 'Listening for speech...'}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300 mx-0.5" />
          <span className="text-[11px] text-slate-400 font-mono">
            {Math.min(100, audioLevel * 2)}%
          </span>
        </div>
      )}
    </div>
  );
}
