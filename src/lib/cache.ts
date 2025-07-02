import { revalidateTag, unstable_cache } from 'next/cache';
import { db } from '@/db/drizzle';
import { surveys, users, questions, surveyResponses } from '@/db/schema';
import { eq, desc, asc } from 'drizzle-orm';

// Cache tags for different data types
export const CACHE_TAGS = {
  SURVEYS: 'surveys',
  SURVEY: (id: string) => `survey-${id}`,
  USER_SURVEYS: (userId: string) => `user-surveys-${userId}`,
  ACTIVE_SURVEYS: 'active-surveys',
  INACTIVE_SURVEYS: 'inactive-surveys',
  QUESTIONS: (surveyId: string) => `questions-${surveyId}`,
  SURVEY_RESPONSES: (surveyId: string) => `survey-responses-${surveyId}`,
  USER: (userId: string) => `user-${userId}`,
} as const;

// Cache duration constants
export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Generic cache wrapper for database queries
export function createCachedQuery<T>(
  queryFn: () => Promise<T>,
  tags: string[],
  duration: number = CACHE_DURATIONS.MEDIUM
) {
  return unstable_cache(
    queryFn,
    tags,
    {
      revalidate: duration,
      tags,
    }
  );
}

// Survey queries with caching
export const getSurveysCached = createCachedQuery(
  async () => {
    return await db
      .select()
      .from(surveys)
      .orderBy(desc(surveys.createdAt));
  },
  [CACHE_TAGS.SURVEYS],
  CACHE_DURATIONS.MEDIUM
);

export const getActiveSurveysCached = createCachedQuery(
  async () => {
    return await db
      .select()
      .from(surveys)
      .where(eq(surveys.isActive, true))
      .orderBy(desc(surveys.createdAt));
  },
  [CACHE_TAGS.ACTIVE_SURVEYS],
  CACHE_DURATIONS.SHORT
);

export const getInactiveSurveysCached = createCachedQuery(
  async () => {
    return await db
      .select()
      .from(surveys)
      .where(eq(surveys.isActive, false))
      .orderBy(desc(surveys.createdAt));
  },
  [CACHE_TAGS.INACTIVE_SURVEYS],
  CACHE_DURATIONS.MEDIUM
);

export const getSurveyByIdCached = (id: string) => createCachedQuery(
  async () => {
    const [survey] = await db
      .select()
      .from(surveys)
      .where(eq(surveys.id, id))
      .limit(1);
    return survey;
  },
  [CACHE_TAGS.SURVEY(id)],
  CACHE_DURATIONS.MEDIUM
);

export const getUserSurveysCached = (userId: string) => createCachedQuery(
  async () => {
    return await db
      .select()
      .from(surveys)
      .where(eq(surveys.createdBy, userId))
      .orderBy(desc(surveys.createdAt));
  },
  [CACHE_TAGS.USER_SURVEYS(userId)],
  CACHE_DURATIONS.MEDIUM
);

// Question queries with caching
export const getSurveyQuestionsCached = (surveyId: string) => createCachedQuery(
  async () => {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.surveyId, surveyId))
      .orderBy(asc(questions.orderIndex));
  },
  [CACHE_TAGS.QUESTIONS(surveyId)],
  CACHE_DURATIONS.MEDIUM
);

// User queries with caching
export const getUserByIdCached = (userId: string) => createCachedQuery(
  async () => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user;
  },
  [CACHE_TAGS.USER(userId)],
  CACHE_DURATIONS.LONG
);

export const getUserByClerkIdCached = (clerkId: string) => createCachedQuery(
  async () => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
    return user;
  },
  [CACHE_TAGS.USER(clerkId)],
  CACHE_DURATIONS.LONG
);

// Survey responses queries with caching
export const getSurveyResponsesCached = (surveyId: string) => createCachedQuery(
  async () => {
    return await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, surveyId))
      .orderBy(desc(surveyResponses.startedAt));
  },
  [CACHE_TAGS.SURVEY_RESPONSES(surveyId)],
  CACHE_DURATIONS.SHORT
);

// Revalidation functions
export function revalidateSurveys() {
  revalidateTag(CACHE_TAGS.SURVEYS);
  revalidateTag(CACHE_TAGS.ACTIVE_SURVEYS);
  revalidateTag(CACHE_TAGS.INACTIVE_SURVEYS);
}

export function revalidateSurvey(id: string) {
  revalidateTag(CACHE_TAGS.SURVEY(id));
  revalidateTag(CACHE_TAGS.SURVEYS);
  revalidateTag(CACHE_TAGS.ACTIVE_SURVEYS);
  revalidateTag(CACHE_TAGS.INACTIVE_SURVEYS);
}

export function revalidateUserSurveys(userId: string) {
  revalidateTag(CACHE_TAGS.USER_SURVEYS(userId));
  revalidateTag(CACHE_TAGS.SURVEYS);
}

export function revalidateSurveyQuestions(surveyId: string) {
  revalidateTag(CACHE_TAGS.QUESTIONS(surveyId));
}

export function revalidateSurveyResponses(surveyId: string) {
  revalidateTag(CACHE_TAGS.SURVEY_RESPONSES(surveyId));
}

export function revalidateUser(userId: string) {
  revalidateTag(CACHE_TAGS.USER(userId));
}

// Helper function to fetch data with cache tags
export async function fetchWithCache<T>(
  url: string,
  tags: string[],
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    next: {
      tags,
      revalidate: CACHE_DURATIONS.MEDIUM,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
} 