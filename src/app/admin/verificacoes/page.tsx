import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { isFeaturedActive } from "@/lib/monetization";
import { PREMIUM_ENABLED } from "@/lib/features";
import AdminHeader from "@/components/admin/AdminHeader";
import RoleBadge from "@/components/RoleBadge";
import VerifyProfessorButtons from "@/components/VerifyProfessorButtons";
import AmbassadorToggle from "@/components/AmbassadorToggle";
import PremiumToggle from "@/components/PremiumToggle";
import FeaturedToggle from "@/components/FeaturedToggle";

const TABS = [
  { value: "PENDING", label: "Pendentes" },
  { value: "APPROVED", label: "Aprovados" },
  { value: "REJECTED", label: "Rejeitados" },
] as const;

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  await requireAdmin();
  const { estado = "PENDING" } = await searchParams;
  const status = TABS.some((t) => t.value === estado) ? (estado as (typeof TABS)[number]["value"]) : "PENDING";

  const [counts, pros] = await Promise.all([
    prisma.user.groupBy({
      by: ["verificationStatus"],
      where: { role: { in: ["PROFESSOR", "MUSICO_PROFISSIONAL"] }, deletedAt: null },
      _count: { _all: true },
    }),
    prisma.user.findMany({
      where: { role: { in: ["PROFESSOR", "MUSICO_PROFISSIONAL"] }, verificationStatus: status, deletedAt: null },
      orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
      select: {
        id: true, name: true, email: true, role: true, instrument: true, gender: true,
        verificationStatus: true, verificationNote: true, rejectionReason: true,
        verifiedBy: { select: { name: true } }, createdAt: true,
        isAmbassador: true, isPremium: true, featuredUntil: true,
      },
    }),
  ]);
  const countBy = new Map(counts.map((c) => [c.verificationStatus, c._count._all]));

  return (
    <>
      <AdminHeader
        title="Verificações"
        description="Professores e músicos profissionais, com a credencial submetida no registo."
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/admin/verificacoes?estado=${t.value}`}
            className={`rounded-full px-3 py-1.5 text-sm ${status === t.value ? "bg-accent text-accent-foreground" : "border border-black/15 hover:border-accent dark:border-white/20"}`}
          >
            {t.label} ({countBy.get(t.value) ?? 0})
          </Link>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {pros.length === 0 && <p className="text-black/50 dark:text-white/50">Nada por aqui.</p>}
        {pros.map((p) => (
          <li key={p.id} className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Link href={`/perfil/${p.id}`} className="font-medium hover:text-accent">{p.name}</Link>{" "}
                <span className="text-sm text-black/40 dark:text-white/40">({p.email})</span>
                <div className="mt-1"><RoleBadge user={p} /></div>
                <p className="mt-1 text-xs text-black/40 dark:text-white/40">Registado em {p.createdAt.toLocaleDateString("pt-PT")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <AmbassadorToggle userId={p.id} isAmbassador={p.isAmbassador} />
                {PREMIUM_ENABLED && <PremiumToggle userId={p.id} isPremium={p.isPremium} />}
                <FeaturedToggle userId={p.id} featured={isFeaturedActive(p)} />
                {p.verificationStatus === "PENDING" ? (
                  <VerifyProfessorButtons userId={p.id} />
                ) : (
                  <span className="text-sm text-black/50 dark:text-white/50">
                    {p.verificationStatus === "APPROVED" ? "Aprovado" : "Rejeitado"}
                    {p.verifiedBy && ` por ${p.verifiedBy.name}`}
                  </span>
                )}
              </div>
            </div>
            {p.verificationNote && (
              <p className="rounded-md bg-black/5 p-2 text-sm text-black/60 dark:bg-white/5 dark:text-white/60">&ldquo;{p.verificationNote}&rdquo;</p>
            )}
            {p.verificationStatus === "REJECTED" && p.rejectionReason && (
              <p className="text-sm text-rose-600 dark:text-rose-400">Motivo da rejeição: {p.rejectionReason}</p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
