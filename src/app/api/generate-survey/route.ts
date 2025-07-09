import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Check if OpenAI API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not configured');
}

const surveyGenerationSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  questions: z.array(z.object({
    questionText: z.string().min(1).max(500),
    questionType: z.enum(['multiple_choice', 'text', 'rating']),
    isRequired: z.boolean().default(true),
    options: z.array(z.object({
      text: z.string().min(1),
    })).optional(),
  })).min(1).max(10),
});

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('Generating survey with prompt:', prompt);

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: surveyGenerationSchema,
      prompt: `Generate a survey based on the following request: "${prompt}"

Please create a comprehensive survey with:
- A clear, descriptive title
- A brief description explaining the purpose
- 3-8 relevant questions that would help gather useful insights
- Mix of question types (multiple choice, text input, rating) where appropriate
- For multiple choice questions, provide 3-5 relevant options
- Make questions specific and actionable

The survey should be professional, well-structured, and designed to gather meaningful data.`,
    });

    console.log('Generated survey:', object);
    return NextResponse.json(object);
  } catch (error) {
    console.error('Error generating survey:', error);
    return NextResponse.json(
      { error: 'Failed to generate survey', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 