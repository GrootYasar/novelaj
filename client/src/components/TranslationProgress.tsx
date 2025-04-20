import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Languages } from 'lucide-react';

interface TranslationProgressProps {
  progress: number;
  status: string;
  streamingContent: string;
}

export default function TranslationProgress({ progress, status, streamingContent }: TranslationProgressProps) {
  return (
    <div className="max-w-3xl mx-auto my-8">
      <Card className="bg-white dark:bg-gray-900 shadow-lg transition-colors duration-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Translation in Progress</h3>
            <div className="text-primary dark:text-primary text-sm font-medium">
              <span>{progress}%</span>
            </div>
          </div>
          
          <Progress value={progress} className="h-2.5 bg-gray-200 dark:bg-gray-700" />
          
          <div className="mt-4 flex items-center space-x-3 justify-center">
            <div className="animate-bounce text-primary dark:text-primary">
              <Languages className="h-5 w-5" />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span>{status}</span>
            </div>
          </div>

          <div 
            className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto font-serif transition-colors duration-200"
            dangerouslySetInnerHTML={{ __html: streamingContent || '<p class="text-gray-500 dark:text-gray-400 italic text-sm">Translation output will appear here...</p>' }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
