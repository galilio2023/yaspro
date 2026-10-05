import {
  Camera,
  Radio,
  Sparkles,
  ShieldCheck,
  Video,
  Flame,
  Globe2,
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
    colorClass: "from-brand-lavender to-brand-mauve",
    glowColor: "rgba(187, 167, 195, 0.35)",
    icon: Zap,
  },
  {
    value: "8K RAW",
    label: "Neural Virtual Production",
    detail: "Uncompressed real-time Unreal Engine 5.4 rendering",
    colorClass: "from-brand-lavender to-brand-mauve",
    glowColor: "rgba(152, 123, 165, 0.3)",
    icon: Layers,
  },
  {
    value: "400M+",
    label: "Social Creator Network",
    detail: "Direct syndicate distribution across GCC & MENA",
    colorClass: "from-brand-mauve to-brand-violet",
    glowColor: "rgba(84, 37, 104, 0.35)",
    icon: Globe2,
  },
  {
    value: "100%",
    label: "GCC Regulatory Compliance",
    detail: "Certified content standards across UAE, KSA, and Qatar",
    colorClass: "from-emerald-400 to-emerald-200",
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
    colorClass: "text-brand-mauve-soft",
    glowColor: "#bba7c3",
    radius: 85,
    duration: 22,
    delay: 0,
  },
  {
    id: "neural-grade",
    name: "Neural Color Grading",
    subtitle: "Instant DCI-P3 Tone Mapping",
    icon: Video,
    colorClass: "text-brand-mauve-soft",
    glowColor: "#987ba5",
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
    colorClass: "text-brand-lavender",
    glowColor: "#765086",
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
    colorClass: "text-brand-lavender",
    glowColor: "#765086",
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
    colorClass: "text-brand-mauve-soft",
    glowColor: "#987ba5",
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
    colorClass: "text-brand-lavender",
    glowColor: "#987ba5",
    radius: 205,
    duration: 44,
    delay: 22,
  },
];
