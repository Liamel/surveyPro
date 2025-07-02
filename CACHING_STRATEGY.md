# Modern Caching Strategy with Next.js and Drizzle

This document outlines the modern caching strategy implemented in SurveyPro using Next.js App Router, Drizzle ORM, and cache tags for optimal performance, freshness, and control.

## Overview

The caching strategy combines multiple approaches to provide:
- **Performance**: Fast data access with intelligent caching
- **Freshness**: Automatic cache invalidation when data changes
- **Control**: Granular cache management with tags
- **Scalability**: Efficient database queries with proper indexing

## Architecture

### 1. Cache Tags System

We use Next.js cache tags to organize and manage cached data:

```typescript
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
```

### 2. Cache Durations

Different data types have different cache durations based on their update frequency:

```typescript
export const CACHE_DURATIONS = {
  SHORT: 60,      // 1 minute - for frequently changing data
  MEDIUM: 300,    // 5 minutes - for moderately changing data
  LONG: 3600,     // 1 hour - for rarely changing data
  VERY_LONG: 86400, // 24 hours - for static data
} as const;
```

### 3. Cached Database Queries

We use `unstable_cache` to cache database queries with appropriate tags:

```typescript
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
```

## Implementation

### Server-Side Caching

#### 1. Route Handlers with Cache Tags

```typescript
// /api/surveys/route.ts
export async function GET(request: Request) {
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

  const response = Response.json(surveysData);
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  
  return response;
}
```

#### 2. Cache Invalidation on Data Changes

```typescript
export async function POST(request: Request) {
  // ... create survey logic ...
  
  // Revalidate related cache tags
  revalidateSurveys();
  
  return Response.json(newSurvey);
}
```

### Client-Side Caching

#### 1. API Client with Cache Tags

```typescript
// /lib/api.ts
export class ApiClient {
  async fetch<T>(
    endpoint: string,
    tags: string[],
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      next: {
        tags,
        revalidate: CACHE_DURATIONS.MEDIUM,
      },
    });
    
    return response.json();
  }
}
```

#### 2. Using the API Client

```typescript
// In components
const surveys = await surveysApi.getActive(); // Uses cache tags automatically
```

## Benefits

### 1. Performance
- **Reduced Database Load**: Queries are cached and reused
- **Faster Response Times**: Cached data is served instantly
- **Efficient Network Usage**: Fewer API calls to the server

### 2. Freshness
- **Automatic Invalidation**: Cache is cleared when data changes
- **Granular Control**: Only related cache entries are invalidated
- **Stale-While-Revalidate**: Users see cached data while fresh data loads

### 3. Control
- **Tag-Based Management**: Precise control over what gets cached
- **Duration Control**: Different cache times for different data types
- **Manual Invalidation**: Ability to clear specific cache entries

### 4. Scalability
- **Horizontal Scaling**: Cache works across multiple server instances
- **Memory Efficiency**: Only necessary data is cached
- **Database Optimization**: Reduced query load on the database

## Best Practices

### 1. Cache Tag Naming
- Use descriptive, hierarchical names
- Include entity IDs for specific items
- Group related data with similar tag patterns

### 2. Cache Duration Selection
- **Short (1 min)**: Frequently changing data (responses, active surveys)
- **Medium (5 min)**: Moderately changing data (surveys, questions)
- **Long (1 hour)**: Rarely changing data (user profiles)
- **Very Long (24 hours)**: Static data (configuration, metadata)

### 3. Cache Invalidation
- Always invalidate related tags when data changes
- Use specific tags rather than broad ones when possible
- Consider the impact of cache invalidation on performance

### 4. Error Handling
- Implement fallbacks when cache fails
- Log cache misses for optimization
- Handle cache invalidation errors gracefully

## Monitoring and Debugging

### 1. Cache Headers
Response headers include cache information:
```
Cache-Control: public, s-maxage=300, stale-while-revalidate=600
X-Cache-Tags: surveys,active-surveys
```

### 2. Cache Misses
Monitor cache hit rates and adjust durations accordingly.

### 3. Performance Metrics
Track response times and database query counts to measure cache effectiveness.

## Future Enhancements

1. **Redis Integration**: For distributed caching across multiple servers
2. **Cache Warming**: Pre-populate cache with frequently accessed data
3. **Adaptive Caching**: Adjust cache durations based on usage patterns
4. **Cache Analytics**: Detailed metrics on cache performance

## Conclusion

This caching strategy provides a robust foundation for high-performance applications while maintaining data freshness and giving developers fine-grained control over the caching behavior. The combination of Next.js cache tags, Drizzle ORM, and intelligent cache invalidation creates a scalable and maintainable solution. 