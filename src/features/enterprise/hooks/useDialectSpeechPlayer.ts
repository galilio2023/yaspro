"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface PlaybackOptions {
  activeScript: string;
  langCode: string;
  selectedTone: string;
  words: string[];
}

export function useDialectSpeechPlayer() {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);

  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionIdRef = useRef<number>(0);

  const stopAudio = useCallback(() => {
    sessionIdRef.current++;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsPlayingAudio(false);
    setPlaybackProgress(0);
    setActiveWordIndex(-1);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stopAudio]);

  const playSynthesizerFallback = useCallback((durationMs: number) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      // Formant shift simulating speech cadence
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + durationMs / 2000);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + durationMs / 1000);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // AudioContext unavailable or restricted in browser environment
    }
  }, []);

  const toggleAudio = useCallback(
    ({ activeScript, langCode, selectedTone, words }: PlaybackOptions) => {
      if (isPlayingAudio) {
        stopAudio();
        return;
      }

      sessionIdRef.current++;
      const currentSessionId = sessionIdRef.current;

      setIsPlayingAudio(true);
      setPlaybackProgress(0);

      const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;
      const durationMs = 5200;
      const startTime = performance.now();

      if (hasSpeech) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(activeScript);
        utterance.lang = langCode;
        utterance.rate =
          selectedTone === "Authoritative" ? 0.9 : selectedTone === "Punchy" ? 1.15 : 1.0;
        utterance.pitch = selectedTone === "Warm" ? 0.95 : 1.05;

        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find((v) => v.lang.startsWith("ar"));
        if (arabicVoice) utterance.voice = arabicVoice;

        utterance.onboundary = (event) => {
          if (sessionIdRef.current !== currentSessionId) return;
          if (event.name === "word") {
            const charIndex = event.charIndex;
            let runningLength = 0;
            for (let i = 0; i < words.length; i++) {
              runningLength += words[i].length + 1;
              if (charIndex < runningLength) {
                setActiveWordIndex(i);
                break;
              }
            }
          }
        };

        utterance.onend = () => {
          if (sessionIdRef.current !== currentSessionId) return;
          stopAudio();
        };

        utterance.onerror = (e) => {
          if (sessionIdRef.current !== currentSessionId) return;
          if (e.error === "canceled" || e.error === "interrupted") return;
          playSynthesizerFallback(durationMs);
        };

        window.speechSynthesis.speak(utterance);
      } else {
        playSynthesizerFallback(durationMs);
      }

      const updateLoop = (now: number) => {
        if (sessionIdRef.current !== currentSessionId) return;
        const elapsed = now - startTime;
        const progress = Math.min(100, (elapsed / durationMs) * 100);
        setPlaybackProgress(progress);

        const wordIdx = Math.floor((progress / 100) * words.length);
        setActiveWordIndex(Math.min(words.length - 1, wordIdx));

        if (progress < 100) {
          animationFrameRef.current = requestAnimationFrame(updateLoop);
        } else {
          stopAudio();
        }
      };

      animationFrameRef.current = requestAnimationFrame(updateLoop);
    },
    [isPlayingAudio, stopAudio, playSynthesizerFallback]
  );

  return {
    isPlayingAudio,
    playbackProgress,
    activeWordIndex,
    toggleAudio,
    stopAudio,
  };
}
