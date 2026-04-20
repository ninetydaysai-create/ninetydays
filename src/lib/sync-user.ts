import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * Ensures a Clerk user exists in the local DB before any FK write.
 *
 * The Clerk webhook (user.created) is the primary sync path, but it
 * occasionally fails silently — race conditions, missed deliveries,
 * webhook misconfiguration during early setup. This is the fallback.
 *
 * Only hits Clerk API when the user row is genuinely missing.
 * Idempotent — safe to call on every authenticated request.
 */
export async function syncUser(userId: string): Promise<void> {
  const existing = await db.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (existing) return;

  // Row missing — fetch from Clerk and create it
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  await db.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
      avatarUrl: clerkUser.imageUrl ?? null,
    },
    update: {}, // Never overwrite — webhook owns updates
  });
}
