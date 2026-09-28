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
          backgroundColor: "#03020a",
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
            background: "radial-gradient(circle, rgba(124, 58, 237, 0.45) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 70%)",
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
            background: "radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(124, 58, 237, 0.1) 60%, transparent 70%)",
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
                background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 60%, #06b6d4 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid rgba(196, 181, 253, 0.4)",
              }}
            >
              <svg width="24" height="34" viewBox="0 0 24 34" fill="none">
                {/* Candle Flame */}
                <path
                  d="M12 1.2 C12.8 3.5 15.6 5.8 15.6 7.6 C15.6 9.8 14 10.8 12 10.8 C10 10.8 8.4 9.8 8.4 7.6 C8.4 5.8 11.2 3.5 12 1.2 Z"
                  fill="#f59e0b"
                />
                <circle cx="12" cy="7.5" r="2" fill="#ffffff" />
                {/* Wick */}
                <path d="M12 10.5 V13.5" stroke="#1e1b4b" strokeWidth="1.2" />
                {/* Candle Body */}
                <rect x="9" y="14" width="6" height="17" rx="3" fill="#818cf8" />
                <ellipse cx="12" cy="14" rx="3" ry="1.2" fill="#c4b5fd" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg width="20" height="28" viewBox="0 0 24 34" fill="none">
                  {/* Candle Flame */}
                  <path
                    d="M12 1.2 C12.8 3.5 15.6 5.8 15.6 7.6 C15.6 9.8 14 10.8 12 10.8 C10 10.8 8.4 9.8 8.4 7.6 C8.4 5.8 11.2 3.5 12 1.2 Z"
                    fill="#f59e0b"
                  />
                  <circle cx="12" cy="7.5" r="2" fill="#ffffff" />
                  {/* Candle Wick */}
                  <path d="M12 10.5 V13.5" stroke="#475569" strokeWidth="1.2" />
                  {/* Candle Body */}
                  <rect x="9" y="14" width="6" height="17" rx="3" fill="#818cf8" />
                  <ellipse cx="12" cy="14" rx="3" ry="1.2" fill="#c4b5fd" />
                </svg>
                <span>YAS PRO</span>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.2em",
                  color: "#a78bfa",
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                MEDIA PRODUCTIONS
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
              color: "#c4b5fd",
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
            <span style={{ display: "flex", marginRight: "14px" }}>Next-Gen Media Production &amp;</span>
            <span
              style={{
                display: "flex",
                color: "#67e8f9",
              }}
            >
              AI Soundstage.
            </span>
          </div>

          <div
            style={{
              fontSize: "21px",
              lineHeight: 1.45,
              color: "#beb4db",
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
                backgroundColor: "rgba(124, 58, 237, 0.12)",
                border: "1px solid rgba(124, 58, 237, 0.3)",
                color: "#e0e7ff",
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
