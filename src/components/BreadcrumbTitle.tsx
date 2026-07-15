"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Contexto que permite a uma página de detalhe (post, notícia) fornecer o
// título legível para o último item das breadcrumbs, em vez do slug/id.
const BreadcrumbTitleContext = createContext<{
  label: string | null;
  setLabel: (v: string | null) => void;
}>({ label: null, setLabel: () => {} });

export function BreadcrumbTitleProvider({ children }: { children: React.ReactNode }) {
  const [label, setLabel] = useState<string | null>(null);
  return (
    <BreadcrumbTitleContext.Provider value={{ label, setLabel }}>
      {children}
    </BreadcrumbTitleContext.Provider>
  );
}

export function useBreadcrumbTitle() {
  return useContext(BreadcrumbTitleContext).label;
}

/** Renderiza-se numa página de detalhe para definir o título das breadcrumbs. */
export default function BreadcrumbTitle({ title }: { title: string }) {
  const { setLabel } = useContext(BreadcrumbTitleContext);
  useEffect(() => {
    setLabel(title);
    return () => setLabel(null);
  }, [title, setLabel]);
  return null;
}
