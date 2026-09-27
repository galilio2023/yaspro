import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { event } = body;
    if (!event) {
      return NextResponse.json({ success: false, error: "Missing event identifier" }, { status: 400 });
    }

    // Acknowledge production webhook event
    return NextResponse.json({
      success: true,
      event,
      timestamp: new Date().toISOString(),
      status: "acknowledged",
      relayNodes: ["dxb-edge-01", "ruh-edge-02"],
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid webhook payload format" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "Yas Pro Production Event Bridge",
    version: "1.0.0",
    smpteProtocol: "ST-2110 / ST-2059 PTP",
    timestamp: new Date().toISOString(),
  });
}
