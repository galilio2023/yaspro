import { GEAR_DATA } from "@/features/gear/data";
import { GearItem } from "@/features/gear/types";
import { analyzeGearSelection, GearCompatibilityReport } from "@/features/gear/lib/compatibility";
import { sanitizePromptInput, sanitizeOutputString } from "./sanitize";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export interface MatchedGearPackage {
  packageTitle: string;
  rationale: string;
  targetGenre: string;
  items: {
    item: GearItem;
    role: string;
    whyNeeded: string;
  }[];
  totalDailyRate: number;
  packageDailyRate: number; // with bundled package discount
  packageSavings: number;
  compatibility: GearCompatibilityReport;
  isAiGenerated: boolean;
}

const kitSchema = z.object({
  packageTitle: z.string().describe("Catchy title for the custom cinema package"),
  rationale: z.string().describe("1-2 sentence explanation of why this equipment fits the brief"),
  targetGenre: z.string().describe("Production category, e.g. Anamorphic Commercial, Action Documentary"),
  selectedGearIds: z.array(
    z.object({
      id: z.string().describe("Exact ID from the gear catalog"),
      role: z.string().describe("Role of item in the package, e.g. A-Camera, Key Light"),
      whyNeeded: z.string().describe("Specific rationale for this item"),
    })
  ).min(1).max(5),
});

/**
 * Deterministic Gear Package Matcher
 */
function matchDeterministically(query: string, maxBudget?: number): MatchedGearPackage {
  const q = query.toLowerCase();

  let matchedItems: { item: GearItem; role: string; whyNeeded: string }[] = [];
  let packageTitle = "Custom Production Rig";
  let rationale = "Balanced cinema kit configured for your shoot parameters.";
  let targetGenre = "Commercial Production";

  if (q.includes("anamorphic") || q.includes("prestige") || q.includes("cinema") || q.includes("movie")) {
    packageTitle = "Prestige Anamorphic Cinema Package";
    rationale = "High-end large format sensor paired with cinematic optics for rich flares and organic roll-off.";
    targetGenre = "High-End Commercial / Feature";

    const bundle = GEAR_DATA.find((g) => g.id === "arri-commercial-cinema-kit");
    const anamorphicLenses = GEAR_DATA.find((g) => g.id.includes("anamorphic") || g.category === "lenses");
    const lighting = GEAR_DATA.find((g) => g.id.includes("aputure") || g.category === "lighting");

    if (bundle) {
      matchedItems.push({
        item: bundle,
        role: "A-Camera Master Cinema System",
        whyNeeded: "Turnkey Large Format ARRI ecosystem with wireless monitoring and batteries.",
      });
    }
    if (anamorphicLenses && (!bundle || !bundle.includedInKit?.some((k) => k.toLowerCase().includes("anamorphic")))) {
      matchedItems.push({
        item: anamorphicLenses,
        role: "Anamorphic Cinema Glass",
        whyNeeded: "Oval bokeh, signature streak flares, and 2.39:1 widescreen scope.",
      });
    }
    if (lighting) {
      matchedItems.push({
        item: lighting,
        role: "High-Output Key Light",
        whyNeeded: "Provides intense punch to maintain stop at high cinema frame rates.",
      });
    }
  } else if (q.includes("doc") || q.includes("run") || q.includes("event") || q.includes("solo") || q.includes("fast")) {
    packageTitle = "Run & Gun Solo Operator Kit";
    rationale = "Lightweight, ultra-fast autofocus and onboard dual wireless audio for mobile location shooting.";
    targetGenre = "Documentary / Brand Story";

    const fx6Kit = GEAR_DATA.find((g) => g.id === "sony-fx6-run-gun-kit");
    const audio = GEAR_DATA.find((g) => g.id.includes("mic") || g.category === "audio");
    const light = GEAR_DATA.find((g) => g.id.includes("astera") || g.category === "lighting");

    if (fx6Kit) {
      matchedItems.push({
        item: fx6Kit,
        role: "Primary Mobile Camera",
        whyNeeded: "Electronic variable ND, fast dual-base ISO, and all-day ergonomics.",
      });
    }
    if (audio) {
      matchedItems.push({
        item: audio,
        role: "Wireless Dialogue Capture",
        whyNeeded: "Crystal clear 32-bit float audio without clipping risk.",
      });
    }
    if (light) {
      matchedItems.push({
        item: light,
        role: "Battery-Powered Ambient Light",
        whyNeeded: "Wireless DMX tube lights for quick ambient fill without AC power.",
      });
    }
  } else if (q.includes("podcast") || q.includes("interview") || q.includes("talk") || q.includes("youtube")) {
    packageTitle = "Multi-Cam Broadcast Interview Kit";
    rationale = "Optimized for continuous dialogue recording, soft flattering portrait lighting, and clean broadcast audio.";
    targetGenre = "Broadcast / Podcast Stream";

    const cam = GEAR_DATA.find((g) => g.id === "sony-fx6-run-gun-kit") || GEAR_DATA[0];
    const mic = GEAR_DATA.find((g) => g.id.includes("sennheiser") || g.category === "audio");
    const light = GEAR_DATA.find((g) => g.category === "lighting");

    if (cam) matchedItems.push({ item: cam, role: "Principal Host Camera", whyNeeded: "Clean 4K feed with no overheating for multi-hour takes." });
    if (mic) matchedItems.push({ item: mic, role: "Broadcast Shotgun Mic", whyNeeded: "Rejects room reverb and ambient air conditioning noise." });
    if (light) matchedItems.push({ item: light, role: "Soft Studio Key", whyNeeded: "Natural flattering eye highlights and soft falloff." });
  } else {
    // Default balanced commercial kit
    const bundle = GEAR_DATA.find((g) => g.category === "bundles") || GEAR_DATA[0];
    const light = GEAR_DATA.find((g) => g.category === "lighting");
    const audio = GEAR_DATA.find((g) => g.category === "audio");

    if (bundle) matchedItems.push({ item: bundle, role: "Core Production System", whyNeeded: "Industry standard cinema body calibrated for commercial delivery." });
    if (light) matchedItems.push({ item: light, role: "Key Production Lighting", whyNeeded: "High CRI lighting foundation for consistent commercial aesthetics." });
    if (audio) matchedItems.push({ item: audio, role: "Production Sound Kit", whyNeeded: "Pristine dialogue capture on set." });
  }

  // Filter within budget if requested
  if (maxBudget && maxBudget > 0) {
    let currentTotal = matchedItems.reduce((acc, m) => acc + m.item.dailyRate, 0);
    while (currentTotal > maxBudget && matchedItems.length > 1) {
      matchedItems.pop();
      currentTotal = matchedItems.reduce((acc, m) => acc + m.item.dailyRate, 0);
    }
  }

  const totalDailyRate = matchedItems.reduce((acc, m) => acc + m.item.dailyRate, 0);
  const packageDailyRate = Math.round(totalDailyRate * 0.88); // 12% package bundle discount
  const packageSavings = totalDailyRate - packageDailyRate;

  const itemIds = matchedItems.map((m) => m.item.id);
  const compatibility = analyzeGearSelection(itemIds);

  return {
    packageTitle,
    rationale,
    targetGenre,
    items: matchedItems,
    totalDailyRate,
    packageDailyRate,
    packageSavings,
    compatibility,
    isAiGenerated: false,
  };
}

