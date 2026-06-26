import { ImageResponse } from "next/og";

export const alt = "Cadenza — comunidade de músicos";
export const size = { width: 1200, height: 630 };
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
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "linear-gradient(135deg, #0a0a0a 0%, #2e1065 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#a78bfa",
            letterSpacing: -2,
          }}
        >
          Cadenza
        </div>
        <div style={{ fontSize: 32, color: "#e5e5e5", textAlign: "center" }}>
          Partilha a tua música. Cresce com a comunidade.
        </div>
      </div>
    ),
    { ...size }
  );
}
