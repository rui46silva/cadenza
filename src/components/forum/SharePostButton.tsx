"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Link2, Check } from "lucide-react";

export default function SharePostButton({
  postId,
  title,
}: {
  postId: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function getUrl() {
    return `${window.location.origin}/posts/${postId}`;
  }

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(getUrl()).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function shareLink(kind: "whatsapp" | "twitter" | "facebook") {
    const url = encodeURIComponent(getUrl());
    const text = encodeURIComponent(title);
    if (kind === "whatsapp") return `https://wa.me/?text=${text}%20${url}`;
    if (kind === "twitter") return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        title="Partilhar"
        className="flex items-center gap-1 rounded-full border border-black/15 dark:border-white/20 px-2.5 py-1 text-xs text-black/50 dark:text-white/50 hover:border-accent hover:text-accent"
      >
        <Share2 className="h-3.5 w-3.5" />
        Partilhar
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 z-20 mt-1 w-44 overflow-hidden rounded-md border border-black/15 dark:border-white/20 bg-white dark:bg-black p-1 shadow-md text-sm"
        >
          <a
            href={shareLink("whatsapp")}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md px-3 py-1.5 hover:bg-accent/10"
          >
            WhatsApp
          </a>
          <a
            href={shareLink("twitter")}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md px-3 py-1.5 hover:bg-accent/10"
          >
            X (Twitter)
          </a>
          <a
            href={shareLink("facebook")}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md px-3 py-1.5 hover:bg-accent/10"
          >
            Facebook
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-1.5 rounded-md px-3 py-1.5 text-left hover:bg-accent/10"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            {copied ? "Copiado!" : "Copiar link"}
          </button>
        </div>
      )}
    </div>
  );
}
