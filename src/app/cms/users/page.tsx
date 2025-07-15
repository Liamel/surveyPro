import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import UserManagementClient from './user-management-client';

export default async function UserManagementPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  // Check if current user is admin
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    redirect('/cms');
  }

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage users and their roles</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Admin Access</span>
          </div>
        </div>

        <Suspense fallback={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading users...</p>
            </div>
          </div>
        }>
          <UserManagementClient />
        </Suspense>
      </div>
    </div>
  );
} 