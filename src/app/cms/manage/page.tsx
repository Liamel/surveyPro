import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getSurveysCached } from '@/lib/cache';
import ManageSurveysClient from './manage-surveys-client';

// Get surveys from cached data
const getSurveys = async () => {
  const surveysData = await getSurveysCached();
  return surveysData.map(survey => ({
    ...survey,
    createdAt: typeof survey.createdAt === 'string' 
      ? survey.createdAt 
      : survey.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: typeof survey.updatedAt === 'string' 
      ? survey.updatedAt 
      : survey.updatedAt?.toISOString() || new Date().toISOString(),
  }));
};

export default async function ManageSurveysPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  const surveysData = await getSurveys();

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Surveys</h1>
              <p className="text-gray-600 dark:text-gray-300">View, edit, and manage your surveys</p>
            </div>
          </div>
          <Link href="/cms/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              Create New Survey
            </Button>
          </Link>
        </div>

        <Suspense fallback={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading surveys...</p>
            </div>
          </div>
        }>
          <ManageSurveysClient initialSurveys={surveysData} />
        </Suspense>
      </div>
    </div>
  );
} 