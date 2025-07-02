import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { questionResponses, surveyResponses, questions } from "@/db/schema";
import { submitQuestionResponseSchema } from "@/lib/schemas";
import { eq, and } from "drizzle-orm";
import { revalidateSurveyResponses } from "@/lib/cache";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = submitQuestionResponseSchema.parse(body);

    // Verify survey response exists
    const [surveyResponse] = await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.id, validatedData.surveyResponseId))
      .limit(1);

    if (!surveyResponse) {
      return new Response("Survey response not found", { status: 404 });
    }

    // Verify question exists and belongs to the survey
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, validatedData.questionId))
      .limit(1);

    if (!question || question.surveyId !== surveyResponse.surveyId) {
      return new Response("Question not found or invalid", { status: 404 });
    }

    const [existingResponse] = await db
      .select()
      .from(questionResponses)
      .where(and(
        eq(questionResponses.surveyResponseId, validatedData.surveyResponseId),
        eq(questionResponses.questionId, validatedData.questionId)
      ))
      .limit(1);

    let result;
    if (existingResponse) {
      [result] = await db
        .update(questionResponses)
        .set({
          answer: validatedData.answer,
          answeredAt: new Date(),
        })
        .where(eq(questionResponses.id, existingResponse.id))
        .returning();
    } else {
      // Create new response
      [result] = await db
        .insert(questionResponses)
        .values({
          surveyResponseId: validatedData.surveyResponseId,
          questionId: validatedData.questionId,
          answer: validatedData.answer,
        })
        .returning();
    }

    revalidateSurveyResponses(surveyResponse.surveyId);

    return Response.json(result);
  } catch (error) {
    console.error("Error submitting question response:", error);
    return new Response("Internal server error", { status: 500 });
  }
} 