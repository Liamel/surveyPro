import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { surveys, users } from "@/db/schema";
import { createSurveySchema } from "@/lib/schemas";
import { eq } from "drizzle-orm";
import { cache } from "react";

// Cache the surveys query
const getSurveys = cache(async (isActive?: string | null) => {
  if (isActive !== null) {
    return await db
      .select()
      .from(surveys)
      .where(eq(surveys.isActive, isActive === "true"));
  } else {
    return await db.select().from(surveys);
  }
});

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

    const allSurveys = await getSurveys(isActive);

    // Add caching headers for better performance
    const response = Response.json(allSurveys);
    response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');
    
    return response;
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return new Response("Internal server error", { status: 500 });
  }
} 