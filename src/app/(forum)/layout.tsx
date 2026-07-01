import LeftSidebar from "@/components/forum/LeftSidebar";
import RightSidebar from "@/components/forum/RightSidebar";
import OnboardingGate from "@/components/OnboardingGate";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let showOnboarding = false;
  let instrument: string | null = null;
  if (session?.user) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardedAt: true, instrument: true },
    });
    showOnboarding = !!user && !user.onboardedAt;
    instrument = user?.instrument ?? null;
  }

  const suggestedTags = showOnboarding
    ? await prisma.tag.findMany({
        include: { _count: { select: { posts: true } } },
        orderBy: { posts: { _count: "desc" } },
        take: 12,
      })
    : [];

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[200px_1fr_260px]">
      <aside className="hidden lg:sticky lg:top-20 lg:block lg:min-w-0 lg:self-start">
        <LeftSidebar />
      </aside>
      <main className="flex min-w-0 flex-col gap-4">{children}</main>
      <aside className="hidden lg:sticky lg:top-20 lg:block lg:min-w-0 lg:self-start">
        <RightSidebar />
      </aside>
      {showOnboarding && (
        <OnboardingGate
          initialInstrument={instrument}
          tags={suggestedTags.map((t) => ({ id: t.id, name: t.name }))}
        />
      )}
    </div>
  );
}
