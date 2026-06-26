import Link from "next/link";
import Logo from "@/components/Logo";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RoleBadge from "@/components/RoleBadge";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import { buttonPrimarySm } from "@/lib/ui";
import { isStaff } from "@/lib/moderation";

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
    <header className="sticky top-0 z-10 border-b border-black/10 dark:border-white/10 bg-white/90 backdrop-blur dark:bg-black/90">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center text-black dark:text-white">
          <Logo className="h-7 w-auto" />
        </Link>
        <SearchBar />
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 text-sm sm:gap-3 md:gap-4">
          <Link href="/forum" className="hover:underline">
            Fórum
          </Link>
          <ThemeToggle />
          {session?.user && user ? (
            <>
              <NotificationBell />
              <Link href="/dashboard" className="flex items-center gap-2 group">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-transparent group-hover:ring-accent transition-all"
                  />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-sm font-semibold ring-2 ring-transparent group-hover:ring-accent transition-all">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="hidden text-black/60 dark:text-white/60 md:inline">
                  {user.name}
                </span>
              </Link>
              <span className="hidden lg:inline">
                <RoleBadge user={user} />
              </span>
              {isStaff(user.role) && (
                <Link href="/admin" className="hover:underline">
                  {user.role === "ADMIN" ? "Admin" : "Moderação"}
                </Link>
              )}
              <Link href="/posts/new" className={buttonPrimarySm}>
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
              <Link href="/register" className={buttonPrimarySm}>
                Criar conta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
