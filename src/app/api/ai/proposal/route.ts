import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { generateProductionProposal } from "@/lib/ai/production-advisor";

const requestSchema = z.object({
  brief: z.string().min(10, "Please provide at least 10 characters for the creative brief").max(3000),
  targetMarket: z.string().optional(),
  estimatedBudget: z.string().optional(),
  timelineDays: z.number().int().min(1).max(30).optional(),
});

export async function POST(req: Request) {
  try {
    const clientIp = await getClientIdentifier();
    const rateLimit = checkRateLimit(`ai_proposal:${clientIp}`, 15, 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before generating another proposal." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const proposal = await generateProductionProposal(parsed.data);
    return NextResponse.json({ success: true, proposal });
  } catch (error) {
    console.error("AI Proposal Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI production proposal." },
      { status: 500 }
    );
  }
}
