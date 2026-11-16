import { redirect } from "next/navigation";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewsManager from "@/components/admin/NewsManager";

export default async function AdminNewsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const articles = await prisma.newsArticle.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col gap-6 px-4 py-6">
      <div>
        <Link href="/admin/conteudo" className="text-sm text-black/50 dark:text-white/50 hover:text-accent">
          ← Gestão de conteúdo
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold mt-1">
          <Newspaper className="h-6 w-6 text-accent" />
          Notícias
        </h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          Cria e edita notícias com gestão de SEO (pré-visualização Google, slug, meta-descrição e palavra-chave de foco).
        </p>
      </div>

      <NewsManager articles={articles} />
    </div>
  );
}
