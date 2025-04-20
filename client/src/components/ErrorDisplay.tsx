import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorDisplayProps {
  message: string;
  onClose: () => void;
}

export default function ErrorDisplay({ message, onClose }: ErrorDisplayProps) {
  if (!message) return null;
  
  return (
    <div className="max-w-3xl mx-auto my-4">
      <Alert variant="destructive" className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 relative transition-colors duration-200">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  );
}
