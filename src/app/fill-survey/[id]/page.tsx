'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { answerFormSchema, type AnswerForm } from '@/lib/schemas';
import { type QuestionResponse } from '@/lib/schemas';

interface SurveyData {
  id: string;
  title: string;
  description: string | null;
  questions: QuestionResponse[];
}

export default function FillSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [surveyResponseId, setSurveyResponseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnswerForm>({
    resolver: zodResolver(answerFormSchema),
  });

  const currentQuestion = survey?.questions[currentQuestionIndex];
  const progress = survey ? ((currentQuestionIndex + 1) / survey.questions.length) * 100 : 0;

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        // Start survey response
        const responseResponse = await fetch('/api/survey-responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            surveyId: params.id as string,
          }),
        });

        if (!responseResponse.ok) {
          throw new Error('Failed to start survey');
        }

        const responseData = await responseResponse.json();
        setSurveyResponseId(responseData.id);

        // Load survey questions
        const questionsResponse = await fetch(`/api/questions?surveyId=${params.id}`);
        if (!questionsResponse.ok) {
          throw new Error('Failed to load survey questions');
        }

        const questions = await questionsResponse.json();

        // Load survey details
        const surveyResponse = await fetch(`/api/surveys/${params.id}`);
        if (!surveyResponse.ok) {
          throw new Error('Failed to load survey details');
        }

        const surveyData = await surveyResponse.json();

        setSurvey({
          ...surveyData,
          questions: questions.sort((a: QuestionResponse, b: QuestionResponse) => a.orderIndex - b.orderIndex),
        });
      } catch (error) {
        console.error('Error loading survey:', error);
        alert('Failed to load survey. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadSurvey();
    }
  }, [params.id]);

  const handleAnswerSubmit = async (data: AnswerForm) => {
    if (!surveyResponseId || !currentQuestion) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/question-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyResponseId,
          questionId: currentQuestion.id,
          answer: data.answer,
        }),
      });

      setAnswers(prev => ({ ...prev, [currentQuestion.id]: data.answer }));

      if (currentQuestionIndex < survey!.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setValue('answer', '');
      } else {
        // Complete survey
        await fetch(`/api/survey-responses/${surveyResponseId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isCompleted: true,
            completedAt: new Date().toISOString(),
          }),
        });

        router.push(`/survey-complete/${surveyResponseId}`);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      const previousQuestion = survey!.questions[currentQuestionIndex - 1];
      setValue('answer', answers[previousQuestion.id] || '');
    }
  };

  const handleOptionSelect = (value: string) => {
    setValue('answer', value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Survey not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {survey.description}
            </p>
          )}
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">
            Question {currentQuestionIndex + 1} of {survey.questions.length}
          </p>
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {currentQuestion?.questionText}
            </CardTitle>
            {currentQuestion?.isRequired && (
              <CardDescription className="text-red-600">
                * Required
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleAnswerSubmit)} className="space-y-6">
              {/* Question Input */}
              {currentQuestion?.questionType === 'multiple_choice' && currentQuestion.options && (
                <RadioGroup
                  value={watch('answer')}
                  onValueChange={handleOptionSelect}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.text} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="text-base cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion?.questionType === 'text' && (
                <Textarea
                  {...register('answer')}
                  placeholder="Enter your answer..."
                  className="min-h-[100px]"
                />
              )}

              {currentQuestion?.questionType === 'rating' && (
                <RadioGroup
                  value={watch('answer')}
                  onValueChange={handleOptionSelect}
                  className="flex space-x-4"
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                      <Label htmlFor={`rating-${rating}`} className="text-lg font-medium">
                        {rating}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {errors.answer && (
                <p className="text-sm text-red-600">{errors.answer.message}</p>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting || !watch('answer')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {currentQuestionIndex === survey.questions.length - 1 ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Submitting...' : 'Complete Survey'}
                    </>
                  ) : (
                    <>
                      {isSubmitting ? 'Saving...' : 'Next'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 