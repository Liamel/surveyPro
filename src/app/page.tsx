import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600 rounded-full">
              <FileText className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to SurveyPro
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Create, manage, and analyze surveys with ease. Professional survey platform for modern businesses.
          </p>
          
          <Suspense fallback={
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3" disabled>
                Loading...
              </Button>
            </div>
          }>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignedOut>
                <SignInButton>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                    Sign In
                  </Button>
                </SignInButton>
                <Button variant="outline" size="lg" className="px-8 py-3">
                  Hello
                </Button>
              </SignedOut>
              <SignedIn>
                <Link href="/cms">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                    Go to CMS
                  </Button>
                </Link>
                <Link href="/surveys">
                  <Button variant="outline" size="lg" className="px-8 py-3">
                    View Surveys
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </Suspense>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Create Surveys</CardTitle>
              <CardDescription>
                Build professional surveys with multiple question types and custom branding.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Collect Responses</CardTitle>
              <CardDescription>
                Share surveys easily and collect responses from your target audience.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Analyze Results</CardTitle>
              <CardDescription>
                Get detailed insights and analytics from your survey responses.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600 dark:text-gray-300">Surveys Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-gray-600 dark:text-gray-300">Responses Collected</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-gray-600 dark:text-gray-300">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
