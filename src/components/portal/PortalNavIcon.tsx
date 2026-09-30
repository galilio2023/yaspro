import React from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  FileSpreadsheet,
  Settings,
  Headphones,
  Video,
  FileText,
  Calendar,
  Radio,
} from "lucide-react";
import type { PortalNavIconKey } from "./types";

export function PortalNavIcon({
  name,
  size = 18,
  className,
}: {
  name: PortalNavIconKey;
  size?: number;
  className?: string;
}) {
  switch (name) {
    case "dashboard":
      return <LayoutDashboard size={size} className={className} />;
    case "bookings":
      return <CalendarCheck size={size} className={className} />;
    case "invoices":
      return <FileSpreadsheet size={size} className={className} />;
    case "settings":
      return <Settings size={size} className={className} />;
    case "support":
      return <Headphones size={size} className={className} />;
    case "dailies":
      return <Video size={size} className={className} />;
    case "rfps":
      return <FileText size={size} className={className} />;
    case "stages":
      return <Calendar size={size} className={className} />;
    case "telemetry":
      return <Radio size={size} className={className} />;
    default:
      return null;
  }
}
