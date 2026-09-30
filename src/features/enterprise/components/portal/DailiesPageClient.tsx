"use client";

import React, { useState } from "react";
import { PortalDailies, type DailyClip } from "@/features/enterprise/components/portal/PortalDailies";

const SAMPLE_DAILIES: DailyClip[] = [
  {
    id: "clip-01",
    title: "Take 04 - UAE Flag Day Cinema Golden Hour Aerial",
    thumbnail: "/images/projects/flag-day.jpg",
    duration: "02:45",
    timecode: "00:14:22:18",
    camera: "RED V-Raptor XL 8K / Master Prime 35mm",
    status: "APPROVED",
    watermarkCode: "DEMO-WATERMARK-DXB-9912",
  },
  {
    id: "clip-02",
    title: "Take 07 - Dubai Sports Council Stadium FPV Sprint",
    thumbnail: "/images/projects/stadiums-dubai.jpg",
    duration: "01:18",
    timecode: "01:08:44:02",
    camera: "High-Speed FPV / Sony FX6 Rig",
    status: "APPROVED",
    watermarkCode: "DEMO-WATERMARK-DXB-9912",
  },
  {
    id: "clip-03",
    title: "Take 12 - Virtual Production LED Cyc Diriyah Gate Sequence",
    thumbnail: "/images/projects/dmx.jpg",
    duration: "03:10",
    timecode: "02:22:15:10",
    camera: "ARRI Alexa 35 / Unreal 5.4 LiveLink",
    status: "PENDING_REVIEW",
    watermarkCode: "DEMO-WATERMARK-DXB-9912",
  },
];

export function DailiesPageClient() {
  const [activeClip, setActiveClip] = useState<DailyClip>(SAMPLE_DAILIES[0]);

  return (
    <PortalDailies
      activeClip={activeClip}
      clips={SAMPLE_DAILIES}
      onSelectClip={setActiveClip}
    />
  );
}
