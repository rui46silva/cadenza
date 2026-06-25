import { BadgeCheck, MessageSquarePlus, Medal, Sparkles } from "lucide-react";

export type Badge = {
  id: string;
  label: string;
  icon: typeof BadgeCheck;
};

export function getUserBadges(stats: {
  postCount: number;
  commentCount: number;
  verificationStatus: string | null;
  createdAt: Date;
}): Badge[] {
  const badges: Badge[] = [];

  if (stats.postCount >= 1) {
    badges.push({ id: "first-post", label: "Primeiro post", icon: Sparkles });
  }
  if (stats.postCount >= 10) {
    badges.push({ id: "active-poster", label: "Membro ativo", icon: MessageSquarePlus });
  }
  if (stats.commentCount >= 25) {
    badges.push({ id: "helper", label: "Colaborador", icon: Medal });
  }
  if (stats.verificationStatus === "APPROVED") {
    badges.push({ id: "verified", label: "Verificado", icon: BadgeCheck });
  }

  return badges;
}
