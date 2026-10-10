import { ImageResponse } from "next/og";
import { YASPR_VECTOR_PATH } from "@/components/ui/yasprVectorPath";

export const runtime = "nodejs";

export const alt = "Yas Pro | AI Media Hub & Virtual Production Dubai";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Authentic SVG paths extracted directly from the official Yas Pro O emblem
const YAS_O_RING_PATH =
  "M 326,349 L 88,448 L 92,453 L 118,472 L 135,482 L 166,496 L 184,502 L 216,509 L 231,511 L 260,510 L 264,498 L 270,486 L 276,469 L 282,457 L 293,428 L 306,399 Z M 372,273 L 367,283 L 349,329 L 331,370 L 313,416 L 273,511 L 288,510 L 311,506 L 327,502 L 362,489 L 378,480 L 380,480 L 405,464 L 424,449 L 439,434 L 431,417 L 425,400 L 408,359 L 402,347 Z M 0,272 L 5,309 L 11,332 L 22,361 L 31,379 L 46,403 L 65,427 L 77,436 L 84,434 L 89,431 L 237,371 L 203,356 L 98,313 L 79,304 L 55,295 L 36,286 L 2,272 Z M 350,187 L 376,248 L 392,289 L 398,301 L 421,359 L 427,371 L 446,419 L 449,424 L 466,402 L 478,383 L 488,364 L 497,342 L 503,323 L 509,294 L 511,278 L 511,253 L 449,228 L 420,215 L 374,197 L 357,189 Z M 64,87 L 54,98 L 36,124 L 21,153 L 15,168 L 8,190 L 4,207 L 0,237 L 1,258 L 161,325 L 126,238 L 120,226 L 119,221 L 102,182 L 69,99 L 64,89 Z M 239,1 L 222,2 L 195,7 L 174,13 L 151,22 L 133,31 L 109,46 L 86,64 L 74,76 L 74,79 L 140,238 Z M 186,162 L 300,116 L 317,108 L 405,72 L 422,66 L 425,64 L 404,47 L 382,33 L 369,26 L 343,15 L 324,9 L 303,4 L 270,0 L 253,1 Z";

const YAS_YELLOW_BLADE_PATH =
  "M 274,141 L 511,239 L 509,218 L 505,197 L 497,170 L 489,150 L 477,127 L 464,107 L 449,88 L 438,76 L 435,74 Z";

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
          padding: "54px 64px",
          backgroundColor: "#070709",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Cinematic Studio Atmospheric Lighting (Studio Mauve & Rich Violet) */}
        <div
          style={{
            position: "absolute",
            top: "-140px",
            right: "-100px",
            width: "680px",
            height: "680px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(118, 80, 134, 0.32) 0%, rgba(84, 37, 104, 0.18) 45%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            left: "-80px",
            width: "560px",
            height: "560px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(152, 123, 165, 0.22) 0%, rgba(84, 37, 104, 0.1) 50%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top Header: Authentic Brand Vector Wordmark + GCC Hub Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            width: "100%",
          }}
        >
          {/* Authentic Brand Wordmark with Triangle Delta 'A' + Docked Aperture [O] */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 18px",
                borderRadius: "18px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(152, 123, 165, 0.25)",
              }}
            >
              {/* Authentic Letters SVG */}
              <svg
                width="240"
                height="51"
                viewBox="0 0 299.693 63.864"
                fill="none"
              >
                <defs>
                  <linearGradient id="og-brand-letters" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="50%" stopColor="#f8fafc" />
                    <stop offset="85%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </linearGradient>
                </defs>
                <path d={YASPR_VECTOR_PATH} fill="url(#og-brand-letters)" />
              </svg>

              {/* Authentic Docked Aperture [O] matching loader */}
              <div
                style={{
                  width: "58px",
                  height: "58px",
                  marginLeft: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <svg width="58" height="58" viewBox="0 0 512 512" fill="none">
                  <defs>
                    <radialGradient id="og-o-halo" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#1e1038" />
                      <stop offset="70%" stopColor="#090514" />
                      <stop offset="100%" stopColor="#030107" />
                    </radialGradient>
                    <linearGradient id="og-o-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1a1228" />
                      <stop offset="50%" stopColor="#0d0817" />
                      <stop offset="100%" stopColor="#140d20" />
                    </linearGradient>
                    <linearGradient id="og-o-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="25%" stopColor="#fff04d" />
                      <stop offset="60%" stopColor="#ffe900" />
                      <stop offset="100%" stopColor="#eab308" />
                    </linearGradient>
                  </defs>

                  <circle
                    cx="256"
                    cy="256"
                    r="252"
                    fill="url(#og-o-halo)"
                    stroke="rgba(152, 123, 165, 0.45)"
                    strokeWidth="3"
                  />

                  {/* Dark aperture blades + white seams */}
                  <path
                    d={YAS_O_RING_PATH}
                    fill="#ffffff"
                    stroke="#ffffff"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    fillRule="evenodd"
                  />
                  <path d={YAS_O_RING_PATH} fill="url(#og-o-dark)" fillRule="evenodd" />

                  {/* Signature glowing yellow blade */}
                  <path
                    d={YAS_YELLOW_BLADE_PATH}
                    stroke="#ffffff"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  <path d={YAS_YELLOW_BLADE_PATH} fill="url(#og-o-yellow)" />

                  {/* Studio Mauve pupil iris */}
                  <circle
                    cx="256"
                    cy="256"
                    r="112"
                    fill="#06020e"
                    stroke="rgba(152, 123, 165, 0.5)"
                    strokeWidth="2.5"
                  />
                  <circle cx="256" cy="256" r="64" fill="rgba(152, 123, 165, 0.2)" />
                </svg>
              </div>
            </div>
          </div>

          {/* Hub Status Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 22px",
              borderRadius: "999px",
              backgroundColor: "rgba(118, 80, 134, 0.12)",
              border: "1px solid rgba(152, 123, 165, 0.35)",
              color: "#ddd3e1",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.08em",
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
            <span style={{ display: "flex" }}>DUBAI STUDIO CITY • AI MEDIA HUB</span>
          </div>
        </div>

        {/* Center Main Headline & Studio Capabilities */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            position: "relative",
            maxWidth: "1000px",
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
              flexWrap: "wrap",
            }}
          >
            <span style={{ display: "flex", marginRight: "14px" }}>
              Cinematic Virtual Production &amp;
            </span>
            <span
              style={{
                display: "flex",
                color: "#987ba5",
              }}
            >
              Soundstages.
            </span>
          </div>

          <div
            style={{
              fontSize: "21px",
              lineHeight: 1.45,
              color: "#cbd5e1",
              fontWeight: 400,
              maxWidth: "880px",
              display: "flex",
            }}
          >
            From green screen to another dimension. 3D virtual production soundstages, OB-VAN live
            broadcast, cinema gear rental, and top-tier MENA creator network.
          </div>
        </div>

        {/* Bottom Feature Badges (Styled in Studio Mauve & Violet) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            position: "relative",
          }}
        >
          {[
            "3D Virtual Soundstage",
            "Cinema Camera & Lens Dispatch",
            "OB-VAN 4K Live Broadcast",
            "Premier MENA Creator Network",
          ].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 18px",
                borderRadius: "12px",
                backgroundColor: "rgba(118, 80, 134, 0.15)",
                border: "1px solid rgba(152, 123, 165, 0.3)",
                color: "#f1f5f9",
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
