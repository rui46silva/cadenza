import Link from "next/link";
import { Flame } from "lucide-react";
import Logo from "@/components/Logo";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserBadges from "@/components/UserBadges";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import MobileMenu from "@/components/MobileMenu";
import MobileNavLinks from "@/components/MobileNavLinks";
import { buttonPrimarySm } from "@/lib/ui";
import { isStaff } from "@/lib/moderation";
import { touchStreak } from "@/lib/streaks";

export default async function Navbar() {
  const session = await auth();
  const user = session?.user
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          email: true,
          role: true,
          instrument: true,
          verificationStatus: true,
          avatarUrl: true,
          isAmbassador: true,
        },
      })
    : null;

  const streak = session?.user ? await touchStreak(session.user.id) : 0;
  const isDemo = user?.email === "demo@cadenza.app";

  const signOutForm = (
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
  );

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 dark:border-white/10 bg-white/90 backdrop-blur dark:bg-black/90">
      {isDemo && (
        <div className="flex items-center justify-center gap-2 bg-accent/10 px-4 py-1.5 text-xs text-accent">
          Estás em modo demo — os dados podem ser reiniciados a qualquer momento.
        </div>
      )}
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center text-black dark:text-white">
          <Logo className="h-7 w-auto" />
        </Link>
        <SearchBar className="hidden flex-1 items-center gap-2 lg:flex lg:max-w-md" />

        {/* Ecrãs grandes: tudo visível na barra */}
        <div className="hidden shrink-0 items-center gap-3 text-sm md:gap-4 lg:flex">
          <Link href="/forum" className="hover:underline">
            Fórum
          </Link>
          <ThemeToggle />
          {session?.user && user ? (
            <>
              {streak >= 2 && (
                <span
                  title={`${streak} dias seguidos na Cadenza`}
                  className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-500"
                >
                  <Flame className="h-3.5 w-3.5" />
                  {streak}
                </span>
              )}
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
                <span className="inline-flex items-center gap-1 text-black/60 dark:text-white/60">
                  {user.name}
                  <UserBadges user={user} />
                </span>
              </Link>
              {isStaff(user.role) && (
                <Link href="/admin" className="hover:underline">
                  {user.role === "ADMIN" ? "Admin" : "Moderação"}
                </Link>
              )}
              <Link href="/posts/new" className={buttonPrimarySm}>
                Novo post
              </Link>
              {signOutForm}
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

        {/* Tablet/mobile: só o nome (se autenticado) e o menu hambúrguer */}
        <div className="flex shrink-0 items-center gap-3 lg:hidden">
          {session?.user && user && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-black/70 dark:text-white/70"
            >
              {user.name}
              <UserBadges user={user} />
            </Link>
          )}
          <MobileMenu>
            <SearchBar className="flex items-center gap-2" />
            <MobileNavLinks />

            <div className="flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-4 text-sm">
              Tema
              <ThemeToggle />
            </div>

            <div className="flex flex-col gap-3 border-t border-black/10 dark:border-white/10 pt-4 text-sm">
              {session?.user && user ? (
                <>
                  <div className="flex items-center justify-between">
                    <Link href="/dashboard" className="hover:underline">
                      O meu perfil
                    </Link>
                    <NotificationBell />
                  </div>
                  {streak >= 2 && (
                    <span className="flex w-fit items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-500">
                      <Flame className="h-3.5 w-3.5" />
                      {streak} dias seguidos
                    </span>
                  )}
                  {isStaff(user.role) && (
                    <Link href="/admin" className="hover:underline">
                      {user.role === "ADMIN" ? "Admin" : "Moderação"}
                    </Link>
                  )}
                  <Link href="/posts/new" className={`${buttonPrimarySm} w-fit`}>
                    Novo post
                  </Link>
                  {signOutForm}
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:underline">
                    Entrar
                  </Link>
                  <Link href="/register" className={`${buttonPrimarySm} w-fit`}>
                    Criar conta
                  </Link>
                </>
              )}
            </div>
          </MobileMenu>
        </div>
      </nav>
    </header>
  );
}
