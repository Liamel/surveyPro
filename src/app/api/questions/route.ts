import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { questions, surveys, users } from "@/db/schema";
import { createQuestionSchema } from "@/lib/schemas";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = createQuestionSchema.parse(body);

    // Verify user owns the survey
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const [survey] = await db
      .select()
      .from(surveys)
      .where(eq(surveys.id, validatedData.surveyId))
      .limit(1);

    if (!survey || survey.createdBy !== user.id) {
      return new Response("Survey not found or access denied", { status: 404 });
    }

    // Create question
    const [newQuestion] = await db
      .insert(questions)
      .values(validatedData)
      .returning();

    revalidateSurveyQuestions(validatedData.surveyId);

    return Response.json(newQuestion);
  } catch (error) {
    console.error("Error creating question:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

import { getSurveyQuestionsCached, revalidateSurveyQuestions, CACHE_TAGS } from "@/lib/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get("surveyId");

    if (!surveyId) {
      return new Response("Survey ID is required", { status: 400 });
    }

    const surveyQuestions = await getSurveyQuestionsCached(surveyId)();

    const response = Response.json(surveyQuestions);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('X-Cache-Tags', CACHE_TAGS.QUESTIONS(surveyId));
    
    return response;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return new Response("Internal server error", { status: 500 });
  }
} 