import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { surveys, users } from "@/db/schema";
import { createSurveySchema } from "@/lib/schemas";
import { eq } from "drizzle-orm";
import { 
  getSurveysCached, 
  getActiveSurveysCached, 
  getInactiveSurveysCached,
  revalidateSurveys,
  CACHE_TAGS 
} from "@/lib/cache";

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

    // Revalidate related cache tags
    revalidateSurveys();

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

    let surveysData;

    // Use appropriate cached query based on filter
    if (isActive === "true") {
      surveysData = await getActiveSurveysCached();
    } else if (isActive === "false") {
      surveysData = await getInactiveSurveysCached();
    } else {
      surveysData = await getSurveysCached();
    }

    // Return response with cache headers
    const response = Response.json(surveysData);
    
    // Set appropriate cache headers based on the query
    const cacheTags = isActive === "true" 
      ? [CACHE_TAGS.ACTIVE_SURVEYS]
      : isActive === "false"
      ? [CACHE_TAGS.INACTIVE_SURVEYS]
      : [CACHE_TAGS.SURVEYS];

    // Add cache control headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('X-Cache-Tags', cacheTags.join(','));
    
    return response;
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return new Response("Internal server error", { status: 500 });
  }
} 