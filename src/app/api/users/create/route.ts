// app/api/users/create/route.ts
import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "@/db/drizzle"
import { users } from "@/db/schema"
import { userSchema } from "@/lib/schemas"

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) return new Response("Unauthorized", { status: 401 })

    const user = await currentUser()
    if (!user) return new Response("User not found", { status: 404 })

    const userData = {
      clerkId: userId,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: 'user' as const,
    }

    // Validate user data
    const validatedUser = userSchema.parse(userData)

    // Insert or update user
    await db
      .insert(users)
      .values(validatedUser)
      .onConflictDoUpdate({
        target: users.clerkId,
        set: {
          email: validatedUser.email,
          firstName: validatedUser.firstName,
          lastName: validatedUser.lastName,
          updatedAt: new Date(),
        },
      })

    return new Response("User created/updated successfully", { status: 200 })
  } catch (error) {
    console.error("Error creating user:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
