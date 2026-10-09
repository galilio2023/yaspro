"use client";

import { useEffect, useRef } from "react";

export function useReducedMotionVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePlayback = () => {
      video.autoplay = !preference.matches;
      video.loop = !preference.matches;
      if (preference.matches) video.pause();
      else void video.play().catch(() => {});
    };

    updatePlayback();
    preference.addEventListener("change", updatePlayback);
    return () => {
      preference.removeEventListener("change", updatePlayback);
      video.pause();
    };
  }, []);

  return videoRef;
}
