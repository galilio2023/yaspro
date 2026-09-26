import {
  Calendar,
  Camera,
  Sparkles,
  Users,
  Layers,
  CreditCard,
} from "lucide-react";
import { BookingState, SessionTypeItem, StudioItem, StudioGearPackage, WizardStepItem } from "./types";

export const INITIAL_BOOKING_STATE: BookingState = {
  date: "",
  time: "10:00",
  durationHours: 2,
  headcount: 2,
  sessionType: "video_production",
  studioId: "studio-a",
  needsCrew: false,
  selectedGearPackage: "none",
  equipmentNotes: "",
  propsNotes: "",
  needsEditing: false,
  needsColorGrading: false,
  needsSoundMastering: false,
  needsAiAutoCut: false,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  specialRequests: "",
};

export const SESSION_TYPES: readonly SessionTypeItem[] = [
  { id: "virtual_production", label: "Virtual Production (XR)", icon: "🌌", desc: "3D real-time Unreal set" },
  { id: "podcast", label: "Podcast", icon: "🎙️", desc: "Audio & video recording" },
  { id: "video_production", label: "Video Production", icon: "🎬", desc: "Full 4K video shoot" },
  { id: "photography", label: "Photography", icon: "📸", desc: "Studio photo session" },
  { id: "interview", label: "Interview", icon: "🎤", desc: "Talk show & interviews" },
  { id: "commercial", label: "Commercial", icon: "📺", desc: "Brand & ad production" },
  { id: "music_video", label: "Music Video", icon: "🎵", desc: "Music video production" },
];

export const STUDIOS: readonly StudioItem[] = [
  {
    id: "studio-xr",
    name: "Studio XR — Virtual Production Stage",
    desc: "270° Micro-LED volume, Unreal Engine 5.4 LiveSync, Mo-Sys optical tracking",
    rate: 1500,
    image: "/images/projects/dmx.jpg",
  },
  {
    id: "studio-a",
    name: "Studio A — Main Stage",
    desc: "4K ready, 200 sqm, cyclorama & motorized lighting",
    rate: 800,
    image: "/images/projects/dmx.jpg",
  },
  {
    id: "studio-b",
    name: "Studio B — Podcast Suite",
    desc: "Acoustic-treated, 4 Shure mics, multi-cam 4K switcher",
    rate: 400,
    image: "/images/studios/podcast-suite.jpg",
  },
  {
    id: "studio-c",
    name: "Studio C — Photography",
    desc: "Cyclorama infinity wall, full Profoto lighting kit",
    rate: 600,
    image: "/images/projects/flag-day.jpg",
  },
];

export const STUDIO_GEAR_PACKAGES: readonly StudioGearPackage[] = [
  {
    id: "none",
    name: "Bring My Own Equipment",
    rate: 0,
    description: "Use the soundstage with your own camera & lighting gear.",
  },
  {
    id: "sony-multicam",
    name: "Sony FX6 3-Cam 4K Studio Package",
    rate: 1200,
    description: "3x Sony FX6 4K bodies, G-Master zooms, wireless director monitor & switcher.",
  },
  {
    id: "lighting-grid",
    name: "Full Aputure Studio Lighting Grid",
    rate: 800,
    description: "Ceiling motorized grid with RGBWW color-tunable fixtures and light domes.",
  },
  {
    id: "podcast-mics",
    name: "4-Person Shure SM7B Acoustic Mic Suite",
    rate: 500,
    description: "Broadcast vocal mics with RØDECaster Pro II & live sound mastering console.",
  },
  {
    id: "arri-commercial",
    name: "ARRI Alexa Mini LF Cinema Package",
    rate: 3500,
    description: "Pre-calibrated A-camera with Cooke cinema primes and wireless focus control.",
  },
];

export const WIZARD_STEPS: readonly WizardStepItem[] = [
  { id: 1, label: "Date & Time", icon: Calendar },
  { id: 2, label: "Session Type", icon: Camera },
  { id: 3, label: "Choose Studio", icon: Sparkles },
  { id: 4, label: "Crew & Equipment", icon: Users },
  { id: 5, label: "Props & Set", icon: Layers },
  { id: 6, label: "Post Production", icon: Sparkles },
  { id: 7, label: "Contact & Confirm", icon: CreditCard },
];
