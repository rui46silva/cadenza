import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RoleBadge from "@/components/RoleBadge";

export default async function Navbar() {
  const session = await auth();
  const user = session?.user
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          role: true,
          instrument: true,
          verificationStatus: true,
          avatarUrl: true,
        },
      })
    : null;

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <nav className="mx-auto max-w-4xl flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-lg">
          🎵 Cadenza
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {session?.user && user ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-black/60 dark:text-white/60">
                  {user.name}
                </span>
              </Link>
              <RoleBadge user={user} />
              {user.role === "ADMIN" && (
                <Link href="/admin" className="hover:underline">
                  Admin
                </Link>
              )}
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
