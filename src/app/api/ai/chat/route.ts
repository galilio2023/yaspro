import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { streamText, tool, stepCountIs } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { sanitizePromptInput } from "@/lib/ai/sanitize";
import { matchGearPackage } from "@/lib/ai/ai-kit-matcher";
import { auditMawthooqCompliance } from "@/lib/ai/mawthooq-auditor";
import { transmuteScript } from "@/lib/ai/dialect-engine";
import { STUDIOS } from "@/features/booking/constants";

const messageSchema = z.object({
  messages: z.array(
    z.object({
      role: z.literal("user"),
      content: z.string().min(1).max(4000),
    })
  ).min(1).max(20),
});

export async function POST(req: Request) {
  try {
    const clientIp = await getClientIdentifier();
    const rateLimit = checkRateLimit(`ai_chat:${clientIp}`, 30, 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many assistant requests. Please wait a moment." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Malformed or invalid JSON body." },
        { status: 400 }
      );
    }

    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid message payload", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      // Deterministic fallback response when no API key is provided
      const lastUserMsg = parsed.data.messages[parsed.data.messages.length - 1]?.content || "";
      const lower = lastUserMsg.toLowerCase();

      let reply = "Marhaban! I am your Yas Pro Production AI Assistant. How can I assist your shoot in Dubai or Riyadh today?";
      if (lower.includes("gear") || lower.includes("camera") || lower.includes("rent")) {
        reply = "Looking for cinema gear? We stock ARRI Alexa Mini LF, RED V-Raptor XL, Sony FX6 kits, and Cooke/Atlas cinema primes. You can use the AI Kit Matcher in our Gear Explorer to bundle a turnkey package with a 12% package discount.";
      } else if (lower.includes("studio") || lower.includes("stage") || lower.includes("xr")) {
        const studioList = STUDIOS.map((s) => `- ${s.name}: ${s.desc} (Rate: AED ${s.rate}/hr, AED ${s.rate * 8}/day)`).join("\n");
        reply = `We operate 4 soundstages in the GCC:\n${studioList}\nWould you like to schedule a booking?`;
      } else if (lower.includes("mawthooq") || lower.includes("compliance") || lower.includes("license")) {
        reply = "All our creator partnerships comply with KSA General Commission for Audiovisual Media (GAMR) Mawthooq licensing. You can scan your campaign scripts anytime in our Mawthooq Auditor modal to verify mandatory #إعلان disclosure and avoid regulatory fines.";
      } else if (lower.includes("dialect") || lower.includes("saudi") || lower.includes("emirati") || lower.includes("arabic")) {
        reply = "We offer real-time Khaleeji Dialect Transmutation for commercial copy into authentic Najdi, Emirati, and Hijazi phrasings. You can run scripts through our Dialect Transmuter under Enterprise tools.";
      }

      return new Response(reply, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const google = createGoogleGenerativeAI({ apiKey });

    // Sanitize user messages
    const sanitizedMessages = parsed.data.messages.map((m) => ({
      role: m.role,
      content: sanitizePromptInput(m.content, 4000),
    }));

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: `You are Yas Pro Copilot, the intelligent autonomous media production assistant for Yas Pro (operating premier soundstages, cinema rental hubs, and certified influencer campaigns in Dubai and Riyadh).
You are professional, deeply knowledgeable about cinema gear (ARRI, RED, Sony, Cooke, Aputure), Khaleeji cultural nuances, and Saudi GAMR/Mawthooq regulations.
Respond clearly and concisely in either English or Arabic based on the user's language. Use formatting for equipment packages and studio specs.`,
      messages: sanitizedMessages,
      stopWhen: stepCountIs(3),
      tools: {
        matchGearPackage: tool({
          description: "Match and assemble cinema gear rental packages based on user brief or genre",
          inputSchema: z.object({
            query: z.string().describe("Shoot brief or gear requirements"),
            maxDailyBudget: z.number().optional().describe("Optional budget in AED per day"),
          }),
          execute: async ({ query, maxDailyBudget }: { query: string; maxDailyBudget?: number }) => {
            return await matchGearPackage(query, maxDailyBudget);
          },
        }),
        auditMawthooqCopy: tool({
          description: "Audit advertising copy or influencer scripts for Saudi GCAM and Mawthooq compliance",
          inputSchema: z.object({
            scriptOrCopy: z.string().describe("Promotional copy or script"),
            targetMarket: z.enum(["KSA", "UAE", "GCC"]).optional(),
          }),
          execute: async ({ scriptOrCopy, targetMarket }: { scriptOrCopy: string; targetMarket?: "KSA" | "UAE" | "GCC" }) => {
            return await auditMawthooqCompliance({ scriptOrCopy, targetMarket });
          },
        }),
        transmuteKhaleejiDialect: tool({
          description: "Transmute standard commercial Arabic script into authentic Khaleeji dialect (Najdi or Emirati)",
          inputSchema: z.object({
            text: z.string(),
            dialectId: z.enum(["najdi", "emirati", "hijazi", "kuwaiti", "egyptian"]),
          }),
          execute: async ({ text, dialectId }: { text: string; dialectId: "najdi" | "emirati" | "hijazi" | "kuwaiti" | "egyptian" }) => {
            return await transmuteScript(text, dialectId);
          },
        }),
        listSoundstages: tool({
          description: "List available Yas Pro soundstages and studio specs in Dubai and Riyadh",
          inputSchema: z.object({}),
          execute: async () => {
            return STUDIOS.map((s) => ({
              id: s.id,
              name: s.name,
              dayRate: s.rate * 8,
              description: s.desc,
            }));
          },
        }),
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Assistant Chat Error:", error);
    return NextResponse.json(
      { error: "Assistant encountered an error." },
      { status: 500 }
    );
  }
}
