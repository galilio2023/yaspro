import {
  Camera,
  Radio,
  Sparkles,
  ShieldCheck,
  Video,
  Flame,
  Globe2,
  Cpu,
  Zap,
  Layers,
  LucideIcon,
} from "lucide-react";

export interface EcosystemMetric {
  value: string;
  label: string;
  detail: string;
  colorClass: string;
  glowColor: string;
  icon: LucideIcon;
}

export const ECOSYSTEM_METRICS: readonly EcosystemMetric[] = [
  {
    value: "0.2s",
    label: "Ultra Low-Latency Routing",
    detail: "Direct fiber uplink from OB-VAN to master control room",
    colorClass: "from-brand-purple to-brand-purple-light",
    glowColor: "rgba(124, 58, 237, 0.3)",
    icon: Zap,
  },
  {
    value: "8K RAW",
    label: "Neural Virtual Production",
    detail: "Uncompressed real-time Unreal Engine 5.4 rendering",
    colorClass: "from-brand-cyan to-teal-300",
    glowColor: "rgba(6, 182, 212, 0.3)",
    icon: Layers,
  },
  {
    value: "400M+",
    label: "Social Creator Network",
    detail: "Direct syndicate distribution across GCC & MENA",
    colorClass: "from-amber-400 to-orange-400",
    glowColor: "rgba(245, 158, 11, 0.3)",
    icon: Globe2,
  },
  {
    value: "100%",
    label: "GCC Regulatory Compliance",
    detail: "Certified content standards across UAE, KSA, and Qatar",
    colorClass: "from-emerald-400 to-teal-300",
    glowColor: "rgba(16, 185, 129, 0.3)",
    icon: ShieldCheck,
  },
];

export interface OrbitNodeConfig {
  id: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  colorClass: string;
  glowColor: string;
  radius: number;
  duration: number;
  delay: number;
  reverse?: boolean;
}

export const ORBIT_NODES: readonly OrbitNodeConfig[] = [
  // Inner Orbit: Capture & Neural Ingest (Radius: 80px)
  {
    id: "auto-director",
    name: "AI Camera Director",
    subtitle: "Real-Time Multi-Cam Switching",
    icon: Camera,
    colorClass: "text-brand-cyan",
    glowColor: "#06b6d4",
    radius: 85,
    duration: 22,
    delay: 0,
  },
  {
    id: "neural-grade",
    name: "Neural Color Grading",
    subtitle: "Instant DCI-P3 Tone Mapping",
    icon: Video,
    colorClass: "text-brand-purple-light",
    glowColor: "#c4b5fd",
    radius: 85,
    duration: 22,
    delay: 11,
  },

  // Middle Orbit: Generative Synthesis & Post-Prod (Radius: 145px)
  {
    id: "ob-mesh",
    name: "OB-Van Mesh Uplink",
    subtitle: "High-Bandwidth Bonded Fiber",
    icon: Radio,
    colorClass: "text-amber-400",
    glowColor: "#f59e0b",
    radius: 145,
    duration: 32,
    delay: 0,
    reverse: true,
  },
  {
    id: "genai-previz",
    name: "GenAI Previz Engine",
    subtitle: "3D Storyboard Generation",
    icon: Flame,
    colorClass: "text-rose-400",
    glowColor: "#f43f5e",
    radius: 145,
    duration: 32,
    delay: 11,
    reverse: true,
  },
  {
    id: "cloud-vfx",
    name: "Cloud Neural VFX",
    subtitle: "Automated Rotoscoping & Cleanplate",
    icon: Sparkles,
    colorClass: "text-purple-400",
    glowColor: "#a855f7",
    radius: 145,
    duration: 32,
    delay: 22,
    reverse: true,
  },

  // Outer Orbit: Security & GCC Distribution (Radius: 210px)
  {
    id: "compliance-ai",
    name: "GCC Compliance AI",
    subtitle: "Automated Content Classification",
    icon: ShieldCheck,
    colorClass: "text-emerald-400",
    glowColor: "#10b981",
    radius: 205,
    duration: 44,
    delay: 0,
  },
  {
    id: "global-cdn",
    name: "Global Edge Broadcast",
    subtitle: "Ultra Low-Jitter 4K Streaming",
    icon: Globe2,
    colorClass: "text-cyan-400",
    glowColor: "#22d3ee",
    radius: 205,
    duration: 44,
    delay: 22,
  },
];
