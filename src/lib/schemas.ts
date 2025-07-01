import { z } from 'zod';

// User schemas
export const userSchema = z.object({
  clerkId: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['user', 'admin']).default('user'),
});

// Survey schemas
export const createSurveySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateSurveySchema = createSurveySchema.partial();

// Question schemas
export const questionOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Option text is required'),
});

export const createQuestionSchema = z.object({
  surveyId: z.string().uuid(),
  questionText: z.string().min(1, 'Question text is required').max(500, 'Question must be less than 500 characters'),
  questionType: z.enum(['multiple_choice', 'text', 'rating']),
  orderIndex: z.number().int().min(0),
  isRequired: z.boolean().default(true),
  options: z.array(questionOptionSchema).optional(),
});

export const updateQuestionSchema = createQuestionSchema.partial();

// Survey response schemas
export const createSurveyResponseSchema = z.object({
  surveyId: z.string().uuid(),
  respondentId: z.string().uuid().optional(),
});

export const submitQuestionResponseSchema = z.object({
  surveyResponseId: z.string().uuid(),
  questionId: z.string().uuid(),
  answer: z.string().min(1, 'Answer is required'),
});

// Form schemas for UI
export const surveyFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  questions: z.array(z.object({
    questionText: z.string().min(1, 'Question text is required'),
    questionType: z.enum(['multiple_choice', 'text', 'rating']),
    isRequired: z.boolean().optional().default(true),
    options: z.array(z.object({
      text: z.string().min(1, 'Option text is required'),
    })).optional(),
  })).min(1, 'At least one question is required'),
});

export const answerFormSchema = z.object({
  answer: z.string().min(1, 'Please provide an answer'),
});

// API response schemas
export const surveyWithQuestionsSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  questions: z.array(z.object({
    id: z.string().uuid(),
    questionText: z.string(),
    questionType: z.string(),
    orderIndex: z.number(),
    isRequired: z.boolean(),
    options: z.array(z.object({
      id: z.string(),
      text: z.string(),
    })).nullable(),
  })),
});

export const questionResponseSchema = z.object({
  id: z.string().uuid(),
  questionText: z.string(),
  questionType: z.string(),
  options: z.array(z.object({
    id: z.string(),
    text: z.string(),
  })).nullable(),
  orderIndex: z.number(),
  isRequired: z.boolean(),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type CreateSurvey = z.infer<typeof createSurveySchema>;
export type UpdateSurvey = z.infer<typeof updateSurveySchema>;
export type CreateQuestion = z.infer<typeof createQuestionSchema>;
export type UpdateQuestion = z.infer<typeof updateQuestionSchema>;
export type CreateSurveyResponse = z.infer<typeof createSurveyResponseSchema>;
export type SubmitQuestionResponse = z.infer<typeof submitQuestionResponseSchema>;
export type SurveyForm = z.infer<typeof surveyFormSchema>;
export type AnswerForm = z.infer<typeof answerFormSchema>;
export type SurveyWithQuestions = z.infer<typeof surveyWithQuestionsSchema>;
export type QuestionResponse = z.infer<typeof questionResponseSchema>; 