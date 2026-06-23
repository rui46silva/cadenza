import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import CommentForm from "@/components/CommentForm";
import VoteButtons from "@/components/VoteButtons";

function getVideoEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    return url;
  } catch {
    return url;
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, role: true } },
      tags: { include: { tag: true } },
      votes: true,
      comments: {
        where: { parentId: null },
        include: {
          author: { select: { name: true, role: true } },
          replies: {
            include: { author: { select: { name: true, role: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) notFound();

  const score = post.votes.reduce(
    (acc, v) => acc + (v.value === "UP" ? 1 : -1),
    0
  );

  return (
    <article className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">
          {post.type === "VIDEO" ? "🎥" : "📝"} {post.title}
        </h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          por {post.author.name} ({post.author.role})
        </p>
        {post.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {post.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-xs"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </header>

      {post.type === "VIDEO" && post.videoUrl ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
          <iframe
            src={getVideoEmbedUrl(post.videoUrl)}
            className="h-full w-full"
            allowFullScreen
          />
        </div>
      ) : (
        <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
      )}

      {session?.user && <VoteButtons postId={post.id} initialScore={score} />}

      <section className="flex flex-col gap-4 mt-2">
        <h2 className="font-semibold">
          Comentários ({post.comments.length})
        </h2>

        {session?.user ? (
          <CommentForm postId={post.id} />
        ) : (
          <p className="text-sm text-black/50 dark:text-white/50">
            Entra na tua conta para comentar.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {post.comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-lg border border-black/10 dark:border-white/10 p-3"
            >
              <p className="text-sm font-medium">
                {comment.author.name}{" "}
                <span className="text-black/40 dark:text-white/40">
                  ({comment.author.role})
                </span>
              </p>
              <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>

              {comment.replies.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2 border-l border-black/10 dark:border-white/10 pl-3">
                  {comment.replies.map((reply) => (
                    <li key={reply.id}>
                      <p className="text-sm font-medium">
                        {reply.author.name}{" "}
                        <span className="text-black/40 dark:text-white/40">
                          ({reply.author.role})
                        </span>
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
