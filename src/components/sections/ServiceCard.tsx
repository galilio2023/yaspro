"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Play, Radio, Zap, CheckCircle2 } from "lucide-react";
import { CardContainer, CardBody, CardItem } from "@/components/aceternity/3d-card";
import { BorderBeam } from "@/components/magicui/border-beam";
import type { ServiceItem, ServiceIconName } from "./services.data";

const SERVICE_ICONS: Record<ServiceIconName, typeof Camera> = {
  camera: Camera,
  radio: Radio,
  play: Play,
  zap: Zap,
};

const ACCENT_COLORS: Record<ServiceIconName, { icon: string; border: string; glow: string; text: string }> = {
  camera: {
    icon: "text-brand-purple-light",
    border: "border-brand-purple/30 group-hover/card:border-brand-purple/60",
    glow: "rgba(124, 58, 237, 0.4)",
    text: "text-brand-purple-light",
  },
  radio: {
    icon: "text-brand-teal",
    border: "border-brand-teal/30 group-hover/card:border-brand-teal/60",
    glow: "rgba(6, 182, 212, 0.4)",
    text: "text-brand-teal",
  },
  play: {
    icon: "text-brand-gold",
    border: "border-brand-gold/30 group-hover/card:border-brand-gold/60",
    glow: "rgba(245, 158, 11, 0.4)",
    text: "text-brand-gold",
  },
  zap: {
    icon: "text-cyan-400",
    border: "border-cyan-500/30 group-hover/card:border-cyan-500/60",
    glow: "rgba(6, 182, 212, 0.4)",
    text: "text-cyan-400",
  },
};

export interface ServiceCardProps {
  service: ServiceItem;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = SERVICE_ICONS[service.iconName];
  const accents = ACCENT_COLORS[service.iconName];

  return (
    <CardContainer className="w-full h-full py-2">
      <CardBody className="relative group/card rounded-3xl border border-white/10 bg-[#0a0718] overflow-hidden flex flex-col justify-between h-full transition-colors duration-300 hover:border-white/25 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] [transform:translateZ(0)]">
        {/* Subtle Ambient Radial Lighting */}
        <div
          className="pointer-events-none absolute -inset-px opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 rounded-3xl z-10"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${accents.glow} 0%, transparent 60%)`,
          }}
        />

        {/* Dynamic Background Image with Depth & Dark Gradient Mask */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Image
            src={service.image}
            alt={service.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover opacity-20 filter grayscale contrast-125 group-hover/card:scale-110 group-hover/card:opacity-35 group-hover/card:grayscale-0 transition-all duration-700 ease-out"
          />
          {/* Multi-layered cinematic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0718] via-[#0a0718]/90 to-[#0a0718]/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0a0718]" />
        </div>

        {/* Highlight Border Beam for Featured Pillar */}
        {service.highlight && (
          <BorderBeam
            size={220}
            duration={10}
            colorFrom="var(--brand-purple)"
            colorTo="var(--brand-cyan)"
            className="z-20"
          />
        )}

        {/* Card Content Container */}
        <div className="relative z-20 p-6 sm:p-7 flex flex-col h-full justify-between">
          <div>
            {/* Top Bar: Icon + Status Badge */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <CardItem
                translateZ={40}
                className={`size-12 rounded-2xl bg-white/[0.06] border ${accents.border} backdrop-blur-md flex items-center justify-center shadow-lg transition-transform duration-300 group-hover/card:scale-110`}
              >
                <Icon size={22} className={accents.icon} />
              </CardItem>

              <CardItem translateZ={30}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase border border-white/10 bg-white/5 text-text-secondary backdrop-blur-md">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  {service.badge}
                </span>
              </CardItem>
            </div>

            {/* Subtitle & Title */}
            <CardItem translateZ={30} className="mb-1">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-brand-purple-light/80 block">
                {service.subtitle}
              </span>
            </CardItem>

            <CardItem
              translateZ={45}
              as="h3"
              className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight mb-3 group-hover/card:text-brand-purple-lighter transition-colors duration-300"
            >
              {service.title}
            </CardItem>

            {/* Description */}
            <CardItem
              translateZ={25}
              as="p"
              className="text-text-secondary text-xs sm:text-sm leading-relaxed mb-6 line-clamp-3 group-hover/card:text-white/80 transition-colors"
            >
              {service.description}
            </CardItem>

            {/* Tech Specs Badges */}
            <CardItem translateZ={35} className="flex flex-wrap gap-1.5 mb-6">
              {service.specs.map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium text-text-muted bg-white/[0.04] border border-white/5 group-hover/card:border-white/15 group-hover/card:text-text-secondary transition-colors"
                >
                  <CheckCircle2 size={10} className="text-brand-purple-light shrink-0" />
                  {spec}
                </span>
              ))}
            </CardItem>
          </div>

          {/* Bottom Card Footer: Key Metric + Interactive Action Link */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 mt-auto">
            <CardItem translateZ={25} className="flex flex-col">
              <span className="text-sm font-extrabold font-display text-white group-hover/card:text-brand-cyan transition-colors">
                {service.stat}
              </span>
              <span className="text-[10px] uppercase font-mono text-text-muted tracking-wider">
                {service.statLabel}
              </span>
            </CardItem>

            <CardItem translateZ={40}>
              <Link
                href={service.href}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-brand-purple border border-white/15 hover:border-brand-purple transition-all duration-300 shadow-md group/btn"
              >
                <span>Book Now</span>
                <ArrowRight
                  size={12}
                  className="transition-transform duration-300 group-hover/btn:translate-x-1"
                />
              </Link>
            </CardItem>
          </div>
        </div>
      </CardBody>
    </CardContainer>
  );
}
