import { ImageResponse } from "next/og";
import { getCachedProjectBySlug } from "@/lib/cached-queries";

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
  const project = await getCachedProjectBySlug(slug);

  const title = project?.title || "Film & Production Masterpiece";
  const client = project?.client || "Yas Productions Client";
  const category = project?.categoryLabel || "Commercial Production";
  const views = project?.views || "10M+ Global Views";
  const year = project?.year || "2025";

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
        {/* Ambient Glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-60px",
            width: "500px",
            height: "500px",
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
                background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid rgba(245, 158, 11, 0.4)",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="46" fill="#18181b" stroke="#f59e0b" strokeWidth="3" />
                <polygon points="24,24 38,24 50,47 43,53 24,24" fill="#fbbf24" />
                <polygon points="76,24 62,24 50,47 57,53 76,24" fill="#d97706" />
                <polygon points="43,51 57,51 57,78 43,78" fill="#e4e4e7" />
                <polygon points="43,78 50,84 57,78 50,75" fill="#f59e0b" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", display: "flex" }}>
                YASPRO
              </div>
              <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#f59e0b", fontWeight: 700, display: "flex" }}>
                PORTFOLIO CASE STUDY
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "999px",
              backgroundColor: "rgba(124, 58, 237, 0.15)",
              border: "1px solid rgba(124, 58, 237, 0.4)",
              color: "#c4b5fd",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {category} • {year}
          </div>
        </div>

        {/* Center Main Headline */}
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
              fontSize: "52px",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              display: "flex",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "#67e8f9",
              fontWeight: 600,
              display: "flex",
            }}
          >
            Client: {client} • Reach: {views}
          </div>
        </div>

        {/* Footer badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {["4K Cinema Production", "Color Grading & Mastering", "Sovereign GCC Infrastructure"].map((tag) => (
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
