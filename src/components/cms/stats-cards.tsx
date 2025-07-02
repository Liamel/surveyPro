import { Card, CardContent } from '@/components/ui/card';
import { FileText, BarChart3, Settings } from 'lucide-react';
import { getAllSurveyResponsesCompletedCached, getSurveysCached } from '@/lib/cache';

export default async function StatsCards() {
  const allSurveysCached = await getSurveysCached();
  const totalSurveyResponsesCompleted = await getAllSurveyResponsesCompletedCached();

  return (
    <div className="grid md:grid-cols-5 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Surveys</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{allSurveysCached.length}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{allSurveysCached.filter((survey) => survey.isActive).length}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{allSurveysCached.filter((survey) => !survey.isActive).length}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Surveys Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSurveyResponsesCompleted}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Chart placeholder</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 