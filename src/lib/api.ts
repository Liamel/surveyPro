import { CACHE_TAGS, CACHE_DURATIONS } from './cache';
import { CreateSurvey, UpdateSurvey } from './schemas';

// Base API URL
const API_BASE = '/api';

// Generic API client with cache tags
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  // Generic fetch method with cache tags
  async fetch<T>(
    endpoint: string,
    tags: string[],
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
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

  // Survey methods
  async getSurveys(isActive?: boolean) {
    const endpoint = isActive !== undefined 
      ? `/surveys?isActive=${isActive}`
      : '/surveys';
    
    const tags = isActive === true 
      ? [CACHE_TAGS.ACTIVE_SURVEYS]
      : isActive === false
      ? [CACHE_TAGS.INACTIVE_SURVEYS]
      : [CACHE_TAGS.SURVEYS];

    return this.fetch(endpoint, tags);
  }

  async getSurvey(id: string) {
    return this.fetch(`/surveys/${id}`, [CACHE_TAGS.SURVEY(id)]);
  }

  async getUserSurveys(userId: string) {
    return this.fetch(`/surveys?userId=${userId}`, [CACHE_TAGS.USER_SURVEYS(userId)]);
  }

  async createSurvey(data: CreateSurvey) {
    const response = await fetch(`${this.baseUrl}/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async updateSurvey(id: string, data: UpdateSurvey) {
    const response = await fetch(`${this.baseUrl}/surveys/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deleteSurvey(id: string) {
    const response = await fetch(`${this.baseUrl}/surveys/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Question methods
  async getSurveyQuestions(surveyId: string) {
    return this.fetch(`/surveys/${surveyId}/questions`, [CACHE_TAGS.QUESTIONS(surveyId)]);
  }

  // User methods
  async getUser(userId: string) {
    return this.fetch(`/users/${userId}`, [CACHE_TAGS.USER(userId)]);
  }

  // Survey response methods
  async getSurveyResponses(surveyId: string) {
    return this.fetch(`/surveys/${surveyId}/responses`, [CACHE_TAGS.SURVEY_RESPONSES(surveyId)]);
  }
}

// Default API client instance
export const apiClient = new ApiClient();

// Convenience functions for common operations
export const surveysApi = {
  getAll: () => apiClient.getSurveys(),
  getActive: () => apiClient.getSurveys(true),
  getInactive: () => apiClient.getSurveys(false),
  getById: (id: string) => apiClient.getSurvey(id),
  create: (data: CreateSurvey) => apiClient.createSurvey(data),
  update: (id: string, data: UpdateSurvey) => apiClient.updateSurvey(id, data),
  delete: (id: string) => apiClient.deleteSurvey(id),
  getQuestions: (surveyId: string) => apiClient.getSurveyQuestions(surveyId),
  getResponses: (surveyId: string) => apiClient.getSurveyResponses(surveyId),
};

export const usersApi = {
  getById: (userId: string) => apiClient.getUser(userId),
  getSurveys: (userId: string) => apiClient.getUserSurveys(userId),
}; 