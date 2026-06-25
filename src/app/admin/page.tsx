import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RoleBadge from "@/components/RoleBadge";
import VerifyProfessorButtons from "@/components/VerifyProfessorButtons";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const professors = await prisma.user.findMany({
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
  });

  return (
    <div className="mx-auto w-full max-w-4xl flex flex-col gap-6 px-4 py-6">
      <h1 className="text-2xl font-bold">Painel de Admin</h1>

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
    </div>
  );
}
