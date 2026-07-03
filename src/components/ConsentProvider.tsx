"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
} from "react";
import type { ConsentDecision } from "@/lib/gtag";

type ConsentContextValue = {
  consent: ConsentDecision | null;
  setConsent: (value: ConsentDecision) => void;
  promptOpen: boolean;
  openPrompt: () => void;
  closePrompt: () => void;
};

const STORAGE_KEY = "cadenza-cookie-consent";
const EVENT = "cadenza-consent-change";

const ConsentContext = createContext<ConsentContextValue>({
  consent: null,
  setConsent: () => {},
  promptOpen: false,
  openPrompt: () => {},
  closePrompt: () => {},
});

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): ConsentDecision | null {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "all" || stored === "essential" || stored === "none"
    ? stored
    : null;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const consent = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const [promptOpen, setPromptOpen] = useState(false);

  const setConsent = (value: ConsentDecision) => {
    window.localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new Event(EVENT));
    setPromptOpen(false);
  };

  return (
    <ConsentContext.Provider
      value={{
        consent,
        setConsent,
        promptOpen,
        openPrompt: () => setPromptOpen(true),
        closePrompt: () => setPromptOpen(false),
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  return useContext(ConsentContext);
}
