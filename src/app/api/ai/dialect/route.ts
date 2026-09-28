import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { transmuteScript } from "@/lib/ai/dialect-engine";

const requestSchema = z.object({
  text: z.string().min(3, "Text must be at least 3 characters").max(2000),
  dialectId: z.enum(["najdi", "emirati", "hijazi", "kuwaiti", "egyptian"]),
  tone: z.string().optional().default("Prestige"),
});

export async function POST(req: Request) {
  try {
    const clientIp = await getClientIdentifier();
    const rateLimit = checkRateLimit(`ai_dialect:${clientIp}`, 20, 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many dialect requests. Please slow down." },
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

    const result = await transmuteScript(
      parsed.data.text,
      parsed.data.dialectId,
      parsed.data.tone
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("AI Dialect Transmutation Error:", error);
    return NextResponse.json(
      { error: "Failed to adapt dialect script." },
      { status: 500 }
    );
  }
}
