import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { auditMawthooqCompliance } from "@/lib/ai/mawthooq-auditor";

const requestSchema = z.object({
  scriptOrCopy: z.string().min(5, "Please provide at least 5 characters to audit").max(4000),
  targetMarket: z.enum(["KSA", "UAE", "GCC"]).optional().default("KSA"),
  creatorMawthooqNumber: z.string().optional(),
  brandCategory: z.string().optional(),
});

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

    const body = await req.json();
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
