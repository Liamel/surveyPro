'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Users,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface Survey {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questionCount?: number;
  responseCount?: number;
}

interface ManageSurveysClientProps {
  initialSurveys: Survey[];
}

export default function ManageSurveysClient({ initialSurveys }: ManageSurveysClientProps) {
  const [surveys, setSurveys] = useState<Survey[]>(initialSurveys);
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>(initialSurveys);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    filterSurveys();
  }, [surveys, searchTerm, ,filterActive]);

  const filterSurveys = () => {
    let filtered = surveys;

    if (searchTerm) {
      filtered = filtered.filter(survey =>
        survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (survey.description && survey.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterActive === 'active') {
      filtered = filtered.filter(survey => survey.isActive);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter(survey => !survey.isActive);
    }

    setFilteredSurveys(filtered);
  };

  const toggleSurveyStatus = async (surveyId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setSurveys(prev => prev.map(survey => 
          survey.id === surveyId 
            ? { ...survey, isActive: !currentStatus }
            : survey
        ));
      }
    } catch (error) {
      console.error('Error updating survey status:', error);
    }
  };

  const deleteSurvey = async (surveyId: string) => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSurveys(prev => prev.filter(survey => survey.id !== surveyId));
      }
    } catch (error) {
      console.error('Error deleting survey:', error);
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium">Search Surveys</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Filter by Status</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={filterActive === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterActive('all')}
                >
                  All ({surveys.length})
                </Button>
                <Button
                  variant={filterActive === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterActive('active')}
                >
                  Active ({surveys.filter(s => s.isActive).length})
                </Button>
                <Button
                  variant={filterActive === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterActive('inactive')}
                >
                  Inactive ({surveys.filter(s => !s.isActive).length})
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Surveys List */}
      {filteredSurveys.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {surveys.length === 0 ? 'No surveys found' : 'No surveys match your filters'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {surveys.length === 0 
                ? 'Create your first survey to get started.' 
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {surveys.length === 0 && (
              <Link href="/cms/create" prefetch={true}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Create Your First Survey
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSurveys.map((survey) => (
            <Card key={survey.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {survey.title}
                      </h3>
                      <Badge variant={survey.isActive ? "default" : "secondary"}>
                        {survey.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    {survey.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {survey.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Created {new Date(survey.createdAt).toLocaleDateString()}
                      </div>
                      {survey.questionCount && (
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {survey.questionCount} questions
                        </div>
                      )}
                      {survey.responseCount !== undefined && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {survey.responseCount} responses
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Toggle Active Status */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={survey.isActive}
                        onCheckedChange={() => toggleSurveyStatus(survey.id, survey.isActive)}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {survey.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1">
                      <Link href={`/fill-survey/${survey.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <Link href={`/cms/edit/${survey.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Survey</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &ldquo;{survey.title}&rdquo;? This action cannot be undone and will permanently remove the survey and all its responses.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSurvey(survey.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Survey
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Surveys</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{surveys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Surveys</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {surveys.filter(s => s.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Inactive Surveys</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {surveys.filter(s => !s.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 