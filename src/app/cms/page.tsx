import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import StatsCards from '@/components/cms/stats-cards';
import StatsCardsSkeleton from '@/components/cms/stats-cards-skeleton';
import RecentSurveys from '@/components/cms/recent-surveys';
import RecentSurveysSkeleton from '@/components/cms/recent-surveys-skeleton';
import QuickActions from '@/components/cms/quick-actions';
import RecentActivity from '@/components/cms/recent-activity';



export default async function CMSPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  // Check if current user is admin or moderator
  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';
  const isModeratorOrAdmin = currentUser?.role === 'moderator' || currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Survey Management</h1>
            <p className="text-gray-600 dark:text-gray-300">Create and manage your surveys</p>
          </div>
          <div className="flex space-x-2">
            {isModeratorOrAdmin && (
              <Link href="/cms/manage" prefetch={true}>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Surveys
                </Button>
              </Link>
            )}
            {isModeratorOrAdmin && (
              <Link href="/cms/create" prefetch={true}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Survey
                </Button>
              </Link>
            )}
            {isAdmin && (
              <Link href="/cms/users" prefetch={true}>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  User Management
                </Button>
              </Link>
            )}
          </div>
        </div>

        <Suspense fallback={<StatsCardsSkeleton />}>
          <StatsCards />
        </Suspense>

        <Suspense fallback={<RecentSurveysSkeleton />}>
          <RecentSurveys />
        </Suspense>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
} 