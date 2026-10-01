import React from "react";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { GearCartDrawer } from "@/features/gear/components/GearCartDrawer";

export default function PortalGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CommandPalette />
      <GearCartDrawer />
    </>
  );
}
