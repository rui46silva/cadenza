"use client";

import type { ReactNode } from "react";
import { useConsent } from "@/components/ConsentProvider";

export default function CookiePreferencesButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { openPrompt } = useConsent();

  return (
    <button type="button" onClick={openPrompt} className={className}>
      {children}
    </button>
  );
}
