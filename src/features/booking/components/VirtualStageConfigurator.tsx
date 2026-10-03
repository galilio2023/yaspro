"use client";

import React, { useState, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Grid } from "@react-three/drei";
import { Layers, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StagePreset {
  id: string;
  name: string;
  ledCurve: number; // degrees
  lightingRigs: number;
  cameraTrack: "optical" | "rail" | "crane";
  ambientColor: string;
  gridDensity: number;
  description: string;
}

const PRESETS: StagePreset[] = [
  {
    id: "commercial-led",
    name: "270° Commercial LED Volume",
    ledCurve: 270,
    lightingRigs: 6,
    cameraTrack: "optical",
    ambientColor: "#f59e0b",
    gridDensity: 1.2,
    description: "Curved panoramic LED wall synced with Unreal Engine 5.4 LiveLink optical tracking.",
  },
  {
    id: "cyc-infinity",
    name: "Acoustic Cyc & Overhead DMX Grid",
    ledCurve: 90,
    lightingRigs: 8,
    cameraTrack: "rail",
    ambientColor: "#d97706",
    gridDensity: 0.8,
    description: "Full white/green infinity cyclorama with ceiling motorized SkyPanels for high-fashion.",
  },
  {
    id: "podcast-broadcast",
    name: "4-Camera Live Stream Suite",
    ledCurve: 45,
    lightingRigs: 4,
    cameraTrack: "crane",
    ambientColor: "#f59e0b",
    gridDensity: 0.5,
    description: "Compact acoustic sound room with broadcast pedestal mounts and neon backdrops.",
  },
];

function VirtualStage3DModel({
  preset,
  reducedMotion = false,
}: {
  preset: StagePreset;
  reducedMotion?: boolean;
}) {
  return (
    <group>
      {/* Soundstage Floor Grid */}
      <Grid
        position={[0, -1, 0]}
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={1}
        cellColor="#f59e0b"
        sectionSize={2.5}
        sectionThickness={1.5}
        sectionColor="#d97706"
        fadeDistance={12}
        fadeStrength={1.5}
      />

      {/* Curved LED Wall Representation */}
      <mesh position={[0, 0.5, -2.5]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[3.2, 3.2, 3, 32, 1, true, 0, (preset.ledCurve * Math.PI) / 180]} />
        <meshStandardMaterial
          color={preset.ambientColor}
          emissive={preset.ambientColor}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
          wireframe={false}
          side={2}
        />
      </mesh>

      {/* Ceiling Lighting Truss Array */}
      {Array.from({ length: preset.lightingRigs }).map((_, i) => {
        const angle = (i / preset.lightingRigs) * Math.PI - Math.PI / 2;
        const x = Math.cos(angle) * 2;
        const z = Math.sin(angle) * 2;
        const fixtureMesh = (
          <mesh position={[x, 2, z]}>
            <boxGeometry args={[0.4, 0.15, 0.25]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={1.2}
            />
          </mesh>
        );

        return reducedMotion ? (
          <group key={i}>{fixtureMesh}</group>
        ) : (
          <Float key={i} speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
            {fixtureMesh}
          </Float>
        );
      })}

      {/* Central Actor / Prop Target Marker */}
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 32]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
      </mesh>

      {/* Camera Position Marker */}
      <mesh position={[0, -0.2, 2]}>
        <boxGeometry args={[0.3, 0.25, 0.4]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.1} />
      </mesh>

      <ambientLight intensity={0.5} />
      <pointLight position={[0, 3, 0]} intensity={15} color={preset.ambientColor} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
    </group>
  );
}

export function VirtualStageConfigurator() {
  const [activePreset, setActivePreset] = useState<StagePreset>(PRESETS[0]);
  const prefersReducedMotion = useSyncExternalStore(
    (callback) => {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      mediaQuery.addEventListener("change", callback);
      return () => mediaQuery.removeEventListener("change", callback);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl mb-8">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Layers size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white font-display">
                Interactive 3D Virtual Production Stage Preview
              </span>
              <Badge variant="gold" className="text-[9px] uppercase tracking-wider font-mono">
                WebGL 3D
              </Badge>
            </div>
            <p className="text-[11px] text-text-secondary">
              Rotate, inspect lighting vectors, and select pre-configured LED stage setups.
            </p>
          </div>
        </div>

        {/* Preset Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {PRESETS.map((p) => {
            const isSelected = p.id === activePreset.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setActivePreset(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/20 border border-amber-400"
                    : "bg-white/5 text-text-muted hover:text-white border border-white/5"
                }`}
              >
                {isSelected && <Check size={12} />}
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative h-[320px] sm:h-[400px] w-full bg-gradient-to-b from-black to-slate-950">
        <Canvas
          camera={{ position: [0, 3, 5.5], fov: 50 }}
          className="size-full cursor-grab active:cursor-grabbing"
        >
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            maxPolarAngle={Math.PI / 2.05}
            minDistance={3}
            maxDistance={8}
            autoRotate={!prefersReducedMotion}
            autoRotateSpeed={0.8}
          />
          <VirtualStage3DModel preset={activePreset} reducedMotion={prefersReducedMotion} />
        </Canvas>

        {/* Floating HUD Telemetry */}
        <div className="absolute top-4 left-4 pointer-events-none space-y-1.5 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs font-mono">
          <div className="text-amber-400 font-bold flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400" />
            {activePreset.name}
          </div>
          <div className="text-[10px] text-slate-300">
            • Curvature: {activePreset.ledCurve}° Sweep
          </div>
          <div className="text-[10px] text-slate-300">
            • Rig: {activePreset.lightingRigs} Motorized DMX Overhead Nodes
          </div>
          <div className="text-[10px] text-slate-300">
            • Camera Sync: {activePreset.cameraTrack.toUpperCase()} Genlock 24.00 fps
          </div>
        </div>

        {/* Drag Hint */}
        <div className="absolute bottom-4 right-4 pointer-events-none bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-mono text-slate-400">
          Click &amp; Drag to rotate 3D volume
        </div>
      </div>

      {/* Detail description */}
      <div className="p-4 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <p className="text-text-secondary leading-relaxed" aria-live="polite">
          {activePreset.description}
        </p>
        <span className="text-amber-400 font-mono text-[11px] shrink-0 font-bold">
          Calibrated for Unreal 5.4 LiveLink
        </span>
      </div>
    </div>
  );
}
