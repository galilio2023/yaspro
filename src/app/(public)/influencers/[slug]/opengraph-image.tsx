import { ImageResponse } from "next/og";
import { getCachedInfluencerBySlug } from "@/lib/cached-queries";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const creator = await getCachedInfluencerBySlug(slug);

  const name = creator?.name || "Featured Creator";
  const role = creator?.role || "Digital Creator & Entertainer";
  const followers = creator?.totalFollowers || "10M+";
  const nationality = creator?.nationality || "MENA";
  const flag = creator?.flag || "🌟";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 70px",
          backgroundColor: "#070709",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-40px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.1) 50%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid rgba(245, 158, 11, 0.4)",
              }}
            >
              <span style={{ fontSize: "24px" }}>{flag}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", display: "flex" }}>
                YAS PRO CREATOR HUB
              </div>
              <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#facc15", fontWeight: 700, display: "flex" }}>
                OFFICIAL PRODUCTION PARTNER
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "999px",
              backgroundColor: "rgba(234, 179, 8, 0.15)",
              border: "1px solid rgba(234, 179, 8, 0.35)",
              color: "#fde047",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            {followers} Total Audience
          </div>
        </div>

        {/* Creator Name & Focus */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              display: "flex",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#c4b5fd",
              fontWeight: 600,
              display: "flex",
            }}
          >
            {role} • {nationality}
          </div>
        </div>

        {/* Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {["GCC Talent Exclusive", "Studio Soundstages", "Multi-Cam Podcast Suites", "Brand Integrations"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#e2e8f0",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
