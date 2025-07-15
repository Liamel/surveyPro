import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function ManageSurveysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  // Check if current user is moderator or admin
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== 'moderator' && currentUser.role !== 'admin')) {
    redirect('/cms');
  }

  return <>{children}</>;
} 