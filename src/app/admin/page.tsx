import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RoleBadge from "@/components/RoleBadge";
import VerifyProfessorButtons from "@/components/VerifyProfessorButtons";
import BanControls from "@/components/BanControls";
import ModeratorToggle from "@/components/ModeratorToggle";
import { isStaff } from "@/lib/moderation";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    redirect("/");
  }
  const isAdmin = session.user.role === "ADMIN";

  const professors = isAdmin
    ? await prisma.user.findMany({
        where: { role: "PROFESSOR" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          instrument: true,
          verificationStatus: true,
          createdAt: true,
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

  return (
    <div className="mx-auto w-full max-w-4xl flex flex-col gap-6 px-4 py-6">
      <h1 className="text-2xl font-bold">
        {isAdmin ? "Painel de Admin" : "Painel de Moderação"}
      </h1>

      {isAdmin && (
        <section>
          <h2 className="font-semibold mb-3">Verificação de professores</h2>
          <ul className="flex flex-col gap-3">
            {professors.length === 0 && (
              <p className="text-black/50 dark:text-white/50">
                Ainda não há professores registados.
              </p>
            )}
            {professors.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-black/10 dark:border-white/10 p-4 flex items-center justify-between gap-4"
              >
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
                {p.verificationStatus === "PENDING" ? (
                  <VerifyProfessorButtons userId={p.id} />
                ) : (
                  <span className="text-sm text-black/50 dark:text-white/50">
                    {p.verificationStatus === "APPROVED" ? "Aprovado" : "Rejeitado"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

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
                  <ModeratorToggle userId={u.id} isModerator={u.role === "MODERATOR"} />
                )}
                <BanControls userId={u.id} activeBan={u.activeBan} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
