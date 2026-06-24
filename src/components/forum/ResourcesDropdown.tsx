"use client";

import Link from "next/link";
import { useState } from "react";

const RESOURCES = [
  { href: "/regras", label: "Regras do fórum" },
  { href: "/privacidade", label: "Política de privacidade" },
  { href: "/acessibilidade", label: "Acessibilidade" },
];

export default function ResourcesDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
      >
        Recursos
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {open && (
        <ul className="mt-1 flex flex-col gap-0.5 border-l border-black/10 dark:border-white/10 pl-3">
          {RESOURCES.map((r) => (
            <li key={r.href}>
              <Link
                href={r.href}
                className="block rounded-md px-2 py-1 text-sm text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10"
              >
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
