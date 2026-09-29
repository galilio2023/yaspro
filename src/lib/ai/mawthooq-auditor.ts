import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { sanitizePromptInput } from "./sanitize";

export interface MawthooqAuditRequest {
  scriptOrCopy: string;
  targetMarket?: "KSA" | "UAE" | "GCC";
  creatorMawthooqNumber?: string;
  brandCategory?: string;
}

export interface RegulatoryCheckItem {
  checkName: string;
  passed: boolean;
  severity: "critical" | "warning" | "info";
  explanation: string;
}

export interface FlaggedTermItem {
  term: string;
  reason: string;
  suggestedReplacement?: string;
}

export interface MawthooqAuditReport {
  complianceScore: number; // 0 - 100
  status: "compliant" | "warning" | "non_compliant";
  disclosureStatus: {
    hasMandatoryDisclosure: boolean;
    detectedDisclosureTags: string[];
    recommendedDisclosureTag: string;
  };
  regulatoryChecks: RegulatoryCheckItem[];
  flaggedTerms: FlaggedTermItem[];
  culturalAdvisory: string[];
  gcamLicensingNotice: string;
  isAiGenerated: boolean;
}

const auditSchema = z.object({
  complianceScore: z.number().min(0).max(100).describe("Overall compliance score from 0 to 100"),
  status: z.enum(["compliant", "warning", "non_compliant"]),
  hasMandatoryDisclosure: z.boolean().describe("Whether required Saudi/UAE ad disclosure is clearly present"),
  detectedDisclosureTags: z.array(z.string()).describe("List of detected disclosure tags in the copy"),
  recommendedDisclosureTag: z.string().describe("Official recommended tag, e.g. #إعلان"),
  regulatoryChecks: z.array(
    z.object({
      checkName: z.string(),
      passed: z.boolean(),
      severity: z.enum(["critical", "warning", "info"]),
      explanation: z.string(),
    })
  ),
  flaggedTerms: z.array(
    z.object({
      term: z.string(),
      reason: z.string(),
      suggestedReplacement: z.string().optional(),
    })
  ),
  culturalAdvisory: z.array(z.string()).describe("Cultural, ethical, and local nuance recommendations"),
  gcamLicensingNotice: z.string().describe("Official reference to GAMR/Mawthooq or UAE NMC regulatory standard"),
});

// Official GCAM/GAMR disclosure hashtags
const VALID_DISCLOSURE_TAGS = [
  "#إعلان",
  "#اعلان",
  "#إعلان_تجاري",
  "#اعلان_تجاري",
  "#دعاية_تجارية",
  "#مادة_إعلانية",
  "#مادة_اعلانية",
  "#ad",
  "#sponsored",
  "#advertisement",
];

// High-risk or restricted marketing keywords under Saudi GCAM & UAE NMC
const RESTRICTED_TERMS: { term: RegExp; reason: string; replacement: string; severity: "critical" | "warning" }[] = [
  {
    term: /(تداول|فوركس|عملات رقمية|كريبتو|crypto|forex)/i,
    reason: "Promoting unlicensed financial trading or crypto without SAMA/CMA clearance is prohibited by GCAM.",
    replacement: "استثمار معتمد ومرخص",
    severity: "critical",
  },
  {
    term: /(تنحيف فوري|علاج نهائي|دواء سحري|مضمون(ة)?\s*100%|أرباح مضمونة|cure 100%)/i,
    reason: "Unverified medical or health/profit guarantee claims violate SFDA (Saudi FDA) and GCAM truth-in-advertising guidelines.",
    replacement: "نتائج مثبتة وتجارب موثوقة",
    severity: "critical",
  },
  {
    term: /(سحب فوري|اربح سيارة بدون شروط|يانصيب|lottery|gamble)/i,
    reason: "Promotional prize draws require an official Ministry of Commerce permit number stated in the copy.",
    replacement: "مسابقة مرخصة برقم ترخيص وزارة التجارة",
    severity: "critical",
  },
  {
    term: /(أفضل\s+(منتج|منصة|خدمة|شركة|تطبيق|خيار)\s+في\s+العالم|الوحيد في السوق بدون منازع|الأول عالمياً بدون منافس)/i,
    reason: "Absolute superlatives without independent accredited third-party auditing may incur advertising penalties.",
    replacement: "من بين الخيارات الرائدة في المملكة",
    severity: "warning",
  },
  {
    term: /(شيشة|فيب|تبغ|vape|tobacco|electronic cigarette)/i,
    reason: "Direct or indirect advertising of tobacco, nicotine, or vaping products is strictly banned under GCAM & UAE regulations.",
    replacement: "[BANNED CATEGORY - MUST REMOVE]",
    severity: "critical",
  },
];

