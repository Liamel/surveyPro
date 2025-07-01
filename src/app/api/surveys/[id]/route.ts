import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { surveys, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const survey = await db
      .select()
      .from(surveys)
      .where(eq(surveys.id, params.id))
      .limit(1);

    if (!survey.length) {
      return new Response("Survey not found", { status: 404 });
    }

    return Response.json(survey[0]);
  } catch (error) {
    console.error("Error fetching survey:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const body = await request.json();
    const { isActive } = body;

    // Check if survey exists and belongs to user
    const [existingSurvey] = await db
      .select()
      .from(surveys)
      .where(eq(surveys.id, params.id))
      .limit(1);

    if (!existingSurvey) {
      return new Response("Survey not found", { status: 404 });
    }

    if (existingSurvey.createdBy !== user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    // Update survey
    const [updatedSurvey] = await db
      .update(surveys)
      .set({ 
        isActive,
        updatedAt: new Date()
      })
      .where(eq(surveys.id, params.id))
      .returning();

    return Response.json(updatedSurvey);
  } catch (error) {
    console.error("Error updating survey:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Check if survey exists and belongs to user
    const [existingSurvey] = await db
      .select()
      .from(surveys)
      .where(eq(surveys.id, params.id))
      .limit(1);

    if (!existingSurvey) {
      return new Response("Survey not found", { status: 404 });
    }

    if (existingSurvey.createdBy !== user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    // Delete survey (this will cascade to questions and responses)
    await db
      .delete(surveys)
      .where(eq(surveys.id, params.id));

    return new Response("Survey deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting survey:", error);
    return new Response("Internal server error", { status: 500 });
  }
} 