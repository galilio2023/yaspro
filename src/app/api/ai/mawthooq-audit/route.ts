import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { auditMawthooqCompliance } from "@/lib/ai/mawthooq-auditor";

const requestSchema = z.object({
  scriptOrCopy: z.string().min(5, "Please provide at least 5 characters to audit").max(4000),
  targetMarket: z.enum(["KSA", "UAE", "GCC"]).optional().default("KSA"),
  creatorMawthooqNumber: z.string().trim().max(64).optional(),
  brandCategory: z.string().trim().max(100).optional(),
});

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const clientIp = await getClientIdentifier();
    const rateLimit = checkRateLimit(`ai_mawthooq:${clientIp}`, 20, 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many compliance audit requests. Please wait a moment." },
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

    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const report = await auditMawthooqCompliance(parsed.data);
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Mawthooq Audit Error:", error);
    return NextResponse.json(
      { error: "Failed to perform regulatory compliance audit." },
      { status: 500 }
    );
  }
}
