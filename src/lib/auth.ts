import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

export async function isModerator() {
  const user = await getCurrentUser();
  return user?.role === 'moderator';
}

export async function isModeratorOrAdmin() {
  const user = await getCurrentUser();
  return user?.role === 'moderator' || user?.role === 'admin';
}

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error("Admin access required");
  }
  return user;
}

export async function requireModeratorOrAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'moderator' && user.role !== 'admin')) {
    throw new Error("Moderator or admin access required");
  }
  return user;
} 