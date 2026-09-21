'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface LiveAudioWaveformProps {
  stream?: MediaStream | null;
  isRecording: boolean;
  className?: string;
  'data-testid'?: string;
}

export const LiveAudioWaveform: React.FC<LiveAudioWaveformProps> = ({
  stream,
  isRecording,
  className = '',
  'data-testid': testId = 'live-audio-waveform',
}) => {
  const [bars, setBars] = useState<number[]>([
    0.2, 0.4, 0.6, 0.8, 0.5, 0.3, 0.7, 0.9, 0.4, 0.6, 0.8, 0.3, 0.5, 0.7, 0.9, 0.4,
  ]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Try setting up Web Audio API AnalyserNode if stream is active
    if (stream && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateBars = () => {
          if (!isRecording) return;
          analyser.getByteFrequencyData(dataArray);
          // Take 16 points across frequency range
          const newBars: number[] = [];
          const step = Math.floor(dataArray.length / 16) || 1;
          for (let i = 0; i < 16; i++) {
            const val = dataArray[i * step] || 0;
            newBars.push(Math.max(0.15, val / 255));
          }
          setBars(newBars);
          animationFrameRef.current = requestAnimationFrame(updateBars);
        };

        updateBars();
      } catch (err) {
        console.warn('AudioContext Analyser not available, using synthetic waveform:', err);
      }
    } else {
      // Fallback synthetic animated waveform
      const interval = setInterval(() => {
        setBars((prev) =>
          prev.map(() => Math.max(0.15, Math.min(1.0, 0.2 + Math.random() * 0.8)))
        );
      }, 100);

      return () => clearInterval(interval);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stream, isRecording]);

  return (
    <div
      data-testid={testId}
      className={`flex items-center justify-center gap-1.5 h-16 py-2 ${className}`}
    >
      {bars.map((bar, idx) => {
        const heightPercent = Math.max(15, Math.round(bar * 100));
        return (
          <div
            key={idx}
            data-testid={`${testId}-bar-${idx}`}
            className="w-1.5 rounded-full bg-sb-navy transition-all duration-75"
            style={{ height: `${heightPercent}%` }}
          />
        );
      })}
    </div>
  );
};