/**
 * Intelligent AI Kit Matcher
 */
export async function matchGearPackage(
  query: string,
  maxDailyBudget?: number
): Promise<MatchedGearPackage> {
  const sanitizedQuery = sanitizePromptInput(query || "", 500);
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (apiKey && sanitizedQuery.length >= 5) {
    try {
      const catalogSummary = GEAR_DATA.map((g) => ({
        id: g.id,
        name: g.name,
        category: g.category,
        rate: g.dailyRate,
        specs: g.specs.join(", "),
      }));

      const prompt = `You are the Master Rental Tech and Cinema Engineer at Yas Pro Media.
A filmmaker is requesting gear for a production shoot:
"${sanitizedQuery}"
${maxDailyBudget ? `Maximum daily budget: ${maxDailyBudget} AED/day.` : ""}

Select the best 2 to 4 equipment items from our exact catalog to assemble a complete, harmonious cinema package.
CATALOG:
${JSON.stringify(catalogSummary, null, 2)}

Provide a title, genre, rationale, and exact catalog item IDs.`;

      const result = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: kitSchema,
        prompt,
      });

      const { packageTitle, rationale, targetGenre, selectedGearIds } = result.object;

      const matchedItems: MatchedGearPackage["items"] = [];
      for (const sel of selectedGearIds) {
        const found = GEAR_DATA.find((g) => g.id === sel.id);
        if (found) {
          matchedItems.push({
            item: found,
            role: sanitizeOutputString(sel.role),
            whyNeeded: sanitizeOutputString(sel.whyNeeded),
          });
        }
      }

      if (matchedItems.length === 0) {
        return matchDeterministically(sanitizedQuery, maxDailyBudget);
      }

      const totalDailyRate = matchedItems.reduce((acc, m) => acc + m.item.dailyRate, 0);
      const packageDailyRate = Math.round(totalDailyRate * 0.88);
      const packageSavings = totalDailyRate - packageDailyRate;
      const compatibility = analyzeGearSelection(matchedItems.map((m) => m.item.id));

      return {
        packageTitle: sanitizeOutputString(packageTitle),
        rationale: sanitizeOutputString(rationale),
        targetGenre: sanitizeOutputString(targetGenre),
        items: matchedItems,
        totalDailyRate,
        packageDailyRate,
        packageSavings,
        compatibility,
        isAiGenerated: true,
      };
    } catch {
      return matchDeterministically(sanitizedQuery, maxDailyBudget);
    }
  }

  return matchDeterministically(sanitizedQuery, maxDailyBudget);
}
