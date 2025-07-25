import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { getSurveysCached } from '@/lib/cache';

const getRecentSurveys = async () => {
  const allSurveys = await getSurveysCached();
  return allSurveys.slice(0, 5).map(survey => ({
    ...survey,
    createdAt: typeof survey.createdAt === 'string' 
      ? survey.createdAt 
      : survey.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: typeof survey.updatedAt === 'string' 
      ? survey.updatedAt 
      : survey.updatedAt?.toISOString() || new Date().toISOString(),
  }));
};

export default async function RecentSurveys() {
  const recentSurveys = await getRecentSurveys();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Surveys</CardTitle>
        <CardDescription>Your recently created or updated surveys</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentSurveys.length > 0 ? (
            recentSurveys.map((survey) => (
              <div key={survey.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{survey.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Created {new Date(survey.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={survey.isActive ? "secondary" : "outline"}>
                    {survey.isActive ? "Active" : "Draft"}
                  </Badge>
                  <Link href={`/cms/manage`}>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No surveys created yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 