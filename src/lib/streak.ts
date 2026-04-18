import { db } from "@/lib/db";

export async function getUserStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  todayDone: boolean;
  lastActivityAt: Date | null;
}> {
  const logs = await db.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (!logs.length) {
    return { currentStreak: 0, longestStreak: 0, todayDone: false, lastActivityAt: null };
  }

  const lastActivityAt = logs[0].createdAt;

  // Deduplicate into unique UTC date strings, sorted newest-first
  const uniqueDays = [
    ...new Set(logs.map((l) => new Date(l.createdAt).toDateString())),
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const todayStr = new Date().toDateString();
  const yesterdayStr = new Date(Date.now() - 86_400_000).toDateString();

  const todayDone = uniqueDays[0] === todayStr;

  // Current streak: start from today (or yesterday if today has no activity yet)
  let currentStreak = 0;
  if (uniqueDays[0] === todayStr || uniqueDays[0] === yesterdayStr) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const prev = new Date(uniqueDays[i - 1]);
      const curr = new Date(uniqueDays[i]);
      const diffDays = Math.round(
        (prev.getTime() - curr.getTime()) / 86_400_000
      );
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Longest streak: scan entire history
  let longestStreak = 0;
  let runLength = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffDays = Math.round(
      (prev.getTime() - curr.getTime()) / 86_400_000
    );
    if (diffDays === 1) {
      runLength++;
    } else {
      longestStreak = Math.max(longestStreak, runLength);
      runLength = 1;
    }
  }
  longestStreak = Math.max(longestStreak, runLength);

  return { currentStreak, longestStreak, todayDone, lastActivityAt };
}
