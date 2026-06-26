import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const alt = "Post no fórum Cadenza";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: { title: true, author: { select: { name: true } } },
  });

  const title = post?.title ?? "Post no fórum Cadenza";
  const author = post?.author.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #0a0a0a 0%, #2e1065 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 700, color: "#a78bfa" }}>Cadenza</div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.25,
            display: "flex",
            maxHeight: 380,
            overflow: "hidden",
          }}
        >
          {title}
        </div>
        {author && (
          <div style={{ fontSize: 28, color: "#cbd5e1" }}>por {author}</div>
        )}
      </div>
    ),
    { ...size }
  );
}
