import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, Video, Pin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import CommentForm from "@/components/CommentForm";
import CommentItem, { CommentNode } from "@/components/CommentItem";
import VoteButtons from "@/components/VoteButtons";
import RoleBadge from "@/components/RoleBadge";
import AdSlot from "@/components/AdSlot";
import Avatar from "@/components/Avatar";
import PinToggle from "@/components/PinToggle";
import DeletePostButton from "@/components/DeletePostButton";
import { isStaff } from "@/lib/moderation";

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

function buildCommentTree(
  comments: {
    id: string;
    content: string;
    isDeleted: boolean;
    parentId: string | null;
    authorId: string;
    author: {
      name: string;
      role: string;
      instrument: string | null;
      verificationStatus: string | null;
    };
  }[]
): CommentNode[] {
  const byId = new Map<string, CommentNode>();
  for (const c of comments) {
    byId.set(c.id, { ...c, children: [] });
  }

  const roots: CommentNode[] = [];
  for (const c of comments) {
    const node = byId.get(c.id)!;
    if (c.parentId && byId.has(c.parentId)) {
      byId.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
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
      author: {
        select: {
          id: true,
          name: true,
          role: true,
          instrument: true,
          verificationStatus: true,
          avatarUrl: true,
        },
      },
      tags: { include: { tag: true } },
      votes: true,
      comments: {
        include: {
          author: {
            select: { name: true, role: true, instrument: true, verificationStatus: true },
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

  const commentTree = buildCommentTree(post.comments);

  return (
    <article className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          {post.type === "VIDEO" ? (
            <Video className="h-5 w-5 text-accent shrink-0" />
          ) : (
            <FileText className="h-5 w-5 text-accent shrink-0" />
          )}
          {post.title}
          {post.pinned && <Pin className="h-4 w-4 text-accent shrink-0" />}
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <Link href={`/perfil/${post.author.id}`} className="flex items-center gap-2 hover:underline">
            <Avatar name={post.author.name} avatarUrl={post.author.avatarUrl} />
            <span className="text-black/50 dark:text-white/50">
              por {post.author.name}
            </span>
          </Link>
          <RoleBadge user={post.author} />
          {isStaff(session?.user?.role) && (
            <>
              <PinToggle postId={post.id} pinned={post.pinned} />
              <DeletePostButton postId={post.id} />
            </>
          )}
        </div>
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
          Comentários ({post.comments.filter((c) => !c.isDeleted).length})
        </h2>

        {session?.user ? (
          <CommentForm postId={post.id} />
        ) : (
          <p className="text-sm text-black/50 dark:text-white/50">
            Entra na tua conta para comentar.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {commentTree.map((comment) => (
            <CommentItem
              key={comment.id}
              postId={post.id}
              comment={comment}
              currentUserId={session?.user?.id}
              currentUserRole={session?.user?.role}
            />
          ))}
        </ul>
      </section>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />
    </article>
  );
}
