const TRENDING_WINDOW_HOURS = 24 * 7;
const TRENDING_MIN_ENGAGEMENT = 5;

export function isTrending(post: {
  score: number;
  createdAt: Date | string;
  commentCount: number;
}): boolean {
  const createdAt =
    post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt);
  const ageHours = (Date.now() - createdAt.getTime()) / (60 * 60 * 1000);
  if (ageHours > TRENDING_WINDOW_HOURS) return false;
  return post.score + post.commentCount >= TRENDING_MIN_ENGAGEMENT;
}
