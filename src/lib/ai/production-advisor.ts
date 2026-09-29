import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { GEAR_DATA } from "@/features/gear/data";
import { INFLUENCERS_DATA } from "@/features/influencers/data";
import { STUDIOS } from "@/features/booking/constants";
import { sanitizePromptInput } from "./sanitize";

export interface ProductionProposalRequest {
  brief: string;
  targetMarket?: string;
  estimatedBudget?: string;
  timelineDays?: number;
}

export interface ProductionProposalResponse {
  campaignConcept: string;
  creativeTone: string;
  visualShotList: {
    shotNumber: number;
    description: string;
    cameraAngle: string;
    lightingStyle: string;
  }[];
  recommendedStudio: {
    id: string;
    name: string;
    location: string;
    dailyRate: number;
    reason: string;
  };
  recommendedGear: {
    id: string;
    name: string;
    category: string;
    dailyRate: number;
    fitReason: string;
  }[];
  recommendedInfluencers: {
    id: string;
    name: string;
    role: string;
    flag: string;
    followers: string;
    resonanceReason: string;
  }[];
  estimatedTotalAed: number;
  productionTimeline: {
    phase: string;
    duration: string;
    deliverables: string[];
  }[];
  complianceCheck: {
    mawthooqCertified: boolean;
    sovereignCloudCompliant: boolean;
    culturalAdvisoryNotes: string[];
  };
  isAiGenerated: boolean;
}

// Anti-hallucination: Hard-lock studio IDs to genuine soundstage catalog
const VALID_STUDIO_IDS = ["studio-xr", "studio-a", "studio-b", "studio-c"] as const;

const proposalSchema = z.object({
  campaignConcept: z.string().describe("A compelling 1-2 sentence concept statement for the production campaign"),
  creativeTone: z.string().describe("Visual and audio tone, e.g. Prestigious Cinematic Khaleeji"),
  visualShotList: z.array(
    z.object({
      shotNumber: z.number(),
      description: z.string(),
      cameraAngle: z.string(),
      lightingStyle: z.string(),
    })
  ).min(2).max(5).describe("Key storyboard shots for the commercial"),
  selectedStudioId: z.enum(VALID_STUDIO_IDS).describe("Exact ID of the matching studio from the catalog"),
  studioReason: z.string().describe("Why this studio fits the creative brief"),
  selectedGearIds: z.array(
    z.object({
      id: z.string(),
      fitReason: z.string(),
    })
  ).min(1).max(4).describe("Catalog gear IDs with rationale for why they are chosen"),
  selectedInfluencerIds: z.array(
    z.object({
      id: z.string(),
      resonanceReason: z.string(),
    })
  ).min(1).max(2).describe("Catalog influencer IDs matching the demographic"),
  culturalAdvisoryNotes: z.array(z.string()).describe("Cultural nuances, GCAM/Mawthooq compliance notes"),
});

/**
 * Intelligent Production Advisor with Google Gemini AI.
 * Transforms user creative briefs into fully budgeted and scheduled production blueprints.
 * Automatically falls back to deterministic rule engine if API key is not configured.
 */
