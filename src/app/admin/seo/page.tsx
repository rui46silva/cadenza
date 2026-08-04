import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MANAGED_PAGES } from "@/lib/pageMeta";
import PageMetaManager from "@/components/admin/PageMetaManager";

export default async function AdminSeoPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const overrides = await prisma.pageMeta.findMany();
  const byPath = new Map(overrides.map((o) => [o.path, o]));

  const pages = MANAGED_PAGES.map((p) => ({
    ...p,
    title: byPath.get(p.path)?.title ?? "",
    metaDescription: byPath.get(p.path)?.metaDescription ?? "",
  }));

  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col gap-6 px-4 py-6">
      <div>
        <Link href="/admin" className="text-sm text-black/50 dark:text-white/50 hover:text-accent">
          ← Painel de Admin
        </Link>
        <h1 className="text-2xl font-bold mt-1">SEO das páginas</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          Personaliza o título e a meta-descrição de cada página fixa da plataforma
          para melhorar a pontuação no Google. Os slugs de notícias e posts editam-se
          na respetiva publicação.
        </p>
      </div>

      <PageMetaManager pages={pages} />
    </div>
  );
}
