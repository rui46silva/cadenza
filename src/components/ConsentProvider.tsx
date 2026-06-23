"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
} from "react";

type Consent = "granted" | "denied";

type ConsentContextValue = {
  consent: Consent | null;
  setConsent: (value: Consent) => void;
};

const STORAGE_KEY = "cadenza-cookie-consent";
const EVENT = "cadenza-consent-change";

const ConsentContext = createContext<ConsentContextValue>({
  consent: null,
  setConsent: () => {},
});

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Consent | null {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "granted" || stored === "denied" ? stored : null;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const consent = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const setConsent = (value: Consent) => {
    window.localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new Event(EVENT));
  };

  return (
    <ConsentContext.Provider value={{ consent, setConsent }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  return useContext(ConsentContext);
}
