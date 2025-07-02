import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { surveyResponses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateSurveyResponses } from "@/lib/cache";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { isCompleted, completedAt } = body;

    const [updatedResponse] = await db
      .update(surveyResponses)
      .set({
        isCompleted,
        completedAt: completedAt ? new Date(completedAt) : null,
      })
      .where(eq(surveyResponses.id, (await params).id))
      .returning();

    if (!updatedResponse) {
      return new Response("Survey response not found", { status: 404 });
    }

    // Revalidate related cache tags
    revalidateSurveyResponses(updatedResponse.surveyId);

    return Response.json(updatedResponse);
  } catch (error) {
    console.error("Error updating survey response:", error);
    return new Response("Internal server error", { status: 500 });
  }
} 