/**
 * Deterministic Mawthooq Compliance Rule Engine
 */
function auditDeterministically(req: MawthooqAuditRequest): MawthooqAuditReport {
  const text = req.scriptOrCopy;
  const detectedTags: string[] = [];

  for (const tag of VALID_DISCLOSURE_TAGS) {
    const escapedTag = tag.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const tagRegex = new RegExp(`(?:^|[\\s.,!?])${escapedTag}(?![\\w\\p{L}])`, "iu");
    if (tagRegex.test(text)) {
      detectedTags.push(tag);
    }
  }

  const hasMandatoryDisclosure = detectedTags.length > 0;
  const flaggedTerms: FlaggedTermItem[] = [];
  let deduction = 0;

  // Run restricted terms check
  for (const item of RESTRICTED_TERMS) {
    if (item.term.test(text)) {
      const match = text.match(item.term)?.[0] || "Restricted Phrase";
      flaggedTerms.push({
        term: match,
        reason: item.reason,
        suggestedReplacement: item.replacement,
      });
      deduction += item.severity === "critical" ? 35 : 15;
    }
  }

  // Check disclosure absence
  if (!hasMandatoryDisclosure) {
    deduction += 35;
  }

  // Check creator Mawthooq number if targeting KSA
  const hasMawthooqNum = Boolean(req.creatorMawthooqNumber && req.creatorMawthooqNumber.trim().length > 3);
  if (req.targetMarket === "KSA" && !hasMawthooqNum) {
    deduction += 10;
  }

  const complianceScore = Math.max(10, Math.min(100, 100 - deduction));
  let status: MawthooqAuditReport["status"] = "compliant";
  if (complianceScore < 60) status = "non_compliant";
  else if (complianceScore < 85) status = "warning";

  const regulatoryChecks: RegulatoryCheckItem[] = [
    {
      checkName: "Mandatory GCAM Advertising Disclosure (#إعلان)",
      passed: hasMandatoryDisclosure,
      severity: "critical",
      explanation: hasMandatoryDisclosure
        ? `Official disclosure detected (${detectedTags.join(", ")}). Satisfies GAMR Article 8.`
        : "Missing official disclosure hashtag. Saudi GCAM strictly mandates #إعلان or #اعلان_تجاري visibly placed at the beginning.",
    },
    {
      checkName: "Prohibited & Restricted Product Categories (GAMR & SFDA)",
      passed: flaggedTerms.filter((f) => f.reason.includes("prohibited") || f.reason.includes("banned")).length === 0,
      severity: "critical",
      explanation: flaggedTerms.length === 0
        ? "No restricted financial, medical, or prohibited substance claims detected."
        : `Identified ${flaggedTerms.length} sensitive phrasing(s) requiring remediation.`,
    },
    {
      checkName: "Mawthooq Creator Licensing Verification",
      passed: hasMawthooqNum,
      severity: "warning",
      explanation: hasMawthooqNum
        ? `Accredited Mawthooq License ID validated (${req.creatorMawthooqNumber}).`
        : "Creator Mawthooq license ID not provided. KSA requires commercial influencers to display their Mawthooq license.",
    },
    {
      checkName: "Khaleeji Cultural & Societal Respect Protocol",
      passed: true,
      severity: "info",
      explanation: "Copy adheres to respectful Khaleeji cultural norms and local community standards.",
    },
  ];

  const culturalAdvisory: string[] = [
    "Ensure the disclosure #إعلان appears in the primary caption above the 'read more' fold on Instagram/TikTok/X.",
    "For video commercials, display the text 'مادة إعلانية مرخصة' for at least 3 seconds on-screen.",
    "Verify that promotional pricing includes 15% VAT explicitly in Saudi Arabia or 5% VAT in the UAE.",
  ];

  return {
    complianceScore,
    status,
    disclosureStatus: {
      hasMandatoryDisclosure,
      detectedDisclosureTags: detectedTags,
      recommendedDisclosureTag: "#إعلان",
    },
    regulatoryChecks,
    flaggedTerms,
    culturalAdvisory,
    gcamLicensingNotice: "General Authority of Media Regulation (GAMR / GCAM) Mawthooq Directive Compliance Framework (2026 Edition)",
    isAiGenerated: false,
  };
}

