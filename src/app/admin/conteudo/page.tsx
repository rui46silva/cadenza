import { redirect } from "next/navigation";
import Link from "next/link";
import { Newspaper, Briefcase } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminContentPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [newsCount, jobsCount] = await Promise.all([
    prisma.newsArticle.count(),
    prisma.jobListing.count(),
  ]);

  const cards = [
    {
      href: "/admin/conteudo/noticias",
      icon: Newspaper,
      title: "Notícias",
      desc: "Criar e editar notícias com gestão de SEO (título, slug, meta e palavra-chave).",
      count: `${newsCount} publicadas`,
    },
    {
      href: "/admin/conteudo/vagas",
      icon: Briefcase,
      title: "Vagas e oportunidades",
      desc: "Criar e editar vagas com gestão de SEO e destaque no topo.",
      count: `${jobsCount} ativas`,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col gap-6 px-4 py-6">
      <div>
        <Link href="/admin" className="text-sm text-black/50 dark:text-white/50 hover:text-accent">
          ← Painel de Admin
        </Link>
        <h1 className="text-2xl font-bold mt-1">Gestão de conteúdo</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          Escolhe o que queres gerir. Cada secção tem a sua página dedicada com SEO.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="flex flex-col gap-2 rounded-xl border border-black/10 dark:border-white/10 p-5 transition-colors hover:border-accent/60"
          >
            <c.icon className="h-6 w-6 text-accent" />
            <span className="font-semibold">{c.title}</span>
            <span className="text-sm text-black/60 dark:text-white/60">{c.desc}</span>
            <span className="mt-1 text-xs text-black/40 dark:text-white/40">{c.count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
