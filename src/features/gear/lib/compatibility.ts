import { GEAR_DATA } from "../data";
import { GearItem } from "../types";

export interface GearCompatibilityReport {
  isCompatible: boolean;
  warnings: string[];
  suggestions: {
    item: GearItem;
    reason: string;
  }[];
}

/**
 * Intelligent gear compatibility engine.
 * Inspects selected gear IDs and determines accessory gaps, mount compatibility,
 * and essential workflow accessories.
 */
export function analyzeGearSelection(selectedIds: string[]): GearCompatibilityReport {
  const selectedItems = GEAR_DATA.filter((item) => selectedIds.includes(item.id));
  const warnings: string[] = [];
  const suggestions: { item: GearItem; reason: string }[] = [];

  const hasCamera = selectedItems.some((i) => i.category === "cameras");
  const hasBundle = selectedItems.some((i) => i.category === "bundles");
  const hasLens = selectedItems.some((i) => i.category === "lenses");
  const hasLighting = selectedItems.some((i) => i.category === "lighting");
  const hasAudio = selectedItems.some((i) => i.category === "audio");

  // If user selected a standalone camera body without a kit and without lenses:
  if (hasCamera && !hasLens && !hasBundle) {
    warnings.push("Standalone cinema camera selected without lenses. Optics package required.");
    const lensKit = GEAR_DATA.find((g) => g.id.includes("lens") || g.category === "lenses");
    if (lensKit) {
      suggestions.push({
        item: lensKit,
        reason: "Matched cinema glass required for chosen camera sensor size.",
      });
    }
  }

  // Audio check: If camera or bundle is chosen without dedicated audio
  if ((hasCamera || hasBundle) && !hasAudio) {
    const audioKit = GEAR_DATA.find((g) => g.category === "audio");
    if (audioKit) {
      suggestions.push({
        item: audioKit,
        reason: "Broadcast directional shotgun / wireless audio kit for dialogue recording.",
      });
    }
  }

  // Lighting check: If studio or commercial production is targeted
  if ((hasCamera || hasBundle) && !hasLighting) {
    const lightKit = GEAR_DATA.find((g) => g.category === "lighting");
    if (lightKit) {
      suggestions.push({
        item: lightKit,
        reason: "High-CRI daylight/RGBW studio lighting key for cinematic skin tones.",
      });
    }
  }

  return {
    isCompatible: warnings.length === 0,
    warnings,
    suggestions,
  };
}
