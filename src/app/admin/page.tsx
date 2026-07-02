import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import RoleBadge from "@/components/RoleBadge";
import VerifyProfessorButtons from "@/components/VerifyProfessorButtons";
import BanControls from "@/components/BanControls";
import ModeratorToggle from "@/components/ModeratorToggle";
import AmbassadorToggle from "@/components/AmbassadorToggle";
import ReportActions from "@/components/ReportActions";
import DeleteWaitlistEntry from "@/components/DeleteWaitlistEntry";
import DeleteUserButton from "@/components/DeleteUserButton";
import TagCategoryManager from "@/components/admin/TagCategoryManager";
import { isStaff, INFRACTION_LABELS } from "@/lib/moderation";
import { getDashboardStats } from "@/lib/adminStats";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    redirect("/");
  }
  const isAdmin = session.user.role === "ADMIN";

  const stats = await getDashboardStats();

  const professionals = isAdmin
    ? await prisma.user.findMany({
        where: { role: { in: ["PROFESSOR", "MUSICO_PROFISSIONAL"] } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          instrument: true,
          verificationStatus: true,
          verificationNote: true,
          rejectionReason: true,
          verifiedAt: true,
          verifiedBy: { select: { name: true } },
          createdAt: true,
          isAmbassador: true,
        },
      })
    : [];

  const moderatableUsers = await prisma.user.findMany({
    where: { role: { in: ["ALUNO", "MODERATOR"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      instrument: true,
      verificationStatus: true,
      isAmbassador: true,
      bans: {
        where: {
          liftedAt: null,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { infraction: true, expiresAt: true },
      },
    },
  });

  const usersWithBanStatus = moderatableUsers.map((u) => ({
    ...u,
    activeBan: u.bans[0] ?? null,
  }));

  const waitlistSignups = isAdmin
    ? await prisma.waitlistSignup.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, instrument: true, createdAt: true },
      })
    : [];

  const tagsWithCounts = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
  const tagsForManager = tagsWithCounts.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    postCount: t._count.posts,
  }));

  const reports = await prisma.report.findMany({
    where: { status: "PENDING" },
    include: {
      post: { select: { id: true, title: true, author: { select: { name: true } } } },
      reporter: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const statCards: { label: string; value: string | number }[] = [
    { label: "Utilizadores", value: stats.totalUsers },
    { label: "Posts", value: stats.totalPosts },
    { label: "Comentários", value: stats.totalComments },
    { label: "Votos", value: stats.totalVotes },
    { label: "Visualizações", value: stats.totalViews },
    { label: "Novos posts (7d)", value: stats.newPosts7d },
    { label: "Novos utilizadores (7d)", value: stats.newUsers7d },
    { label: "Novos utilizadores (30d)", value: stats.newUsers30d },
    { label: "Verificações pendentes", value: stats.pendingVerifications },
    { label: "Banimentos ativos", value: stats.activeBans },
    { label: "Denúncias pendentes", value: reports.length },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl flex flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">
          {isAdmin ? "Painel de Admin" : "Painel de Moderação"}
        </h1>
        {isAdmin && (
          <Link
            href="/admin/conteudo"
            className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
          >
            Gerir notícias e vagas
          </Link>
        )}
      </div>

      <section>
        <h2 className="font-semibold mb-3">Visão geral</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-lg border border-black/10 dark:border-white/10 p-3"
            >
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-black/50 dark:text-white/50">{card.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-black/60 dark:text-white/60">
          <span>Por papel:</span>
          {Object.entries(stats.usersByRole).map(([role, count]) => (
            <span
              key={role}
              className="rounded-full border border-black/10 dark:border-white/10 px-2 py-0.5"
            >
              {role}: {count}
            </span>
          ))}
        </div>
        {stats.topTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-black/60 dark:text-white/60">
            <span>Etiquetas mais usadas:</span>
            {stats.topTags.map((t) => (
              <span
                key={t.name}
                className="rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-xs"
              >
                #{t.name} ({t.count})
              </span>
            ))}
          </div>
        )}
      </section>

      {isAdmin && (
        <section>
          <h2 className="font-semibold mb-3">Verificação de profissionais</h2>
          <p className="text-sm text-black/50 dark:text-white/50 -mt-2 mb-1">
            Professores e músicos profissionais registados, com a credencial submetida no registo.
          </p>
          <ul className="flex flex-col gap-3">
            {professionals.length === 0 && (
              <p className="text-black/50 dark:text-white/50">
                Ainda não há professores ou músicos profissionais registados.
              </p>
            )}
            {professionals.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-black/10 dark:border-white/10 p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-medium">
                      {p.name}{" "}
                      <span className="text-black/40 dark:text-white/40 text-sm">
                        ({p.email})
                      </span>
                    </p>
                    <div className="mt-1">
                      <RoleBadge user={p} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AmbassadorToggle userId={p.id} isAmbassador={p.isAmbassador} />
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
                  <p className="text-sm text-black/60 dark:text-white/60 rounded-md bg-black/5 dark:bg-white/5 p-2">
                    &ldquo;{p.verificationNote}&rdquo;
                  </p>
                )}
                {p.verificationStatus === "REJECTED" && p.rejectionReason && (
                  <p className="text-sm text-rose-600 dark:text-rose-400">
                    Motivo da rejeição: {p.rejectionReason}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {isAdmin && (
        <section>
          <h2 className="font-semibold mb-3">Lista de espera ({waitlistSignups.length})</h2>
          <ul className="flex flex-col gap-2">
            {waitlistSignups.length === 0 && (
              <p className="text-black/50 dark:text-white/50">Ainda não há inscritos.</p>
            )}
            {waitlistSignups.map((w) => (
              <li
                key={w.id}
                className="rounded-lg border border-black/10 dark:border-white/10 p-3 flex items-center justify-between gap-4 flex-wrap"
              >
                <div>
                  <p className="font-medium text-sm">{w.email}</p>
                  <p className="text-xs text-black/50 dark:text-white/50">
                    {w.instrument ?? "Sem instrumento"} ·{" "}
                    {w.createdAt.toLocaleDateString("pt-PT")}
                  </p>
                </div>
                <DeleteWaitlistEntry id={w.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-semibold mb-3">Categorias dos tópicos</h2>
        <p className="text-sm text-black/50 dark:text-white/50 -mt-2 mb-1">
          Tópicos criados livremente pelos utilizadores começam como &ldquo;Outras&rdquo;;
          reatribui-os à categoria correta para aparecerem em /categorias.
        </p>
        <TagCategoryManager tags={tagsForManager} />
      </section>

      <section>
        <h2 className="font-semibold mb-3">Denúncias</h2>
        <ul className="flex flex-col gap-3">
          {reports.length === 0 && (
            <p className="text-black/50 dark:text-white/50">
              Sem denúncias pendentes.
            </p>
          )}
          {reports.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-black/10 dark:border-white/10 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <Link
                    href={`/posts/${r.post.id}`}
                    className="font-medium hover:text-accent hover:underline"
                  >
                    {r.post.title}
                  </Link>
                  <p className="text-xs text-black/50 dark:text-white/50">
                    de {r.post.author.name} · denunciado por {r.reporter.name} ·{" "}
                    {INFRACTION_LABELS[r.reason]}
                  </p>
                  {r.details && (
                    <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                      &ldquo;{r.details}&rdquo;
                    </p>
                  )}
                </div>
              </div>
              <ReportActions reportId={r.id} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Moderação de utilizadores</h2>
        <ul className="flex flex-col gap-3">
          {usersWithBanStatus.length === 0 && (
            <p className="text-black/50 dark:text-white/50">
              Ainda não há utilizadores para moderar.
            </p>
          )}
          {usersWithBanStatus.map((u) => (
            <li
              key={u.id}
              className="rounded-lg border border-black/10 dark:border-white/10 p-4 flex items-center justify-between gap-4 flex-wrap"
            >
              <div>
                <p className="font-medium">
                  {u.name}{" "}
                  <span className="text-black/40 dark:text-white/40 text-sm">
                    ({u.email})
                  </span>
                </p>
                <div className="mt-1">
                  <RoleBadge user={u} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <AmbassadorToggle userId={u.id} isAmbassador={u.isAmbassador} />
                )}
                {isAdmin && (
                  <ModeratorToggle userId={u.id} isModerator={u.role === "MODERATOR"} />
                )}
                <BanControls userId={u.id} activeBan={u.activeBan} />
                {isAdmin && <DeleteUserButton userId={u.id} />}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
