import Link from "next/link";
import { FileText, Video, Pin, CheckCircle2, Flame, MessageSquare, HelpCircle, Music } from "lucide-react";
import Avatar from "@/components/Avatar";
import UserBadges from "@/components/UserBadges";
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
  sponsored?: boolean;
  sponsorName?: string | null;
  sponsorUrl?: string | null;
  bestAnswerId: string | null;
  createdAt: Date | string;
  score: number;
  viewerVote?: "UP" | "DOWN" | null;
  primaryTagFollowed?: boolean;
  isQuestion?: boolean;
  questionStatus?: "unanswered" | "answered" | "resolved";
  directedTo?: { id: string; name: string } | null;
  feedbackRequest?: boolean;
  feedbackFocus?: string | null;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role?: string;
    verificationStatus?: string | null;
    isAmbassador?: boolean;
  };
  tags: { tag: { id: string; name: string } }[];
  _count: { comments: number };
};

export default function PostListItem({
  post,
  className = "",
  currentUserId,
  isMostPopular = false,
}: {
  post: PostListItemData;
  className?: string;
  currentUserId?: string;
  isMostPopular?: boolean;
}) {
  const Icon = TYPE_ICON[post.type];
  const createdAt =
    post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt);
  // "Mais popular" tem prioridade sobre "Em alta" (é um sinal mais forte).
  const trending =
    !isMostPopular &&
    isTrending({
      score: post.score,
      createdAt,
      commentCount: post._count.comments,
    });
  const primaryTag = post.tags[0]?.tag;
  const ambassadorAuthor = Boolean(post.author.isAmbassador);

  const hasBadges =
    post.sponsored ||
    isMostPopular ||
    trending ||
    post.isQuestion ||
    post.questionStatus ||
    post.feedbackRequest ||
    (post.bestAnswerId && !post.questionStatus);

  return (
    <li
      className={`rounded-lg border p-4 transition-colors flex flex-col gap-1 ${
        isMostPopular
          ? "border-orange-500/40 bg-gradient-to-br from-orange-500/[0.07] to-transparent hover:border-orange-500/60"
          : trending
          ? "border-orange-500/30 bg-orange-500/5 hover:border-orange-500/60"
          : "border-black/10 dark:border-white/10 hover:border-accent/60"
      } ${
        post.sponsored ? "border-amber-500/40 bg-amber-500/[0.04]" : ""
      } ${
        ambassadorAuthor && !trending && !isMostPopular && !post.sponsored
          ? "border-l-2 border-l-fuchsia-500/60"
          : ""
      } ${className}`}
    >
      {hasBadges && (
        <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
          {post.sponsored && (
            <span className="flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              Patrocinado{post.sponsorName ? ` · ${post.sponsorName}` : ""}
            </span>
          )}
          {isMostPopular && (
            <span className="flex items-center gap-1 rounded-full border border-orange-500/40 bg-orange-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-orange-600 dark:text-orange-400">
              <Flame className="h-3 w-3" />
              Mais popular
            </span>
          )}
          {trending && (
            <span className="flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
              <Flame className="h-3 w-3" />
              Em alta
            </span>
          )}
          {post.isQuestion && (
            <span className="flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
              <HelpCircle className="h-3 w-3" />
              Dúvida
            </span>
          )}
          {post.questionStatus === "unanswered" && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              Por responder
            </span>
          )}
          {post.questionStatus === "answered" && (
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
              Respondida por verificado
            </span>
          )}
          {post.questionStatus === "resolved" && (
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Resolvida
            </span>
          )}
          {post.feedbackRequest && (
            <span className="flex items-center gap-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-fuchsia-600 dark:text-fuchsia-400">
              <Music className="h-3 w-3" />
              Pedido de feedback
            </span>
          )}
          {post.bestAnswerId && !post.questionStatus && (
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Resolvido
            </span>
          )}
        </div>
      )}
      <Link
        href={`/posts/${post.id}`}
        className={`flex items-center gap-2 font-medium ${
          isMostPopular ? "text-[15px] font-semibold" : ""
        }`}
      >
        <Icon className="h-4 w-4 text-accent shrink-0" />
        {post.title}
        {post.pinned && <Pin className="h-3.5 w-3.5 text-accent shrink-0" />}
      </Link>
      <span className="flex flex-wrap items-center gap-1.5 text-xs text-black/50 dark:text-white/50">
        <Avatar name={post.author.name} avatarUrl={post.author.avatarUrl} size={16} />
        por{" "}
        <Link href={`/perfil/${post.author.id}`} className="hover:text-accent hover:underline">
          {post.author.name}
        </Link>
        {post.author.role && <UserBadges user={post.author} />}{" "}
        · {formatRelativeTime(createdAt)}
        {post.directedTo && (
          <>
            {" "}
            · dirigida a{" "}
            <Link
              href={`/perfil/${post.directedTo.id}`}
              className="font-medium hover:text-accent hover:underline"
            >
              {post.directedTo.name}
            </Link>
          </>
        )}
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

      {post.feedbackRequest && post.feedbackFocus && (
        <p className="mt-1 rounded-md bg-fuchsia-500/10 px-3 py-1.5 text-sm text-fuchsia-700 dark:text-fuchsia-300">
          <span className="font-medium">Feedback pedido:</span> {post.feedbackFocus}
        </p>
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