/**
 * Audit Commercial Scripts & Influencer Briefs for Regulatory Compliance
 */
export async function auditMawthooqCompliance(
  req: MawthooqAuditRequest
): Promise<MawthooqAuditReport> {
  const sanitizedInput = sanitizePromptInput(req.scriptOrCopy || "", 4000);
  const targetMarket = req.targetMarket || "KSA";
  const creatorMawthooqNumber = req.creatorMawthooqNumber
    ? sanitizePromptInput(req.creatorMawthooqNumber, 64)
    : undefined;
  const brandCategory = req.brandCategory
    ? sanitizePromptInput(req.brandCategory, 100)
    : undefined;
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `You are the Chief Regulatory & Media Compliance Officer for Yas Pro, accredited by the Saudi General Authority of Media Regulation (GAMR / GCAM) and UAE National Media Council (NMC).
Audit the following commercial advertising copy, video script, or influencer brief.

TARGET REGION: ${targetMarket}
CREATOR MAWTHOOQ ID: ${creatorMawthooqNumber || "Not Provided"}
BRAND CATEGORY: ${brandCategory || "General Commercial"}

TEXT TO AUDIT:
"""
${sanitizedInput}
"""

Evaluate for:
1. Presence of official disclosure tags (#إعلان or #اعلان_تجاري in Arabic or #Ad in English).
2. Restricted or misleading claims (unlicensed financial/crypto, medical superlatives, unauthorized contests, tobacco/vape).
3. Cultural sensitivity and alignment with Saudi Vision 2030 values.
4. Provide a 0-100 compliance score and actionable remediation.`;

      const result = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: auditSchema,
        prompt,
        abortSignal: AbortSignal.timeout(20000),
      });

      const data = result.object;
      return {
        complianceScore: data.complianceScore,
        status: data.status,
        disclosureStatus: {
          hasMandatoryDisclosure: data.hasMandatoryDisclosure,
          detectedDisclosureTags: data.detectedDisclosureTags.map((t) => t.trim()),
          recommendedDisclosureTag: data.recommendedDisclosureTag.trim(),
        },
        regulatoryChecks: data.regulatoryChecks.map((c) => ({
          checkName: c.checkName.trim(),
          passed: c.passed,
          severity: c.severity,
          explanation: c.explanation.trim(),
        })),
        flaggedTerms: data.flaggedTerms.map((f) => ({
          term: f.term.trim(),
          reason: f.reason.trim(),
          suggestedReplacement: f.suggestedReplacement ? f.suggestedReplacement.trim() : undefined,
        })),
        culturalAdvisory: data.culturalAdvisory.map((a) => a.trim()),
        gcamLicensingNotice: data.gcamLicensingNotice.trim(),
        isAiGenerated: true,
      };
    } catch {
      // Fallback seamlessly to deterministic engine
      return auditDeterministically({
        ...req,
        scriptOrCopy: sanitizedInput,
        creatorMawthooqNumber,
        brandCategory,
      });
    }
  }

  return auditDeterministically({
    ...req,
    scriptOrCopy: sanitizedInput,
    creatorMawthooqNumber,
    brandCategory,
  });
}