export async function generateProductionProposal(
  req: ProductionProposalRequest
): Promise<ProductionProposalResponse> {
  const sanitizedBrief = sanitizePromptInput(req.brief || "", 3000);
  const sanitizedTargetMarket = sanitizePromptInput(req.targetMarket || "GCC / UAE / KSA", 100);
  const sanitizedBudget = sanitizePromptInput(req.estimatedBudget || "Standard Enterprise", 100);
  const sanitizedDays = Math.min(Math.max(1, req.timelineDays || 2), 30);

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (apiKey) {
    try {
      const studioCatalog = STUDIOS.map((s) => ({
        id: s.id,
        name: s.name,
        rate: s.rate * 8, // 8-hour day rate
        description: s.desc,
      }));

      const gearCatalog = GEAR_DATA.slice(0, 12).map((g) => ({
        id: g.id,
        name: g.name,
        category: g.category,
        dailyRate: g.dailyRate,
        specs: g.specs,
      }));

      const creatorCatalog = INFLUENCERS_DATA.map((i) => ({
        id: i.id,
        name: i.name,
        role: i.role,
        nationality: i.nationality,
        bio: i.bio,
        followers: i.totalFollowers,
      }));

      const prompt = `You are the Lead Creative Director and Executive Producer for Yas Pro, a premier Middle Eastern media production studio based in Dubai and Riyadh.
Analyze the following creative brief and engineer an optimal production package using ONLY items available in our catalog.
Never invent or hallucinate equipment, soundstages, or rates outside the provided catalog.

CLIENT BRIEF:
${sanitizedBrief}

TARGET MARKET: ${sanitizedTargetMarket}
BUDGET TIER: ${sanitizedBudget}
SHOOT DAYS: ${sanitizedDays}

CATALOG - STUDIOS:
${JSON.stringify(studioCatalog, null, 2)}

CATALOG - GEAR INVENTORY:
${JSON.stringify(gearCatalog, null, 2)}

CATALOG - CREATORS & TALENT:
${JSON.stringify(creatorCatalog, null, 2)}

Select matching IDs strictly from the catalogs above. For visualShotList, provide 3 cinematic key shots. Ensure all recommendations comply with Gulf media regulations (Mawthooq in KSA, UAE National Media Council).`;

      const result = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: proposalSchema,
        prompt,
        abortSignal: AbortSignal.timeout(20000),
      });

      const { object } = result;

      // Anti-hallucination: Cross-verify studio exists in our database
      const chosenStudio =
        STUDIOS.find((s) => s.id === object.selectedStudioId) || STUDIOS[0];

      // Anti-hallucination: Discard any hallucinated gear IDs not in catalog
      const matchedGear = object.selectedGearIds
        .map((g) => {
          const item = GEAR_DATA.find((item) => item.id === g.id);
          if (!item) return null;
          return {
            id: item.id,
            name: item.name,
            category: item.category,
            dailyRate: item.dailyRate,
            fitReason: g.fitReason.trim(),
          };
        })
        .filter((g): g is NonNullable<typeof g> => g !== null);

      // Anti-hallucination: Discard any creator IDs not in catalog
      const matchedInfluencers = object.selectedInfluencerIds
        .map((i) => {
          const creator = INFLUENCERS_DATA.find((c) => c.id === i.id);
          if (!creator) return null;
          return {
            id: creator.id,
            name: creator.name,
            role: creator.role,
            flag: creator.flag,
            followers: creator.totalFollowers,
            resonanceReason: i.resonanceReason.trim(),
          };
        })
        .filter((i): i is NonNullable<typeof i> => i !== null);

      // Anti-hallucination: Pricing is computed strictly deterministically from catalog rates
      const gearDailySum = matchedGear.reduce((sum, g) => sum + g.dailyRate, 0);
      const studioDaily = chosenStudio.rate * 8;
      const estimatedTotalAed = (studioDaily + gearDailySum) * sanitizedDays + 4500;

      // Plain text trimming for all model-generated strings (React JSX escapes text safely)
      const sanitizedConcept = object.campaignConcept.trim();
      const sanitizedTone = object.creativeTone.trim();
      const sanitizedStudioReason = object.studioReason.trim();
      const sanitizedShotList = object.visualShotList.map((shot) => ({
        shotNumber: shot.shotNumber,
        description: shot.description.trim(),
        cameraAngle: shot.cameraAngle.trim(),
        lightingStyle: shot.lightingStyle.trim(),
      }));

      const sanitizedNotes = (object.culturalAdvisoryNotes || []).map((n) => n.trim());

      const verifiedTalent =
        matchedInfluencers.length > 0 &&
        matchedInfluencers.every((inf) => {
          const creator = INFLUENCERS_DATA.find((c) => c.id === inf.id);
          return Boolean(creator?.mawthooqLicenseId && creator?.mawthooqStatus?.includes("Verified"));
        });

      return {
        campaignConcept: sanitizedConcept,
        creativeTone: sanitizedTone,
        visualShotList: sanitizedShotList,
        recommendedStudio: {
          id: chosenStudio.id,
          name: chosenStudio.name,
          location: "Dubai Studio City / Yas Soundstage",
          dailyRate: studioDaily,
          reason: sanitizedStudioReason,
        },
        recommendedGear: matchedGear.length > 0 ? matchedGear : [
          {
            id: GEAR_DATA[0].id,
            name: GEAR_DATA[0].name,
            category: GEAR_DATA[0].category,
            dailyRate: GEAR_DATA[0].dailyRate,
            fitReason: "Large-format camera kit selected for universal commercial fidelity.",
          },
        ],
        recommendedInfluencers: matchedInfluencers.length > 0 ? matchedInfluencers : [
          {
            id: INFLUENCERS_DATA[0].id,
            name: INFLUENCERS_DATA[0].name,
            role: INFLUENCERS_DATA[0].role,
            flag: INFLUENCERS_DATA[0].flag,
            followers: INFLUENCERS_DATA[0].totalFollowers,
            resonanceReason: "Top regional reach across GCC key demographics.",
          },
        ],
        estimatedTotalAed,
        productionTimeline: [
          {
            phase: "Phase 1: Pre-Production & Dialect Calibration",
            duration: "2-3 Days",
            deliverables: ["Khaleeji-AI Script Localization", "Shot List & Unreal 5.4 HoloTwin Pre-viz"],
          },
          {
            phase: "Phase 2: Principal Photography",
            duration: `${sanitizedDays} Days`,
            deliverables: ["4K/8K RAW Capture on Stage", "Live Wireless Director Stream via Portal"],
          },
          {
            phase: "Phase 3: Post & Mawthooq Syndication",
            duration: "3-5 Days",
            deliverables: ["Neural Lip-Sync Transmutation", "Multi-platform Master Delivery"],
          },
        ],
        complianceCheck: {
          mawthooqCertified: verifiedTalent,
          sovereignCloudCompliant: false,
          culturalAdvisoryNotes: sanitizedNotes.length > 0 ? sanitizedNotes : [
            "Regional dialect honorifics aligned with local advertising guidelines.",
            verifiedTalent
              ? "Mawthooq advertising license verified for all selected talent."
              : "Mawthooq advertising licensing to be confirmed for selected talent prior to broadcast.",
            "Production assets eligible for GCC sovereign cloud storage archive.",
          ],
        },
        isAiGenerated: true,
      };
    } catch (error) {
      console.warn("AI Proposal LLM call failed or timed out, using deterministic fallback:", error);
    }
  }

  return generateDeterministicProposal({
    brief: sanitizedBrief,
    targetMarket: sanitizedTargetMarket,
    estimatedBudget: sanitizedBudget,
    timelineDays: sanitizedDays,
  });
}

