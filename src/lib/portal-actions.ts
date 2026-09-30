"use server";

import { db } from "@/db";
import { enterpriseRfps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export interface EnterpriseRfpLookupResult {
  found: boolean;
  rfp?: {
    referenceCode: string;
    organizationName: string;
    organizationType: string;
    contactName: string;
    country: string;
    projectScope: string;
    estimatedBudget: string;
    requiresMawthooqCompliance: boolean;
    requiresObVan: boolean;
    status: string;
    createdAt: string;
    selectedCreators: string[];
  };
  message?: string;
}

export interface ProductionTelemetryEvent {
  id: string;
  timestamp: string;
  source: string;
  type: "C2C_INGEST" | "OB_VAN_GPS" | "MAWTHOOQ_AUDIT" | "GENLOCK_SYNC" | "RENDER_COMPLETE";
  level: "info" | "success" | "warning";
  summary: string;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Look up an Enterprise RFP by reference code (with live database fallback to demo references)
 */
export async function lookupEnterpriseRfp(referenceCode: string): Promise<EnterpriseRfpLookupResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return {
      found: false,
      message: "Unauthorized: Active session required to query the enterprise ledger.",
    };
  }

  const code = referenceCode.trim().toUpperCase();
  if (!code) {
    return { found: false, message: "Please provide a valid RFP reference code." };
  }

  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      const record = await db.query.enterpriseRfps.findFirst({
        where: eq(enterpriseRfps.referenceCode, code),
      });

      if (record) {
        return {
          found: true,
          rfp: {
            referenceCode: record.referenceCode,
            organizationName: record.organizationName,
            organizationType: record.organizationType,
            contactName: record.contactName,
            country: record.country,
            projectScope: record.projectScope,
            estimatedBudget: record.estimatedBudget,
            requiresMawthooqCompliance: record.requiresMawthooqCompliance,
            requiresObVan: record.requiresObVan,
            status: record.status,
            createdAt: record.createdAt.toISOString(),
            selectedCreators: (record.selectedCreators as string[]) || [],
          },
        };
      }
    }

    // Demo lookup fallbacks for instant client evaluation
    if (code === "EXP-9182-DXB" || code.startsWith("EXP-")) {
      return {
        found: true,
        rfp: {
          referenceCode: code,
          organizationName: code === "EXP-9182-DXB" ? "Dubai Municipality Academy" : "Enterprise Sovereign Partner",
          organizationType: "government_ministry",
          contactName: "Eng. Tariq Mansoor",
          country: code.endsWith("KSA") ? "Saudi Arabia" : "UAE",
          projectScope: "virtual_production_xr",
          estimatedBudget: "500k_plus",
          requiresMawthooqCompliance: true,
          requiresObVan: true,
          status: code === "EXP-9182-DXB" ? "sla_active" : "pending_review",
          createdAt: new Date().toISOString(),
          selectedCreators: ["aboflah", "noor-stars"],
        },
      };
    }

    return {
      found: false,
      message: `No active tender or proposal found matching reference code "${code}".`,
    };
  } catch (error) {
    console.error("Error looking up enterprise RFP:", error);
    return {
      found: false,
      message: "Database telemetry lookup encountered a temporary issue. Please try again.",
    };
  }
}

/**
 * Fetch recent telemetry event logs
 */
export async function getLiveTelemetryFeed(): Promise<ProductionTelemetryEvent[]> {
  return [
    {
      id: "ev-01",
      timestamp: new Date(Date.now() - 1000 * 45).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      source: "OB-VAN MERCEDES 01",
      type: "OB_VAN_GPS",
      level: "info",
      summary: "High-power Starlink & O3b Ka-band link locked at 1.2 Gbps uplink from Riyadh Boulevard stage.",
    },
    {
      id: "ev-02",
      timestamp: new Date(Date.now() - 1000 * 180).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      source: "DUBAI STAGE A",
      type: "GENLOCK_SYNC",
      level: "success",
      summary: "Disguise vx4+ media servers genlocked with ARRI Alexa 35 at 24.000 fps (SMPTE ST 2059-2 PTP).",
    },
    {
      id: "ev-03",
      timestamp: new Date(Date.now() - 1000 * 360).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      source: "CAMERA-TO-CLOUD",
      type: "C2C_INGEST",
      level: "info",
      summary: "Take 14 proxy uploaded via Frame.io C2C API. Watermark hash verified: DEMO-WATERMARK-DXB-9912.",
    },
    {
      id: "ev-04",
      timestamp: new Date(Date.now() - 1000 * 720).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      source: "MAWTHOOQ COMPLIANCE BOT",
      type: "MAWTHOOQ_AUDIT",
      level: "success",
      summary: "GAMR License verification passed for Saudi National Day cross-platform syndication.",
    },
  ];
}
