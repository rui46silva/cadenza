"use client";

import Script from "next/script";
import { useConsent } from "@/components/ConsentProvider";

export default function AdSenseScript() {
  const { consent } = useConsent();
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  // Carrega o AdSense apenas após consentimento explícito (RGPD) e se configurado.
  if (!client || consent !== "granted") return null;

  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  );
}
