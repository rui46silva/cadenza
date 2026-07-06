"use client";

import { useRef, useState } from "react";
import { Share2, Link2, Check } from "lucide-react";
import { useDismiss } from "@/lib/useDismiss";
import { useToast } from "@/components/ToastProvider";

export default function SharePostButton({
  postId,
  title,
}: {
  postId: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(title);
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useDismiss(ref, () => setOpen(false), open);

  function getUrl() {
    return `${window.location.origin}/posts/${postId}`;
  }

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const text = message.trim() || title;
    await navigator.clipboard.writeText(`${text}\n${getUrl()}`).catch(() => null);
    setCopied(true);
    toast("Link copiado");
    setTimeout(() => setCopied(false), 1500);
  }

  function shareLink(kind: "whatsapp" | "twitter" | "facebook") {
    const url = encodeURIComponent(getUrl());
    const text = encodeURIComponent(message.trim() || title);
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
          className="absolute left-0 z-20 mt-1 w-64 overflow-hidden rounded-md border border-black/15 dark:border-white/20 bg-white dark:bg-black p-2 shadow-md text-sm"
        >
          <label className="block px-1 pb-1 text-xs text-black/50 dark:text-white/50">
            Mensagem
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            rows={3}
            className="mb-2 w-full resize-none rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1.5 text-sm"
          />
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
