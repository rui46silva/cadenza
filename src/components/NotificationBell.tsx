"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

type Notification = {
  id: string;
  type: "COMMENT" | "REPLY";
  read: boolean;
  createdAt: string;
  fromUser: { name: string };
  post: { id: string; title: string } | null;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  function load() {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      })
      .catch(() => {});
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
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
        <ul className="absolute right-0 z-10 mt-1 w-72 overflow-hidden rounded-md border border-black/15 dark:border-white/20 bg-white dark:bg-black shadow-md">
          {notifications.length === 0 && (
            <li className="px-3 py-4 text-center text-sm text-black/50 dark:text-white/50">
              Sem notificações.
            </li>
          )}
          {notifications.map((n) => (
            <li key={n.id} className={!n.read ? "bg-accent/5" : ""}>
              <Link
                href={n.post ? `/posts/${n.post.id}` : "#"}
                onClick={() => setOpen(false)}
                className="flex flex-col gap-0.5 px-3 py-2 text-sm hover:bg-accent/10"
              >
                <span>
                  <strong>{n.fromUser.name}</strong>{" "}
                  {n.type === "REPLY" ? "respondeu ao teu comentário" : "comentou no teu post"}
                  {n.post && <> em &ldquo;{n.post.title}&rdquo;</>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
