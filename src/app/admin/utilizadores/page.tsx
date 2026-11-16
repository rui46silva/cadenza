import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/adminAuth";
import { PREMIUM_ENABLED } from "@/lib/features";
import AdminHeader from "@/components/admin/AdminHeader";
import RoleBadge from "@/components/RoleBadge";
import BanControls from "@/components/BanControls";
import RoleSelect from "@/components/admin/RoleSelect";
import AmbassadorToggle from "@/components/AmbassadorToggle";
import PremiumToggle from "@/components/PremiumToggle";
import DeleteUserButton from "@/components/DeleteUserButton";

const PAGE_SIZE = 30;
const ROLE_FILTERS = [
  { value: "", label: "Todos" },
  { value: "ALUNO", label: "Alunos" },
  { value: "PROFESSOR", label: "Professores" },
  { value: "MUSICO_PROFISSIONAL", label: "Profissionais" },
  { value: "MODERATOR", label: "Moderadores" },
  { value: "ADMIN", label: "Admins" },
];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string; estado?: string }>;
}) {
  const { isAdmin } = await requireStaff();
  const { q = "", role = "", page = "1", estado = "" } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  const where: Prisma.UserWhereInput = {
    deletedAt: estado === "eliminados" ? { not: null } : null,
    ...(role ? { role: role as Prisma.UserWhereInput["role"] } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(estado === "banidos"
      ? { bans: { some: { liftedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } } }
      : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        instrument: true,
        gender: true,
        verificationStatus: true,
        isAmbassador: true,
        isPremium: true,
        createdAt: true,
        points: true,
        _count: { select: { posts: true, comments: true } },
        bans: {
          where: { liftedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { infraction: true, expiresAt: true },
        },
      },
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (patch: Record<string, string>) => {
    const p = new URLSearchParams({ q, role, estado, page: String(pageNum), ...patch });
    for (const [k, v] of [...p.entries()]) if (!v || (k === "page" && v === "1")) p.delete(k);
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <>
      <AdminHeader title="Utilizadores" description={`${total} resultado(s)`} />

      <form className="flex flex-wrap items-center gap-2" action="/admin/utilizadores">
        <input
          name="q"
          defaultValue={q}
          placeholder="Pesquisar por nome ou email…"
          className="min-w-[220px] flex-1 rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
        />
        <select name="role" defaultValue={role} className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20">
          {ROLE_FILTERS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <select name="estado" defaultValue={estado} className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20">
          <option value="">Ativos</option>
          <option value="banidos">Banidos</option>
          <option value="eliminados">Eliminados</option>
        </select>
        <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">Filtrar</button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/[0.03] text-left text-xs text-black/50 dark:bg-white/5 dark:text-white/50">
            <tr>
              <th className="px-3 py-2 font-medium">Utilizador</th>
              <th className="px-3 py-2 font-medium">Atividade</th>
              <th className="px-3 py-2 font-medium">Desde</th>
              <th className="px-3 py-2 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {users.map((u) => {
              const canModerate = u.role !== "ADMIN";
              return (
                <tr key={u.id} className="align-top">
                  <td className="px-3 py-3">
                    <Link href={`/perfil/${u.id}`} className="font-medium hover:text-accent">{u.name}</Link>
                    <p className="text-xs text-black/40 dark:text-white/40">{u.email}</p>
                    <div className="mt-1"><RoleBadge user={u} /></div>
                  </td>
                  <td className="px-3 py-3 text-xs text-black/60 dark:text-white/60">
                    {u._count.posts} posts · {u._count.comments} comentários
                    <br />
                    {u.points} pontos
                  </td>
                  <td className="px-3 py-3 text-xs text-black/60 dark:text-white/60">
                    {u.createdAt.toLocaleDateString("pt-PT")}
                  </td>
                  <td className="px-3 py-3">
                    {canModerate && (
                      <div className="flex flex-wrap justify-end gap-2">
                        {isAdmin && <AmbassadorToggle userId={u.id} isAmbassador={u.isAmbassador} />}
                        {isAdmin && PREMIUM_ENABLED && <PremiumToggle userId={u.id} isPremium={u.isPremium} />}
                        {isAdmin && (u.role === "ALUNO" || u.role === "MODERATOR" || u.role === "EDITOR") && (
                          <RoleSelect userId={u.id} role={u.role} />
                        )}
                        <BanControls userId={u.id} activeBan={u.bans[0] ?? null} />
                        {isAdmin && <DeleteUserButton userId={u.id} />}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-black/50 dark:text-white/50">Sem resultados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-black/50 dark:text-white/50">Página {pageNum} de {pages}</span>
          <div className="flex gap-2">
            {pageNum > 1 && <Link href={`/admin/utilizadores${qs({ page: String(pageNum - 1) })}`} className="rounded-md border border-black/15 px-3 py-1 dark:border-white/20">Anterior</Link>}
            {pageNum < pages && <Link href={`/admin/utilizadores${qs({ page: String(pageNum + 1) })}`} className="rounded-md border border-black/15 px-3 py-1 dark:border-white/20">Seguinte</Link>}
          </div>
        </div>
      )}
    </>
  );
}
