import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check if current user is admin
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return new Response("Admin access required", { status: 403 });
    }

    // Get all users
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    return Response.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response("Internal server error", { status: 500 });
  }
} 