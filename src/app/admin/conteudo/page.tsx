import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewsManager from "@/components/admin/NewsManager";
import JobManager from "@/components/admin/JobManager";

export default async function AdminContentPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [articles, jobs] = await Promise.all([
    prisma.newsArticle.findMany({ orderBy: { publishedAt: "desc" } }),
    prisma.jobListing.findMany({ orderBy: [{ featured: "desc" }, { createdAt: "desc" }] }),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col gap-8 px-4 py-6">
      <div>
        <Link href="/admin" className="text-sm text-black/50 dark:text-white/50 hover:text-accent">
          ← Painel de Admin
        </Link>
        <h1 className="text-2xl font-bold mt-1">Gestão de conteúdo</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          Notícias e vagas mostradas na página /noticias.
        </p>
      </div>

      <section>
        <h2 className="font-semibold mb-3">Notícias</h2>
        <NewsManager articles={articles} />
      </section>

      <section>
        <h2 className="font-semibold mb-3">Vagas</h2>
        <JobManager jobs={jobs} />
      </section>
    </div>
  );
}
