import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { surveyResponses, surveys, users } from "@/db/schema";
import { createSurveyResponseSchema } from "@/lib/schemas";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = createSurveyResponseSchema.parse(body);

    // Verify survey exists and is active
    const [survey] = await db
      .select()
      .from(surveys)
      .where(eq(surveys.id, validatedData.surveyId))
      .limit(1);

    if (!survey || !survey.isActive) {
      return new Response("Survey not found or inactive", { status: 404 });
    }

    // Get user if provided
    let respondentId = null;
    if (validatedData.respondentId) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, validatedData.respondentId))
        .limit(1);
      
      if (user) {
        respondentId = user.id;
      }
    }

    // Create survey response
    const [newResponse] = await db
      .insert(surveyResponses)
      .values({
        surveyId: validatedData.surveyId,
        respondentId,
      })
      .returning();

    return Response.json(newResponse);
  } catch (error) {
    console.error("Error creating survey response:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get("surveyId");
    const isCompleted = searchParams.get("isCompleted");

    if (!surveyId) {
      return new Response("Survey ID is required", { status: 400 });
    }

    let responses;
    if (isCompleted !== null) {
      responses = await db
        .select()
        .from(surveyResponses)
        .where(and(
          eq(surveyResponses.surveyId, surveyId),
          eq(surveyResponses.isCompleted, isCompleted === "true")
        ));
    } else {
      responses = await db
        .select()
        .from(surveyResponses)
        .where(eq(surveyResponses.surveyId, surveyId));
    }

    return Response.json(responses);
  } catch (error) {
    console.error("Error fetching survey responses:", error);
    return new Response("Internal server error", { status: 500 });
  }
} 