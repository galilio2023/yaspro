import { NextRequest, NextResponse } from "next/server";
import { getPaginatedEquipment } from "@/lib/actions/equipment-gear";

export const dynamic = "force-dynamic";

/**
 * Enterprise Paginated Equipment API Endpoint
 * GET /api/gear?page=1&limit=12&category=cameras&search=arri&sort=popular
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = (searchParams.get("sort") as "rate_asc" | "rate_desc" | "newest" | "popular") || undefined;
    const isKitParam = searchParams.get("isKit");
    const isKit = isKitParam !== null ? isKitParam === "true" : undefined;

    const data = await getPaginatedEquipment({
      page,
      limit,
      category,
      search,
      sort,
      isKit,
    });

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Failed to query cinema equipment fleet",
      },
      { status: 500 }
    );
  }
}
