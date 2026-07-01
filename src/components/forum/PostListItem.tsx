import Link from "next/link";
import { FileText, Video, Pin, CheckCircle2, Flame } from "lucide-react";
import Avatar from "@/components/Avatar";
import { formatRelativeTime } from "@/lib/time";
import { isTrending } from "@/lib/trending";

const TYPE_ICON: Record<string, typeof FileText> = {
  TEXT: FileText,
  VIDEO: Video,
};

export type PostListItemData = {
  id: string;
  title: string;
  type: string;
  pinned: boolean;
  bestAnswerId: string | null;
  createdAt: Date | string;
  score: number;
  author: { id: string; name: string; avatarUrl: string | null };
  tags: { tag: { id: string; name: string } }[];
  _count: { comments: number };
};

export default function PostListItem({
  post,
  className = "",
}: {
  post: PostListItemData;
  className?: string;
}) {
  const Icon = TYPE_ICON[post.type];
  const createdAt =
    post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt);
  const trending = isTrending({
    score: post.score,
    createdAt,
    commentCount: post._count.comments,
  });

  return (
    <li
      className={`rounded-lg border p-4 transition-colors flex flex-col gap-1 ${
        trending
          ? "border-orange-500/30 bg-orange-500/5 hover:border-orange-500/60"
          : "border-black/10 dark:border-white/10 hover:border-accent/60"
      } ${className}`}
    >
      <Link href={`/posts/${post.id}`} className="flex items-center gap-2 font-medium">
        <Icon className="h-4 w-4 text-accent shrink-0" />
        {post.title}
        {post.pinned && <Pin className="h-3.5 w-3.5 text-accent shrink-0" />}
        {post.bestAnswerId && (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        )}
        {trending && (
          <span className="flex items-center gap-0.5 rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold text-orange-500 shrink-0">
            <Flame className="h-3 w-3" />
            Em alta
          </span>
        )}
      </Link>
      <span className="flex flex-wrap items-center gap-1.5 text-xs text-black/50 dark:text-white/50">
        <Avatar name={post.author.name} avatarUrl={post.author.avatarUrl} size={16} />
        por{" "}
        <Link href={`/perfil/${post.author.id}`} className="hover:text-accent hover:underline">
          {post.author.name}
        </Link>{" "}
        · {post._count.comments} comentários · {post.score} votos ·{" "}
        {formatRelativeTime(createdAt)}
      </span>
      {post.tags.length > 0 && (
        <span className="flex gap-1 flex-wrap mt-1">
          {post.tags.map(({ tag }) => (
            <Link
              key={tag.id}
              href={`/forum?tag=${encodeURIComponent(tag.name)}`}
              className="rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-xs hover:bg-accent/15 hover:text-accent"
            >
              #{tag.name}
            </Link>
          ))}
        </span>
      )}
    </li>
  );
}
