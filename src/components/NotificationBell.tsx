"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, CheckCheck } from "lucide-react";
import { useDismiss } from "@/lib/useDismiss";
import { useToast } from "@/components/ToastProvider";

type Notification = {
  id: string;
  type: "COMMENT" | "REPLY" | "QUESTION" | "BEST_ANSWER";
  read: boolean;
  createdAt: string;
  fromUser: { name: string };
  post: { id: string; title: string } | null;
};

function notificationAction(type: Notification["type"]): string {
  switch (type) {
    case "BEST_ANSWER":
      return "fixou a tua resposta — ganhaste 15 pontos!";
    case "QUESTION":
      return "publicou uma dúvida para ti";
    case "REPLY":
      return "respondeu ao teu comentário";
    default:
      return "comentou no teu post";
  }
}

export default function NotificationBell() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  // IDs já vistos, para só notificar via toast as que chegam depois do 1º load.
  const seenIds = useRef<Set<string> | null>(null);

  function load() {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const next: Notification[] = data.notifications ?? [];

        if (seenIds.current === null) {
          // Primeiro carregamento: regista o estado atual sem notificar.
          seenIds.current = new Set(next.map((n) => n.id));
        } else {
          const fresh = next.filter(
            (n) => !n.read && !seenIds.current!.has(n.id)
          );
          for (const n of fresh) {
            toast(`${n.fromUser.name} ${notificationAction(n.type)}`);
          }
          next.forEach((n) => seenIds.current!.add(n.id));
        }

        setNotifications(next);
      })
      .catch(() => {});
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDismiss(ref, () => setOpen(false), open);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function openNotification(n: Notification) {
    setOpen(false);
    if (!n.read) {
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
      );
      fetch(`/api/notifications/${n.id}`, { method: "PATCH" }).catch(() => {});
    }
    if (n.post) router.push(`/posts/${n.post.id}`);
  }

  async function remove(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    fetch(`/api/notifications/${id}`, { method: "DELETE" }).catch(() => {});
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    fetch("/api/notifications", { method: "PATCH" }).catch(() => {});
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificações"
        className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border border-black/15 dark:border-white/20 bg-white dark:bg-black shadow-md">
          <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 px-3 py-2">
            <span className="text-sm font-semibold">Notificações</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-black/50 dark:text-white/50 hover:text-accent"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas como lidas
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-black/50 dark:text-white/50">
                Sem notificações.
              </li>
            )}
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-1 border-b border-black/5 last:border-0 dark:border-white/5 ${
                  !n.read ? "bg-accent/5" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => openNotification(n)}
                  className="flex flex-1 items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent/10"
                >
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  )}
                  <span className={n.read ? "text-black/60 dark:text-white/60" : ""}>
                    <strong>{n.fromUser.name}</strong> {notificationAction(n.type)}
                    {n.post && <> em &ldquo;{n.post.title}&rdquo;</>}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => remove(n.id)}
                  aria-label="Eliminar notificação"
                  className="mt-1.5 mr-1 shrink-0 rounded-full p-1 text-black/30 hover:bg-black/5 hover:text-rose-500 dark:text-white/30 dark:hover:bg-white/10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
