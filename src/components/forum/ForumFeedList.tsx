"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import AdSlot from "@/components/AdSlot";
import PostListItem, { type PostListItemData } from "@/components/forum/PostListItem";
import type { TagCategory } from "@prisma/client";
import type { SortOption } from "@/lib/forumSort";

const FEED_AD_AFTER = 4;

export default function ForumFeedList({
  initialPosts,
  initialHasMore,
  pageSize,
  tag,
  q,
  category,
  sort,
  adSlot,
}: {
  initialPosts: PostListItemData[];
  initialHasMore: boolean;
  pageSize: number;
  tag?: string;
  q?: string;
  category?: TagCategory;
  sort: SortOption;
  adSlot?: string;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);
    params.set("skip", String(posts.length));
    params.set("take", String(pageSize));
    try {
      const res = await fetch(`/api/forum/feed?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => [...prev, ...data.posts]);
        setHasMore(data.hasMore);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, posts.length, tag, q, category, sort, pageSize]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "300px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <ul className="flex flex-col gap-3">
        {posts.length === 0 && (
          <p className="text-black/50 dark:text-white/50">
            Ainda não há posts. Sê o primeiro a partilhar algo!
          </p>
        )}
        {posts.map((post, index) => (
          <Fragment key={post.id}>
            <PostListItem
              post={post}
              className={index >= initialPosts.length ? "animate-feed-item" : ""}
            />
            {index === FEED_AD_AFTER - 1 && (
              <li>
                <AdSlot slot={adSlot} />
              </li>
            )}
          </Fragment>
        ))}
      </ul>
      {hasMore && (
        <div ref={sentinelRef} className="flex w-full items-center justify-center py-6">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 animate-bounce rounded-full bg-accent/70 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-accent/70 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-accent/70" />
          </div>
        </div>
      )}
    </>
  );
}
