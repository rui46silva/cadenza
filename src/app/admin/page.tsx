import Link from "next/link";
import {
  Users,
  FileText,
  MessageSquare,
  Eye,
  Flag,
  BadgeCheck,
  ListChecks,
  Newspaper,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdminArea } from "@/lib/adminAuth";
import { isStaff, canEditContent } from "@/lib/moderation";
import { getDashboardStats } from "@/lib/adminStats";
import { formatRelativeTime } from "@/lib/time";
import AdminHeader from "@/components/admin/AdminHeader";
import LaunchButton from "@/components/admin/LaunchButton";

export default async function AdminDashboardPage() {
  const { role, isAdmin } = await requireAdminArea();
  const staff = isStaff(role);
  const editor = canEditContent(role);

  const [stats, reports, waitlistPending, recentPosts, recentUsers, drafts] = await Promise.all([
    getDashboardStats(),
    staff ? prisma.report.count({ where: { status: "PENDING" } }) : 0,
    isAdmin ? prisma.waitlistSignup.count({ where: { invitedAt: null } }) : 0,
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, slug: true, title: true, createdAt: true, author: { select: { name: true } } },
    }),
    prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, name: true, role: true, createdAt: true },
    }),
    editor ? prisma.newsArticle.count({ where: { published: false } }) : 0,
  ]);

  const kpis = [
    { label: "Utilizadores", value: stats.totalUsers, sub: `+${stats.newUsers7d} em 7 dias`, icon: Users },
    { label: "Posts", value: stats.totalPosts, sub: `+${stats.newPosts7d} em 7 dias`, icon: FileText },
    { label: "Comentários", value: stats.totalComments, sub: `${stats.totalVotes} votos`, icon: MessageSquare },
    { label: "Visualizações", value: stats.totalViews, sub: "total de leituras", icon: Eye },
  ];

  const todo = [
    { href: "/admin/denuncias", label: "Denúncias por rever", value: reports, icon: Flag, show: staff },
    { href: "/admin/verificacoes", label: "Verificações pendentes", value: stats.pendingVerifications, icon: BadgeCheck, show: isAdmin },
    { href: "/admin/lista-espera", label: "Por convidar (lista de espera)", value: waitlistPending, icon: ListChecks, show: isAdmin },
    { href: "/admin/conteudo/noticias?estado=rascunho", label: "Notícias em rascunho", value: drafts, icon: Newspaper, show: editor },
  ].filter((t) => t.show);

  const maxDaily = Math.max(1, ...stats.daily.map((d) => Math.max(d.users, d.posts)));

  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="Visão geral da Cadenza e o que precisa da tua atenção."
        actions={
          editor && (
            <>
              <Link href="/admin/conteudo/noticias/nova" className="rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:brightness-110">
                + Nova notícia
              </Link>
              <Link href="/admin/conteudo/vagas/nova" className="rounded-full border border-black/15 px-3 py-1.5 text-sm hover:border-accent hover:text-accent dark:border-white/20">
                + Nova vaga
              </Link>
            </>
          )
        }
      />

      {isAdmin && process.env.NEXT_PUBLIC_SHOW_LAUNCH_BUTTON === "true" && <LaunchButton />}

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-black/10 p-4 dark:border-white/10">
            <div className="flex items-center justify-between text-black/50 dark:text-white/50">
              <span className="text-xs">{k.label}</span>
              <k.icon className="h-4 w-4" />
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums">{k.value.toLocaleString("pt-PT")}</p>
            <p className="text-xs text-black/40 dark:text-white/40">{k.sub}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Crescimento */}
        <section className="rounded-xl border border-black/10 p-4 dark:border-white/10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Últimos 14 dias</h2>
            <div className="flex items-center gap-3 text-xs text-black/50 dark:text-white/50">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-accent" /> Utilizadores</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-fuchsia-500" /> Posts</span>
            </div>
          </div>
          <div className="flex h-40 items-end gap-1.5">
            {stats.daily.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1" title={`${d.date}: ${d.users} utilizadores, ${d.posts} posts`}>
                <div className="flex w-full flex-1 items-end justify-center gap-0.5">
                  <div className="w-1/2 rounded-t bg-accent" style={{ height: `${(d.users / maxDaily) * 100}%`, minHeight: d.users ? 3 : 0 }} />
                  <div className="w-1/2 rounded-t bg-fuchsia-500" style={{ height: `${(d.posts / maxDaily) * 100}%`, minHeight: d.posts ? 3 : 0 }} />
                </div>
                <span className="text-[9px] text-black/40 dark:text-white/40">{d.date.slice(8)}</span>
              </div>
            ))}
          </div>
          {stats.topTags.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-black/60 dark:text-white/60">
              <span>Tópicos em alta:</span>
              {stats.topTags.map((t) => (
                <span key={t.name} className="rounded-full bg-black/5 px-2 py-0.5 dark:bg-white/10">#{t.name} · {t.count}</span>
              ))}
            </div>
          )}
        </section>

        {/* A tratar */}
        <section className="rounded-xl border border-black/10 p-4 dark:border-white/10">
          <h2 className="mb-3 font-semibold">A tratar</h2>
          <ul className="flex flex-col gap-1">
            {todo.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-black/5 dark:hover:bg-white/10">
                  <t.icon className="h-4 w-4 text-accent" />
                  <span className="flex-1 text-sm">{t.label}</span>
                  <span className={`rounded-full px-2 text-xs font-semibold ${t.value > 0 ? "bg-accent text-accent-foreground" : "bg-black/5 text-black/40 dark:bg-white/10 dark:text-white/40"}`}>
                    {t.value}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-black/10 p-4 dark:border-white/10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Posts recentes</h2>
            <Link href="/forum" className="flex items-center gap-1 text-xs text-accent hover:underline">Ver fórum <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
            {recentPosts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <Link href={`/posts/${p.slug ?? p.id}`} className="truncate hover:text-accent">{p.title}</Link>
                <span className="shrink-0 text-xs text-black/40 dark:text-white/40">{p.author.name} · {formatRelativeTime(p.createdAt)}</span>
              </li>
            ))}
            {recentPosts.length === 0 && <li className="py-2 text-sm text-black/50 dark:text-white/50">Ainda não há posts.</li>}
          </ul>
        </section>

        <section className="rounded-xl border border-black/10 p-4 dark:border-white/10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Novos membros</h2>
            {staff && <Link href="/admin/utilizadores" className="flex items-center gap-1 text-xs text-accent hover:underline">Gerir <ArrowRight className="h-3 w-3" /></Link>}
          </div>
          <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <Link href={`/perfil/${u.id}`} className="truncate hover:text-accent">{u.name}</Link>
                <span className="shrink-0 text-xs text-black/40 dark:text-white/40">{u.role} · {formatRelativeTime(u.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {editor && (
        <section className="grid gap-3 sm:grid-cols-2">
          <Link href="/admin/conteudo/vagas" className="flex items-center gap-3 rounded-xl border border-black/10 p-4 hover:border-accent/60 dark:border-white/10">
            <Briefcase className="h-5 w-5 text-accent" />
            <span className="text-sm">Gerir vagas e oportunidades</span>
          </Link>
          <Link href="/admin/seo" className="flex items-center gap-3 rounded-xl border border-black/10 p-4 hover:border-accent/60 dark:border-white/10">
            <Newspaper className="h-5 w-5 text-accent" />
            <span className="text-sm">SEO das páginas</span>
          </Link>
        </section>
      )}
    </>
  );
}
