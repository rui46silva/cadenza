import Link from "next/link";
import { FileText, Video, Pin, CheckCircle2, Flame, MessageSquare } from "lucide-react";
import Avatar from "@/components/Avatar";
import { formatRelativeTime } from "@/lib/time";
import { isTrending } from "@/lib/trending";
import { getVideoEmbedUrl } from "@/lib/video";
import PostVoteCompact from "@/components/forum/PostVoteCompact";
import FollowTagButton from "@/components/forum/FollowTagButton";
import SharePostButton from "@/components/forum/SharePostButton";
import ReportPostButton from "@/components/ReportPostButton";

const TYPE_ICON: Record<string, typeof FileText> = {
  TEXT: FileText,
  VIDEO: Video,
};

export type PostListItemData = {
  id: string;
  title: string;
  type: string;
  content: string | null;
  videoUrl: string | null;
  pinned: boolean;
  bestAnswerId: string | null;
  createdAt: Date | string;
  score: number;
  viewerVote?: "UP" | "DOWN" | null;
  primaryTagFollowed?: boolean;
  author: { id: string; name: string; avatarUrl: string | null };
  tags: { tag: { id: string; name: string } }[];
  _count: { comments: number };
};

export default function PostListItem({
  post,
  className = "",
  currentUserId,
}: {
  post: PostListItemData;
  className?: string;
  currentUserId?: string;
}) {
  const Icon = TYPE_ICON[post.type];
  const createdAt =
    post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt);
  const trending = isTrending({
    score: post.score,
    createdAt,
    commentCount: post._count.comments,
  });
  const primaryTag = post.tags[0]?.tag;

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
        · {formatRelativeTime(createdAt)}
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

      {post.type === "TEXT" && post.content && (
        <Link href={`/posts/${post.id}`} className="mt-1 block">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-black/80 dark:text-white/80">
            {post.content}
          </p>
        </Link>
      )}

      {post.type === "VIDEO" && post.videoUrl && (
        <div className="mt-1 aspect-video w-full overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
          <iframe src={getVideoEmbedUrl(post.videoUrl)} className="h-full w-full" allowFullScreen />
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {currentUserId ? (
          <PostVoteCompact
            postId={post.id}
            initialScore={post.score}
            initialUserVote={post.viewerVote ?? null}
          />
        ) : (
          <span className="rounded-full border border-black/10 dark:border-white/10 px-2.5 py-1 text-xs text-black/50 dark:text-white/50">
            {post.score} votos
          </span>
        )}

        <Link
          href={`/posts/${post.id}#comentarios`}
          className="flex items-center gap-1 rounded-full border border-black/15 dark:border-white/20 px-2.5 py-1 text-xs text-black/50 dark:text-white/50 hover:border-accent hover:text-accent"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {post._count.comments}
        </Link>

        <SharePostButton postId={post.id} title={post.title} />

        {currentUserId && primaryTag && (
          <FollowTagButton
            tagId={primaryTag.id}
            tagName={primaryTag.name}
            initialFollowing={post.primaryTagFollowed ?? false}
          />
        )}

        {currentUserId && currentUserId !== post.author.id && (
          <ReportPostButton postId={post.id} />
        )}
      </div>
    </li>
  );
}
