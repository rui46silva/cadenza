import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  PROFESSOR: "Professor",
  ALUNO: "Aluno",
};

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <nav className="mx-auto max-w-4xl flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-lg">
          🎵 Cadenza
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {session?.user ? (
            <>
              <span className="text-black/60 dark:text-white/60">
                {session.user.name} ·{" "}
                {ROLE_LABEL[session.user.role] ?? session.user.role}
              </span>
              <Link
                href="/posts/new"
                className="rounded-md bg-black px-3 py-1.5 text-white dark:bg-white dark:text-black"
              >
                Novo post
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="text-black/60 dark:text-white/60 hover:underline">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-black px-3 py-1.5 text-white dark:bg-white dark:text-black"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
