"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

type Toast = {
  id: number;
  message: string;
  variant: "success" | "error";
  leaving: boolean;
};

const ToastContext = createContext<{
  toast: (message: string, variant?: "success" | "error") => void;
}>({ toast: () => {} });

const VISIBLE_MS = 2600;
const LEAVE_MS = 300;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const toast = useCallback(
    (message: string, variant: "success" | "error" = "success") => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, variant, leaving: false }]);
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
        );
      }, VISIBLE_MS);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, VISIBLE_MS + LEAVE_MS);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-lg transition-all duration-300 ${
              t.leaving ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
            } ${
              t.variant === "error"
                ? "border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                : "border-emerald-500/30 bg-white text-emerald-700 dark:bg-black dark:text-emerald-400"
            }`}
          >
            {t.variant === "error" ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
