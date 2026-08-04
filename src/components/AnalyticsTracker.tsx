"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pageview } from "@/lib/gtag";

/**
 * Regista uma visualização de página no GA4 sempre que a rota muda (o App
 * Router navega sem recarregar, por isso o gtag.js não deteta sozinho). Assim
 * garantimos o tracking de todas as páginas visitadas.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    pageview(query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams]);

  return null;
}
