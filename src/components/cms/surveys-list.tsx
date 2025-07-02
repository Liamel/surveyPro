'use client';

import { useEffect, useState } from 'react';
import { match } from 'ts-pattern';
import { surveysApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Survey {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function SurveysList() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadSurveys();
  }, [filter]);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      
      const data = await match(filter)
        .with('active', () => surveysApi.getActive())
        .with('inactive', () => surveysApi.getInactive())
        .otherwise(() => surveysApi.getAll()) as Survey[];
      
      setSurveys(data);
    } catch (error) {
      console.error('Error loading surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSurvey = async () => {
    try {
      await surveysApi.create({
        title: 'New Survey',
        description: 'A new survey created via API',
        isActive: true,
      });
      await loadSurveys();
    } catch (error) {
      console.error('Error creating survey:', error);
    }
  };

  const handleToggleActive = async (survey: Survey) => {
    try {
      await surveysApi.update(survey.id, {
        isActive: !survey.isActive,
      });
      
      // The cache will be automatically revalidated by the API route
      await loadSurveys();
    } catch (error) {
      console.error('Error updating survey:', error);
    }
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    try {
      await surveysApi.delete(surveyId);
      
      // The cache will be automatically revalidated by the API route
      await loadSurveys();
    } catch (error) {
      console.error('Error deleting survey:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Surveys
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={filter === 'inactive' ? 'default' : 'outline'}
            onClick={() => setFilter('inactive')}
          >
            Inactive
          </Button>
        </div>
        
        <Button onClick={handleCreateSurvey}>
          Create Survey
        </Button>
      </div>

      {/* Surveys List */}
      <div className="space-y-4">
        {surveys.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No surveys found. Create your first survey!
              </p>
            </CardContent>
          </Card>
        ) : (
          surveys.map((survey) => (
            <Card key={survey.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{survey.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={survey.isActive ? 'default' : 'secondary'}>
                      {survey.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(survey)}
                    >
                      {survey.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSurvey(survey.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">
                  {survey.description || 'No description provided'}
                </p>
                <div className="text-sm text-muted-foreground">
                  Created: {new Date(survey.createdAt).toLocaleDateString()}
                  {survey.updatedAt !== survey.createdAt && (
                    <span className="ml-4">
                      Updated: {new Date(survey.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 