/**
 * Deterministic rule-based proposal engine for offline / keyless execution.
 */
function generateDeterministicProposal(
  req: ProductionProposalRequest
): ProductionProposalResponse {
  const briefLower = (req.brief || "").toLowerCase();

  // 1. Determine optimal studio
  let selectedStudio = STUDIOS[0];
  let studioReason = "State-of-the-art virtual LED volume optimal for high-impact commercial production.";

  if (briefLower.includes("podcast") || briefLower.includes("interview") || briefLower.includes("talk show")) {
    selectedStudio = STUDIOS.find((s) => s.id === "studio-b") || STUDIOS[2];
    studioReason = "Acoustically tuned broadcast lounge configured for multi-cam conversational formats.";
  } else if (briefLower.includes("fashion") || briefLower.includes("cairo") || briefLower.includes("photo")) {
    selectedStudio = STUDIOS.find((s) => s.id === "studio-c") || STUDIOS[3];
    studioReason = "Infinity white cyclorama soundstage providing 360-degree freedom for commercial blocking.";
  } else if (briefLower.includes("xr") || briefLower.includes("virtual") || briefLower.includes("unreal")) {
    selectedStudio = STUDIOS.find((s) => s.id === "studio-xr") || STUDIOS[0];
    studioReason = "State-of-the-art virtual LED volume optimal for high-impact commercial production.";
  }

  // 2. Select matching gear
  const matchedGear: ProductionProposalResponse["recommendedGear"] = [];

  if (briefLower.includes("cinema") || briefLower.includes("luxury") || briefLower.includes("car") || briefLower.includes("night")) {
    const arriKit = GEAR_DATA.find((g) => g.id === "arri-commercial-cinema-kit") || GEAR_DATA[1];
    matchedGear.push({
      id: arriKit.id,
      name: arriKit.name,
      category: arriKit.category,
      dailyRate: arriKit.dailyRate,
      fitReason: "Large-format 4.5K sensor with Cooke Anamorphic optics for cinematic commercial grade.",
    });

    const lighting = GEAR_DATA.find((g) => g.id === "arri-skypanel-s60c-duo") || GEAR_DATA[6];
    if (lighting) {
      matchedGear.push({
        id: lighting.id,
        name: lighting.name,
        category: lighting.category,
        dailyRate: lighting.dailyRate,
        fitReason: "Soft studio wash with full RGBW color temperature tuning.",
      });
    }
  } else {
    const fx6 = GEAR_DATA.find((g) => g.id === "sony-fx6-run-gun-kit") || GEAR_DATA[0];
    matchedGear.push({
      id: fx6.id,
      name: fx6.name,
      category: fx6.category,
      dailyRate: fx6.dailyRate,
      fitReason: "Full-frame high-mobility cinema line with built-in electronic variable ND.",
    });

    const micKit = GEAR_DATA.find((g) => g.id === "sennheiser-mkh416-kit") || GEAR_DATA[7];
    if (micKit) {
      matchedGear.push({
        id: micKit.id,
        name: micKit.name,
        category: micKit.category,
        dailyRate: micKit.dailyRate,
        fitReason: "Broadcast shotgun pattern for high-fidelity Arabic voice capture.",
      });
    }
  }

  // 3. Select matching Mawthooq creators
  const matchedInfluencers: ProductionProposalResponse["recommendedInfluencers"] = [];
  if (briefLower.includes("food") || briefLower.includes("culinary") || briefLower.includes("hospitality")) {
    const abir = INFLUENCERS_DATA.find((i) => i.id === "abir-saghir") || INFLUENCERS_DATA[1];
    matchedInfluencers.push({
      id: abir.id,
      name: abir.name,
      role: abir.role,
      flag: abir.flag,
      followers: abir.totalFollowers,
      resonanceReason: "72M+ global culinary reach with dominant GCC high-income household demographics.",
    });
  } else if (briefLower.includes("tech") || briefLower.includes("gaming") || briefLower.includes("app") || briefLower.includes("youth")) {
    const aboflah = INFLUENCERS_DATA.find((i) => i.id === "aboflah") || INFLUENCERS_DATA[0];
    matchedInfluencers.push({
      id: aboflah.id,
      name: aboflah.name,
      role: aboflah.role,
      flag: aboflah.flag,
      followers: aboflah.totalFollowers,
      resonanceReason: "Unmatched Gen-Z & Millennial cultural resonance across Saudi Arabia and the Gulf.",
    });
  } else {
    const creator = INFLUENCERS_DATA[0];
    matchedInfluencers.push({
      id: creator.id,
      name: creator.name,
      role: creator.role,
      flag: creator.flag,
      followers: creator.totalFollowers,
      resonanceReason: "Verified high-tier engagement score and certified Mawthooq compliance.",
    });
  }

  const days = req.timelineDays || 2;
  const gearSum = matchedGear.reduce((sum, g) => sum + g.dailyRate, 0);
  const estimatedTotalAed = selectedStudio.rate * 8 * days + gearSum * days + 4500;

  return {
    campaignConcept: `Autonomous AI Production Blueprint for: "${req.brief.slice(0, 80)}..."`,
    creativeTone: "Dynamic High-Impact Commercial",
    visualShotList: [
      {
        shotNumber: 1,
        description: "Establishing wide angle with dramatic volumetric lighting across the soundstage.",
        cameraAngle: "Low-angle crane pan",
        lightingStyle: "High-contrast rim light with cold ambient fill",
      },
      {
        shotNumber: 2,
        description: "Dynamic close-up tracking shot capturing product textures and talent expression.",
        cameraAngle: "Medium tracking 50mm",
        lightingStyle: "Soft key wrap with beauty reflector",
      },
      {
        shotNumber: 3,
        description: "Hero reveal shot against virtual LED environment with parallax camera motion.",
        cameraAngle: "Steadicam orbit 360",
        lightingStyle: "Synchronized HoloTwin LED volume illumination",
      },
    ],
    recommendedStudio: {
      id: selectedStudio.id,
      name: selectedStudio.name,
      location: "Dubai Studio City / Yas Soundstage",
      dailyRate: selectedStudio.rate * 8,
      reason: studioReason,
    },
    recommendedGear: matchedGear,
    recommendedInfluencers: matchedInfluencers,
    estimatedTotalAed,
    productionTimeline: [
      {
        phase: "Phase 1: Pre-Production & Dialect Calibration",
        duration: "2-3 Days",
        deliverables: ["Khaleeji-AI Script Localization", "Shot List & Unreal 5.4 HoloTwin Pre-viz"],
      },
      {
        phase: "Phase 2: Principal Photography",
        duration: `${days} Days`,
        deliverables: ["4K RAW Capture on Stage", "Live Wireless Director Stream via Portal"],
      },
      {
        phase: "Phase 3: Post & Mawthooq Syndication",
        duration: "3-5 Days",
        deliverables: ["Neural Lip-Sync Transmutation", "Multi-platform Master Delivery"],
      },
    ],
    complianceCheck: {
      mawthooqCertified:
        matchedInfluencers.length > 0 &&
        matchedInfluencers.every((inf) => {
          const creator = INFLUENCERS_DATA.find((c) => c.id === inf.id);
          return Boolean(creator?.mawthooqLicenseId && creator?.mawthooqStatus?.includes("Verified"));
        }),
      sovereignCloudCompliant: false,
      culturalAdvisoryNotes: [
        "Regional dialect honorifics aligned with local advertising guidelines.",
        matchedInfluencers.length > 0 &&
        matchedInfluencers.every((inf) => {
          const creator = INFLUENCERS_DATA.find((c) => c.id === inf.id);
          return Boolean(creator?.mawthooqLicenseId && creator?.mawthooqStatus?.includes("Verified"));
        })
          ? "Mawthooq advertising license verified for all selected talent."
          : "Mawthooq advertising licensing to be confirmed for selected talent prior to broadcast.",
        "Production assets eligible for GCC sovereign cloud storage archive.",
      ],
    },
    isAiGenerated: false,
  };
}
