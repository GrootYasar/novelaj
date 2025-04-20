import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Link } from 'lucide-react';

interface URLInputFormProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export default function URLInputForm({ onSubmit, loading }: URLInputFormProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-white dark:bg-gray-900 shadow-lg transition-colors duration-200">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Enter Chapter URL</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="flex rounded-md shadow-sm">
                <div className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200">
                  <Link className="h-4 w-4" />
                </div>
                <Input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter chapter URL (e.g., https://www.69shuba.com/txt/84418/40150610)"
                  className="flex-1 rounded-none rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary transition-colors duration-200"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button
                type="submit"
                disabled={loading || !url.trim()}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span>Loading...</span>
                    <LoadingSpinner className="ml-2" size={16} />
                  </>
                ) : (
                  'Load Chapter'
                )}
              </Button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  URL will be parsed to create a permalink
                </span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
