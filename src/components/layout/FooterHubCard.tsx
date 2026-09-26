"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Phone, ExternalLink, Clock } from "lucide-react";

export interface RegionalHub {
  city: string;
  role: string;
  address: string;
  phone: string;
  timeZone: string;
  flag: string;
  coordinates: string;
  mapUrl?: string;
}

interface FooterHubCardProps {
  hub: RegionalHub;
}

export function FooterHubCard({ hub }: FooterHubCardProps) {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: hub.timeZone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        setTime(formatter.format(now));
      } catch {
        setTime("");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [hub.timeZone]);

  return (
    <div className="group relative rounded-2xl bg-card/60 backdrop-blur-xl p-4 flex flex-col justify-between border border-white/[0.08] hover:border-brand-purple/40 hover:bg-brand-purple/[0.06] transition-all duration-300 shadow-lg shadow-black/20 overflow-hidden">
      {/* Subtle hover gradient glow */}
      <div className="absolute -top-10 -right-10 size-24 bg-brand-purple/10 rounded-full blur-xl group-hover:bg-brand-purple/20 transition-all pointer-events-none" />

      <div>
        {/* City header with Flag & Live Time */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base" role="img" aria-label={hub.city}>
              {hub.flag}
            </span>
            <span className="text-xs font-bold text-white tracking-wide truncate">
              {hub.city}
            </span>
          </div>

          {time && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] text-brand-purple-light font-mono shrink-0">
              <Clock size={9} className="text-brand-cyan" />
              <span>{time}</span>
            </div>
          )}
        </div>

        {/* Studio Role */}
        <p className="text-[11px] font-semibold text-brand-purple-mid mb-1.5 leading-snug">
          {hub.role}
        </p>

        {/* Address */}
        {hub.mapUrl ? (
          <a
            href={hub.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-text-secondary hover:text-white transition-colors leading-relaxed block group/link"
          >
            <span className="flex items-start gap-1">
              <MapPin size={11} className="shrink-0 text-brand-gold mt-0.5" />
              <span className="underline-offset-2 group-hover/link:underline">{hub.address}</span>
            </span>
          </a>
        ) : (
          <p className="text-[11px] text-text-secondary leading-relaxed flex items-start gap-1">
            <MapPin size={11} className="shrink-0 text-brand-gold mt-0.5" />
            <span>{hub.address}</span>
          </p>
        )}
      </div>

      {/* Footer info: Coordinates & Quick Call */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px]">
        <a
          href={`tel:${hub.phone}`}
          className="flex items-center gap-1 text-text-muted hover:text-brand-teal-light transition-colors font-medium"
        >
          <Phone size={10} className="text-brand-cyan" />
          <span>{hub.phone}</span>
        </a>

        {hub.mapUrl && (
          <a
            href={hub.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Maps"
            className="text-text-muted hover:text-brand-cyan transition-colors flex items-center gap-0.5"
          >
            <span>Map</span>
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}
