import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { matchGearPackage } from "@/lib/ai/ai-kit-matcher";

const requestSchema = z.object({
  query: z.string().min(3, "Please provide at least 3 characters").max(500),
  maxDailyBudget: z.number().positive().max(100000).optional(),
});

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const clientIp = await getClientIdentifier();
    const rateLimit = checkRateLimit(`ai_gear_matcher:${clientIp}`, 25, 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many gear kit matching requests. Please wait a moment." },
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

    const packageResult = await matchGearPackage(parsed.data.query, parsed.data.maxDailyBudget);
    return NextResponse.json({ success: true, package: packageResult });
  } catch (error) {
    console.error("AI Gear Kit Matcher Error:", error);
    return NextResponse.json(
      { error: "Failed to assemble AI gear package." },
      { status: 500 }
    );
  }
}
