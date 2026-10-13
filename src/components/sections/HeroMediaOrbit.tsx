"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

interface NeonMediaNode {
  id: string;
  name: string;
  image: string;
  width: number;
  height: number;
  // Base angle along the orbital circle (0 to 360 deg)
  angle: number;
  // Natural gentle float bob parameters
  floatSpeed: number;
  floatPhase: number;
  glowColor: string;
}

// 8 authentic neon wireframe media icons exactly from mediasvg:
const NEON_MEDIA_NODES: NeonMediaNode[] = [
  {
    id: "neon-mic",
    name: "Studio Condenser Mic",
    image: "/images/hero/neon-nodes/neon-mic.png",
    width: 103,
    height: 172,
    angle: 270, // Top center (12 o'clock)
    floatSpeed: 0.0022,
    floatPhase: 0,
    glowColor: "rgba(34, 211, 238, 0.75)", // Electric Cyan
  },
  {
    id: "neon-ai-brain",
    name: "AI Neural Engine",
    image: "/images/hero/neon-nodes/neon-ai-brain.png",
    width: 218,
    height: 187,
    angle: 315, // Top-right (1:30 o'clock)
    floatSpeed: 0.0019,
    floatPhase: 1.2,
    glowColor: "rgba(217, 70, 239, 0.75)", // Neon Purple
  },
  {
    id: "neon-instagram",
    name: "Instagram",
    image: "/images/hero/neon-nodes/neon-instagram.png",
    width: 134,
    height: 133,
    angle: 0, // Middle-right (3 o'clock)
    floatSpeed: 0.0024,
    floatPhase: 2.1,
    glowColor: "rgba(244, 63, 94, 0.7)", // Sunset Neon
  },
  {
    id: "neon-tiktok",
    name: "TikTok",
    image: "/images/hero/neon-nodes/neon-tiktok.png",
    width: 148,
    height: 143,
    angle: 45, // Lower-right (4:30 o'clock)
    floatSpeed: 0.0021,
    floatPhase: 3.2,
    glowColor: "rgba(34, 211, 238, 0.75)", // Cyan & Pink
  },
  {
    id: "neon-snapchat",
    name: "Snapchat",
    image: "/images/hero/neon-nodes/neon-snapchat.png",
    width: 173,
    height: 169,
    angle: 90, // Bottom center (6 o'clock)
    floatSpeed: 0.002,
    floatPhase: 4.1,
    glowColor: "rgba(250, 204, 21, 0.8)", // Cyber Yellow
  },
  {
    id: "neon-clapperboard",
    name: "Director Clapperboard",
    image: "/images/hero/neon-nodes/neon-clapperboard.png",
    width: 186,
    height: 146,
    angle: 135, // Lower-left (7:30 o'clock)
    floatSpeed: 0.0023,
    floatPhase: 5.0,
    glowColor: "rgba(56, 189, 248, 0.75)", // Cobalt Blue
  },
  {
    id: "neon-softbox",
    name: "Studio Light Panel",
    image: "/images/hero/neon-nodes/neon-softbox.png",
    width: 153,
    height: 166,
    angle: 180, // Middle-left (9 o'clock)
    floatSpeed: 0.0018,
    floatPhase: 0.8,
    glowColor: "rgba(34, 211, 238, 0.75)", // Cyan & Amber Gold
  },
  {
    id: "neon-camera",
    name: "Cinema Production Camera",
    image: "/images/hero/neon-nodes/neon-camera.png",
    width: 234,
    height: 192,
    angle: 225, // Top-left (10:30 o'clock)
    floatSpeed: 0.0025,
    floatPhase: 1.9,
    glowColor: "rgba(236, 72, 153, 0.75)", // Hot Pink / Magenta
  },
];

// Slow orbital revolution duration (42 seconds per revolution)
const ORBIT_DURATION_MS = 42000;
const CELESTIAL_TILT_DEG = -8; // Slight celestial tilt

