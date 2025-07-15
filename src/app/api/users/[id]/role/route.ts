import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const updateRoleSchema = z.object({
  role: z.enum(['user', 'moderator', 'admin']),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json();
    const validatedData = updateRoleSchema.parse(body);

    // Update user role
    const [updatedUser] = await db
      .update(users)
      .set({
        role: validatedData.role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, params.id))
      .returning();

    if (!updatedUser) {
      return new Response("User not found", { status: 404 });
    }

    return Response.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    return new Response("Internal server error", { status: 500 });
  }
} 