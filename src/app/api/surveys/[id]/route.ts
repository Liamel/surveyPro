import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { surveys, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { 
  getSurveyByIdCached,
  revalidateSurvey,
  CACHE_TAGS 
} from "@/lib/cache";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Use cached query for better performance
    const survey = await getSurveyByIdCached(id)();

    if (!survey) {
      return new Response("Survey not found", { status: 404 });
    }

    // Return response with cache headers
    const response = Response.json(survey);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('X-Cache-Tags', CACHE_TAGS.SURVEY(id));
    
    return response;
  } catch (error) {
    console.error("Error fetching survey:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Update survey
    const [updatedSurvey] = await db
      .update(surveys)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(surveys.id, id))
      .returning();

    if (!updatedSurvey) {
      return new Response("Survey not found", { status: 404 });
    }

    // Revalidate related cache tags
    revalidateSurvey(id);

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

    const { id } = params;

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Delete survey
    const [deletedSurvey] = await db
      .delete(surveys)
      .where(eq(surveys.id, id))
      .returning();

    if (!deletedSurvey) {
      return new Response("Survey not found", { status: 404 });
    }

    // Revalidate related cache tags
    revalidateSurvey(id);

    return Response.json({ message: "Survey deleted successfully" });
  } catch (error) {
    console.error("Error deleting survey:", error);
    return new Response("Internal server error", { status: 500 });
  }
} 