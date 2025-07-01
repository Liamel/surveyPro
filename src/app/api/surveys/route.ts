import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { surveys, users } from "@/db/schema";
import { createSurveySchema } from "@/lib/schemas";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = createSurveySchema.parse(body);

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Create survey
    const [newSurvey] = await db
      .insert(surveys)
      .values({
        ...validatedData,
        createdBy: user.id,
      })
      .returning();

    return Response.json(newSurvey);
  } catch (error) {
    console.error("Error creating survey:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    let allSurveys;
    if (isActive !== null) {
      allSurveys = await db
        .select()
        .from(surveys)
        .where(eq(surveys.isActive, isActive === "true"));
    } else {
      allSurveys = await db.select().from(surveys);
    }

    // For now, return basic survey data
    // TODO: Add question counts and response counts with proper joins
    return Response.json(allSurveys);
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return new Response("Internal server error", { status: 500 });
  }
} 