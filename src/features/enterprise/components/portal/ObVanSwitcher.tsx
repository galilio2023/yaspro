"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CameraFeed } from "./ObVanMonitor";

interface ObVanSwitcherProps {
  feeds: CameraFeed[];
  activeCam: CameraFeed;
  onSelectCam: (feed: CameraFeed) => void;
  onDispatchVan?: () => void;
}

export function ObVanSwitcher({
  feeds,
  activeCam,
  onSelectCam,
  onDispatchVan,
}: ObVanSwitcherProps) {
  return (
    <div className="lg:col-span-4 p-3.5 sm:p-4 bg-slate-900/90 flex flex-col justify-between">
      <div>
        <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-2.5 sm:mb-3 flex items-center justify-between">
          <span>Multiview Matrix</span>
          <span className="text-brand-cyan font-bold">SMPTE ST 2110</span>
        </div>

        {/* Camera Feed Thumbnail Grid: 3 cols on mobile, 2 cols on lg desktop */}
        <div className="grid grid-cols-3 lg:grid-cols-2 gap-1.5 sm:gap-2 mb-4">
          {feeds.map((cam) => {
            const isSelected = activeCam.id === cam.id;
            return (
              <button
                key={cam.id}
                type="button"
                onClick={() => onSelectCam(cam)}
                className={`relative rounded-xl overflow-hidden border p-1 text-left transition-all cursor-pointer group ${
                  isSelected
                    ? "border-red-500 ring-2 ring-red-500/40 bg-black"
                    : "border-white/10 bg-black/40 hover:border-white/20"
                }`}
              >
                <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden mb-1">
                  <Image
                    src={cam.image}
                    alt={cam.label}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                  <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-black/85 text-[8px] sm:text-[9px] font-mono text-white font-bold">
                    CAM {cam.id}
                  </div>
                </div>
                <div className="text-[9px] sm:text-[10px] font-bold text-white truncate px-0.5">
                  {cam.label.split(":")[1]?.trim() || cam.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Command Action */}
      <div className="pt-3 border-t border-white/10">
        {onDispatchVan && (
          <button
            type="button"
            onClick={onDispatchVan}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-brand-cyan hover:bg-brand-cyan/80 text-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-cyan/20 transition-all font-display"
          >
            <span>Request OB-Van Deployment</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
