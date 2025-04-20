import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share, ChevronLeft, ChevronRight, BookOpen, FileType, AlignLeft, ALargeSmall } from 'lucide-react';
import { useState } from 'react';

interface ChapterContentProps {
  chapterTitle: string;
  bookInfo?: string;
  translatedContent: string;
  prevChapter: string | null;
  nextChapter: string | null;
  permalinkUrl: string;
  onNavigate: (url: string) => void;
}

export default function ChapterContent({
  chapterTitle,
  bookInfo = "Novel Translation",
  translatedContent,
  prevChapter,
  nextChapter,
  permalinkUrl,
  onNavigate
}: ChapterContentProps) {
  
  const [copied, setCopied] = useState(false);
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: chapterTitle,
          url: window.location.href
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Copy failed:", err);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-white dark:bg-gray-900 shadow-lg transition-colors duration-200">
        {/* Chapter Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {bookInfo}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-primary mt-1">
                {chapterTitle}
              </h1>
            </div>
            <div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary rounded-full transition-colors"
                title={copied ? "Copied!" : "Share"}
              >
                <Share className="h-5 w-5" />
                {copied && <span className="sr-only">Copied!</span>}
              </Button>
            </div>
          </div>
          
          {/* Reading Options */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Button variant="outline" size="sm" className="flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <FileType className="h-4 w-4 mr-1" /> FileType
            </Button>
            <Button variant="outline" size="sm" className="flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <ALargeSmall className="h-4 w-4 mr-1" /> Size
            </Button>
            <Button variant="outline" size="sm" className="flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <AlignLeft className="h-4 w-4 mr-1" /> Layout
            </Button>
          </div>
        </div>
        
        {/* Chapter Content */}
        <div className="p-6 sm:p-8 font-serif leading-relaxed space-y-4 transition-colors duration-200" dangerouslySetInnerHTML={{ __html: translatedContent }} />
        
        {/* Chapter Navigation */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => prevChapter && onNavigate(prevChapter)}
            disabled={!prevChapter}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium transition-colors ${!prevChapter ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Chapter
          </Button>
          
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline-block">
            <BookOpen className="h-4 w-4 inline mr-1" /> Auto-saved
          </span>
          
          <Button
            variant="default"
            onClick={() => nextChapter && onNavigate(nextChapter)}
            disabled={!nextChapter}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium bg-primary hover:bg-secondary text-white transition-colors ${!nextChapter ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next Chapter
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>

      {/* Additional Info */}
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Translated from Chinese • Permalink: <a href={permalinkUrl} className="text-primary hover:underline">{permalinkUrl}</a></p>
      </div>
    </div>
  );
}
