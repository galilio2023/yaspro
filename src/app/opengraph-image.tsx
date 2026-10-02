import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "Yas Pro | AI Media Hub & Virtual Production Dubai";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
        {/* Subtle Ambient Glow Orbs */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.1) 50%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-50px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top Header: Brand Logo & Region Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            width: "100%",
          }}
        >
          {/* Logo Mark + Text */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid rgba(245, 158, 11, 0.4)",
              }}
            >
              <svg width="30" height="30" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="46" fill="#18181b" stroke="#f59e0b" strokeWidth="3" />
                <polygon points="24,24 38,24 50,47 43,53 24,24" fill="#fbbf24" />
                <polygon points="76,24 62,24 50,47 57,53 76,24" fill="#d97706" />
                <polygon points="43,51 57,51 57,78 43,78" fill="#e4e4e7" />
                <polygon points="43,78 50,84 57,78 50,75" fill="#f59e0b" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span>YASPRO</span>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.2em",
                  color: "#f59e0b",
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                AI MEDIA HUB • DUBAI
              </div>
            </div>
          </div>

          {/* Hub Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "999px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#fbbf24",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                display: "flex",
              }}
            />
            <span style={{ display: "flex" }}>DUBAI • STUDIO HUB • GCC</span>
          </div>
        </div>

        {/* Center Main Headline & Description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            position: "relative",
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: "54px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            <span style={{ display: "flex", marginRight: "14px" }}>Cinematic Media Production &amp;</span>
            <span
              style={{
                display: "flex",
                color: "#f59e0b",
              }}
            >
              Soundstages.
            </span>
          </div>

          <div
            style={{
              fontSize: "21px",
              lineHeight: 1.45,
              color: "#a1a1aa",
              fontWeight: 400,
              maxWidth: "840px",
              display: "flex",
            }}
          >
            Virtual Production Soundstage • Turnkey Cinema Gear Dispatch • Influencer Roster &amp; Live Stadium Broadcast.
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            position: "relative",
          }}
        >
          {[
            "Soundstage A (4K Cyc)",
            "ARRI & RED Cinema Kits",
            "Top MENA Influencer Roster",
            "4K Live OB Van",
          ].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 16px",
                borderRadius: "12px",
                backgroundColor: "rgba(245, 158, 11, 0.12)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                color: "#fef3c7",
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
