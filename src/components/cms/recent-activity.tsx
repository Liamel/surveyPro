import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Survey &ldquo;Customer Feedback&rdquo; received 5 new responses
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Survey &ldquo;Product Launch&rdquo; was published
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              New template &ldquo;Employee Satisfaction&rdquo; was added
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 