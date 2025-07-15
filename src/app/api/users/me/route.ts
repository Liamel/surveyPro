import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new Response("User not found", { status: 404 });
    }

    return Response.json({
      id: currentUser.id,
      email: currentUser.email,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      role: currentUser.role,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return new Response("Internal server error", { status: 500 });
  }
} 