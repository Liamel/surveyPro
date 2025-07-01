'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Survey {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  questionCount?: number;
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const response = await fetch('/api/surveys?isActive=true');
        if (response.ok) {
          const data = await response.json();
          setSurveys(data);
        }
      } catch (error) {
        console.error('Error loading surveys:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSurveys();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading surveys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Available Surveys
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4">
            Take part in our surveys and help us gather valuable insights. Your feedback makes a difference.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Quick navigation:</span>
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Surveys Grid */}
        {surveys.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No surveys available
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              There are currently no active surveys. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey) => (
              <Card key={survey.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        {survey.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {survey.description || 'No description available'}
                      </CardDescription>
                    </div>
                    <Badge variant={survey.isActive ? "default" : "secondary"}>
                      {survey.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="h-4 w-4 mr-2" />
                      Created {new Date(survey.createdAt).toLocaleDateString()}
                    </div>
                    
                    {survey.questionCount && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <FileText className="h-4 w-4 mr-2" />
                        {survey.questionCount} questions
                      </div>
                    )}

                    <div className="pt-3">
                      <Link href={`/fill-survey/${survey.id}`}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Start Survey
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Want to create your own surveys?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Sign up for an account to create and manage your own surveys with our powerful CMS.
              </p>
              <Link href="/cms">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Go to CMS
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 