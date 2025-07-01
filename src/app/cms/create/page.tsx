'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { surveyFormSchema, type SurveyForm } from '@/lib/schemas';
import Link from 'next/link';

export default function CreateSurveyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      title: '',
      description: '',
      questions: [
        {
          questionText: '',
          questionType: 'multiple_choice' as const,
          isRequired: true,
          options: [
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
          ],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const watchedQuestions = watch('questions');

  const onSubmit = async (data: SurveyForm) => {
    setIsSubmitting(true);
    try {
      // Create survey
      const surveyResponse = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          isActive: true,
        }),
      });
      console.log(surveyResponse);
      if (!surveyResponse.ok) {
        throw new Error('Failed to create survey');
      }

      const survey = await surveyResponse.json();

      // Create questions
      for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];
        const questionData = {
          surveyId: survey.id,
          questionText: question.questionText,
          questionType: question.questionType,
          orderIndex: i,
          isRequired: question.isRequired,
          options: question.questionType === 'multiple_choice' ? question.options?.map((option: { text: string }, index: number) => ({
            id: `option-${i}-${index}`,
            text: option.text,
          })) : null,
        };

        console.log(`Creating question ${i + 1}:`, questionData);

        const questionResponse = await fetch('/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questionData),
        });

        if (!questionResponse.ok) {
          console.error('Failed to create question:', await questionResponse.text());
          throw new Error(`Failed to create question ${i + 1}`);
        }
      }

      router.push('/cms');
    } catch (error) {
      console.error('Error creating survey:', error);
      alert('Failed to create survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuestion = () => {
    append({
      questionText: '',
      questionType: 'multiple_choice',
      isRequired: true,
      options: [
        { text: '' },
        { text: '' },
        { text: '' },
        { text: '' },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/cms">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to CMS
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Survey</h1>
              <p className="text-gray-600 dark:text-gray-300">Design your survey with questions and options</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Survey Details */}
          <Card>
            <CardHeader>
              <CardTitle>Survey Details</CardTitle>
              <CardDescription>Basic information about your survey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Survey Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter survey title"
                  className="mt-1"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Enter survey description"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Questions</h2>
              <Button type="button" onClick={addQuestion} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`questions.${index}.questionText`}>Question Text *</Label>
                    <Input
                      {...register(`questions.${index}.questionText`)}
                      placeholder="Enter your question"
                      className="mt-1"
                    />
                    {errors.questions?.[index]?.questionText && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.questions[index]?.questionText?.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`questions.${index}.questionType`}>Question Type</Label>
                      <Select
                        value={watchedQuestions[index]?.questionType}
                        onValueChange={(value) => {
                          const newQuestions = [...watchedQuestions];
                          newQuestions[index] = {
                            ...newQuestions[index],
                            questionType: value as 'multiple_choice' | 'text' | 'rating',
                          };
                          // Update the form
                          const event = {
                            target: {
                              name: `questions.${index}.questionType`,
                              value,
                            },
                          };
                          register(`questions.${index}.questionType`).onChange(event);
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="text">Text Input</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2 mt-6">
                      <Checkbox
                        id={`questions.${index}.isRequired`}
                        checked={watchedQuestions[index]?.isRequired}
                        onCheckedChange={(checked) => {
                          const newQuestions = [...watchedQuestions];
                          newQuestions[index] = {
                            ...newQuestions[index],
                            isRequired: checked as boolean,
                          };
                          // Update the form
                          const event = {
                            target: {
                              name: `questions.${index}.isRequired`,
                              checked,
                            },
                          };
                          register(`questions.${index}.isRequired`).onChange(event);
                        }}
                      />
                      <Label htmlFor={`questions.${index}.isRequired`}>Required</Label>
                    </div>
                  </div>

                  {/* Options for multiple choice questions */}
                  {watchedQuestions[index]?.questionType === 'multiple_choice' && (
                    <div>
                      <Label>Options</Label>
                      <div className="space-y-2 mt-2">
                        {[0, 1, 2, 3].map((optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <Input
                              {...register(`questions.${index}.options.${optionIndex}.text`)}
                              placeholder={`Option ${optionIndex + 1}`}
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/cms">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Survey'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 