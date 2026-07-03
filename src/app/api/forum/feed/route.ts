import { NextResponse } from "next/server";
import { getForumFeed } from "@/lib/forumFeed";
import { SORT_OPTIONS, type SortOption } from "@/lib/forumSort";
import { isTagCategory } from "@/lib/tagCategories";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const categoryParam = searchParams.get("category");
  const category = categoryParam && isTagCategory(categoryParam) ? categoryParam : undefined;
  const sortParam = searchParams.get("sort");
  const sort: SortOption = (SORT_OPTIONS as readonly string[]).includes(sortParam ?? "")
    ? (sortParam as SortOption)
    : "recentes";
  const skip = Number(searchParams.get("skip") ?? "0") || 0;
  const take = Number(searchParams.get("take") ?? "10") || 10;

  const session = await auth();
  const followingUserId = searchParams.get("following") === "1" ? session?.user?.id : undefined;

  const { posts, hasMore } = await getForumFeed({
    tag,
    q,
    category,
    sort,
    followingUserId,
    viewerId: session?.user?.id,
    skip,
    take,
  });

  return NextResponse.json({ posts, hasMore });
}
