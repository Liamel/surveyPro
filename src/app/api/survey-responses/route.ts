import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { surveyResponses, surveys, users } from "@/db/schema";
import { createSurveyResponseSchema } from "@/lib/schemas";
import { eq } from "drizzle-orm";

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

    // Revalidate related cache tags
    revalidateSurveyResponses(validatedData.surveyId);

    return Response.json(newResponse);
  } catch (error) {
    console.error("Error creating survey response:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

import { getSurveyResponsesCached, revalidateSurveyResponses, CACHE_TAGS } from "@/lib/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get("surveyId");
    const isCompleted = searchParams.get("isCompleted");

    if (!surveyId) {
      return new Response("Survey ID is required", { status: 400 });
    }

    // For now, we'll use the cached function for all responses
    // TODO: Add separate cached functions for completed/incomplete responses if needed
    const responses = await getSurveyResponsesCached(surveyId)();

    // Filter by completion status if specified
    let filteredResponses = responses;
    if (isCompleted !== null) {
      filteredResponses = responses.filter(response => 
        response.isCompleted === (isCompleted === "true")
      );
    }

    const response = Response.json(filteredResponses);
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    response.headers.set('X-Cache-Tags', CACHE_TAGS.SURVEY_RESPONSES(surveyId));
    
    return response;
  } catch (error) {
    console.error("Error fetching survey responses:", error);
    return new Response("Internal server error", { status: 500 });
  }
} 