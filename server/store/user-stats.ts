export interface UserStatsRecord {
  posts: number;
  followers: number;
  following: number;
  starsReceived: number;
}

const userStats: Record<string, UserStatsRecord> = {};
const followersByUser = new Map<string, Set<string>>();
const followingByUser = new Map<string, Set<string>>();

export function ensureUserStats(userId: string): UserStatsRecord {
  if (!userStats[userId]) {
    userStats[userId] = {
      posts: 0,
      followers: 0,
      following: 0,
      starsReceived: 0,
    };
  }
  return userStats[userId];
}

export function getUserStats(userId: string): UserStatsRecord {
  const stats = ensureUserStats(userId);
  stats.followers = followersByUser.get(userId)?.size ?? 0;
  stats.following = followingByUser.get(userId)?.size ?? 0;
  return { ...stats };
}

export function incrementUserPosts(userId: string) {
  ensureUserStats(userId).posts += 1;
}

export function addStarsReceived(userId: string, amount: number) {
  ensureUserStats(userId).starsReceived += amount;
}

/** Учёт поддержки авторов — не раздуваем «подписчиков» */
export function recordStarSupport(_fromUserId: string, _toUserId: string) {
  /* зарезервировано под будущую систему подписок */
}

export function updateUserStats(
  userId: string,
  patch: Partial<UserStatsRecord>,
): UserStatsRecord {
  const stats = ensureUserStats(userId);
  if (patch.posts !== undefined) stats.posts = patch.posts;
  if (patch.followers !== undefined) stats.followers = patch.followers;
  if (patch.following !== undefined) stats.following = patch.following;
  if (patch.starsReceived !== undefined) stats.starsReceived = patch.starsReceived;
  return getUserStats(userId);
}

export function deleteUserStats(userId: string) {
  delete userStats[userId];
  followersByUser.delete(userId);
  followingByUser.delete(userId);
}