export function HeroMediaOrbit() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    let animId: number | null = null;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lastTime = performance.now();
    let orbitProgress = 0;
    let floatTime = 0;

    const tiltRad = (CELESTIAL_TILT_DEG * Math.PI) / 180;
    const cosTilt = Math.cos(tiltRad);
    const sinTilt = Math.sin(tiltRad);

    const updatePositions = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const w = rect.width || 380;
      const h = rect.height || 500;

      // Center of the orbit: anchored near chin/jaw line so the front path clears under the face
      const cx = w * 0.5;
      const cy = h * 0.32;

      // Expanded 3D Orbit radii with generous breathing room across all screens
      const clientWidth = typeof window !== "undefined" ? (document.documentElement.clientWidth || window.innerWidth) : 1024;
      const isTabletOrDesktop = clientWidth >= 768;

      // Target radius calibrated to ensure social media nodes orbit freely with spacious breathing room
      let targetRx: number;
      if (clientWidth >= 1200) {
        targetRx = Math.max(300, Math.min(w * 0.88, 330));
      } else if (isTabletOrDesktop) {
        // On tablet, ensure the orbit breathes with a confident, open celestial radius
        targetRx = Math.max(270, Math.min(w * 0.92, 310));
      } else {
        // Mobile
        targetRx = Math.max(210, Math.min(w * 0.82, 255));
      }

      // Smooth horizontal viewport bounds without aggressive micro-clamping (symmetric for LTR & RTL)
      const centerX = rect.left + cx;
      const leftClearance = centerX;
      const rightClearance = clientWidth - centerX;
      const sideClearance = Math.min(leftClearance, rightClearance);
      const safeMaxRadius = Math.max(targetRx * 0.88, sideClearance + 25);
      const rx = Math.min(targetRx, safeMaxRadius);
      const ry = rx * 0.49; // Generous vertical depth clearance

      const nodes = containerRef.current.querySelectorAll<HTMLElement>("[data-neon-node]");
      nodes.forEach((el, index) => {
        const item = NEON_MEDIA_NODES[index];
        if (!item) return;

        const baseRad = (item.angle * Math.PI) / 180;
        const currentAngle = baseRad + orbitProgress * Math.PI * 2;

        const px = rx * Math.cos(currentAngle);
        let py = ry * Math.sin(currentAngle);

        // Sinusoidal zero-gravity floating wave (gentle 8px wave)
        const floatBob = Math.sin(floatTime * item.floatSpeed + item.floatPhase) * 8;
        py += floatBob;

        // Apply celestial perspective tilt
        const x = px * cosTilt - py * sinTilt;
        let y = px * sinTilt + py * cosTilt;

        // Front path dip: when in front (depthSin > 0), dip lower so it floats cleanly under the face & chin
        const depthSin = Math.sin(currentAngle);
        if (depthSin > 0) {
          y += depthSin * 35; // extra downward clearance under the face
        } else {
          y -= Math.abs(depthSin) * 20; // extra upward clearance above the head crown
        }

        // Depth sorting: sin(currentAngle) < 0 is behind head, > 0 is in front
        const isBehind = depthSin < -0.15;
        const depthNormalized = (depthSin + 1) / 2; // 0 (back) to 1 (front)

        const scale = 0.75 + depthNormalized * 0.42;
        const opacity = 0.65 + depthNormalized * 0.35;

        el.style.transform = `translate3d(${cx + x}px, ${cy + y}px, 0) translate(-50%, -50%) scale(${scale})`;
        el.style.zIndex = isBehind ? "5" : "28";
        el.style.opacity = String(opacity);
      });

    };

    const animate = (timestamp: number) => {
      const delta = timestamp - lastTime;
      lastTime = timestamp;
      const speedMultiplier = isHoveredRef.current ? 0.2 : 1;
      orbitProgress = (orbitProgress + (delta / ORBIT_DURATION_MS) * speedMultiplier) % 1;
      floatTime += delta;
      updatePositions();
      animId = requestAnimationFrame(animate);
    };

    const syncMotionPreference = () => {
      if (animId !== null) cancelAnimationFrame(animId);
      animId = null;
      updatePositions();
      if (!motionPreference.matches) {
        lastTime = performance.now();
        animId = requestAnimationFrame(animate);
      }
    };

    syncMotionPreference();
    motionPreference.addEventListener("change", syncMotionPreference);
    window.addEventListener("resize", updatePositions);

    return () => {
      motionPreference.removeEventListener("change", syncMotionPreference);
      window.removeEventListener("resize", updatePositions);
      if (animId !== null) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none overflow-visible"
    >
      {NEON_MEDIA_NODES.map((node) => {
        // Immediate trigonometric fallback so all 8 are visible prior to RAF
        const fallbackRad = (node.angle * Math.PI) / 180;
        const initX = Math.round(Math.cos(fallbackRad) * 250);
        const initY = Math.round(Math.sin(fallbackRad) * 110);

        return (
          <div
            key={node.id}
            data-neon-node="true"
            title={node.name}
            style={{
              transform: `translate3d(calc(50% + ${initX}px), calc(32% + ${initY}px), 0) translate(-50%, -50%)`,
              zIndex: 25,
            }}
            className="absolute left-0 top-0 will-change-transform pointer-events-auto group cursor-pointer"
            onMouseEnter={() => {
              isHoveredRef.current = true;
            }}
            onMouseLeave={() => {
              isHoveredRef.current = false;
            }}
          >
            {/* Multi-tier Neon Tube Bloom */}
            <div
              style={{
                boxShadow: `0 0 25px ${node.glowColor}, 0 0 55px ${node.glowColor}`,
              }}
              className="absolute inset-2 rounded-full opacity-55 group-hover:opacity-100 blur-xl transition-opacity duration-300 pointer-events-none"
            />

            {/* Authentic Neon Wireframe Icon */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transition-transform duration-300 group-hover:scale-130">
              <Image
                src={node.image}
                alt={node.name}
                width={node.width}
                height={node.height}
                loading="eager"
                className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
