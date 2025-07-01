import { Card, CardContent } from '@/components/ui/card';
import { FileText, BarChart3, Settings } from 'lucide-react';
import { db } from '@/db/drizzle';
import { surveys, surveyResponses } from '@/db/schema';

export default async function StatsCards() {
  const allSurveys = await db.select().from(surveys);
  const allSurveyResponses = await db.select().from(surveyResponses);

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Surveys</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{allSurveys.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Surveys</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{allSurveys.filter((survey) => survey.isActive).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Draft Surveys</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{allSurveys.filter((survey) => !survey.isActive).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{allSurveyResponses.filter(surveyResponse => surveyResponse.isCompleted).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 