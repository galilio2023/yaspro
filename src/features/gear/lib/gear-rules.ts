import { GEAR_DATA } from "../data";
import { GearItem } from "../types";

export interface GearRecommendation {
  triggerItemId: string;
  recommendedItem: GearItem;
  reason: string;
  badge: "Essential" | "Recommended" | "Kit Upgrade";
}

/**
 * Knowledge Graph rules mapping gear combinations to missing essentials
 */
export function getGearRecommendations(cartItemIds: string[]): GearRecommendation[] {
  const recommendations: GearRecommendation[] = [];
  const cartSet = new Set(cartItemIds);

  for (const itemId of cartItemIds) {
    // 1. If cinema camera is selected, recommend lighting or wireless monitor if not in cart
    if (itemId === "arri-alexa-mini-lf" || itemId === "red-v-raptor-xl") {
      const monitor = GEAR_DATA.find((g) => g.id.includes("monitor") || g.id === "smallhd-cine-7");
      if (monitor && !cartSet.has(monitor.id)) {
        recommendations.push({
          triggerItemId: itemId,
          recommendedItem: monitor,
          reason: "High-bright wireless directors monitor required for critical focus pull.",
          badge: "Essential",
        });
      }

      const skypanel = GEAR_DATA.find((g) => g.id.includes("skypanel") || g.id.includes("light") || g.category === "lighting");
      if (skypanel && !cartSet.has(skypanel.id)) {
        recommendations.push({
          triggerItemId: itemId,
          recommendedItem: skypanel,
          reason: "Key studio lighting softbox ensures optimal large-format dynamic range.",
          badge: "Recommended",
        });
      }
    }

    // 2. If camera body without audio is selected
    if (itemId === "sony-fx6-run-gun-kit" || itemId === "sony-a7siii-content-kit") {
      const audioKit = GEAR_DATA.find((g) => g.category === "audio" || g.id.includes("mic"));
      if (audioKit && !cartSet.has(audioKit.id)) {
        recommendations.push({
          triggerItemId: itemId,
          recommendedItem: audioKit,
          reason: "Wireless dual-transmitter mic kit for crisp broadcast-quality vocal isolation.",
          badge: "Recommended",
        });
      }
    }
  }

  // Deduplicate recommendations by item ID
  const seen = new Set<string>();
  return recommendations.filter((r) => {
    if (seen.has(r.recommendedItem.id)) return false;
    seen.add(r.recommendedItem.id);
    return true;
  });
}
