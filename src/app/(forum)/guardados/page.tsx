import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pageMetadata } from "@/lib/pageMeta";
import PostListItem from "@/components/forum/PostListItem";

export function generateMetadata() {
  return pageMetadata("/guardados", {
    title: "Guardados",
    description: "Os posts que guardaste na Cadenza.",
  });
}

export default async function GuardadosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const viewerId = session.user.id;

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: viewerId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      post: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true,
              avatarUrl: true,
              verificationStatus: true,
              isAmbassador: true,
            },
          },
          tags: { include: { tag: true } },
          _count: { select: { comments: true } },
        },
      },
    },
  });

  const posts = bookmarks.map((b) => b.post);
  const votes =
    posts.length > 0
      ? await prisma.postVote.findMany({
          where: { userId: viewerId, postId: { in: posts.map((p) => p.id) } },
          select: { postId: true, value: true },
        })
      : [];
  const voteByPost = new Map(votes.map((v) => [v.postId, v.value]));

  return (
    <div className="flex flex-col gap-4">
      <section>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Bookmark className="h-6 w-6 text-accent" />
          Guardados
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Os posts que guardaste para ver mais tarde.
        </p>
      </section>

      {posts.length === 0 ? (
        <p className="text-black/50 dark:text-white/50">
          Ainda não guardaste nenhum post. Usa o botão <strong>Guardar</strong> num post para o teres aqui.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostListItem
              key={post.id}
              currentUserId={viewerId}
              post={{
                ...post,
                viewerVote: voteByPost.get(post.id) ?? null,
                viewerBookmarked: true,
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
