import { useState, useEffect, useRef } from 'react';
import URLInputForm from './URLInputForm';
import ErrorDisplay from './ErrorDisplay';
import TranslationProgress from './TranslationProgress';
import ChapterContent from './ChapterContent';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation, useRouter } from 'wouter';
import { Book } from 'lucide-react';

interface Chapter {
  chapterTitle: string;
  translatedContent: string;
  prevChapter: string | null;
  nextChapter: string | null;
  isCached?: boolean;
}

interface TranslationStream {
  bookNumber: string;
  chapterNumber: string;
  type: 'content' | 'status' | 'progress' | 'metadata' | 'error' | 'complete';
  data: any;
}

export default function NovelTranslator({ 
  initialUrl = '', 
  initialBookNumber = '', 
  initialChapterNumber = ''
}) {
  // Check for pre-rendered data from static HTML
  const hasPreRenderedData = typeof window !== 'undefined' && window.chapterData;
  
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(!hasPreRenderedData);
  const [error, setError] = useState('');
  const [chapter, setChapter] = useState<Chapter | null>(
    hasPreRenderedData ? {
      chapterTitle: window.chapterData!.chapterTitle,
      translatedContent: '', // Will be fetched from API
      prevChapter: window.chapterData!.prevChapter,
      nextChapter: window.chapterData!.nextChapter,
      isCached: true
    } : null
  );
  const [showInitialMessage, setShowInitialMessage] = useState(!initialUrl && !hasPreRenderedData);
  
  // Translation progress state
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(hasPreRenderedData ? 100 : 0);
  const [translationStatus, setTranslationStatus] = useState(hasPreRenderedData ? 'Loading pre-rendered content...' : 'Fetching content...');
  const [streamingContent, setStreamingContent] = useState('');
  
  // URL and permalink state
  const [bookNumber, setBookNumber] = useState(hasPreRenderedData ? window.chapterData!.bookNumber : initialBookNumber);
  const [chapterNumber, setChapterNumber] = useState(hasPreRenderedData ? window.chapterData!.chapterNumber : initialChapterNumber);
  const [permalinkUrl, setPermalinkUrl] = useState('');
  
  const [, navigate] = useLocation();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const extractBookAndChapterFromUrl = (url: string) => {
    try {
      // Example: https://www.69shuba.com/txt/84418/40150610
      const matches = url.match(/\/txt\/(\d+)\/(\d+)/);
      if (matches && matches.length >= 3) {
        return {
          bookNumber: matches[1],
          chapterNumber: matches[2]
        };
      }
      throw new Error('Could not extract book and chapter numbers from URL');
    } catch (e) {
      console.error("Failed to extract book and chapter numbers:", e);
      return null;
    }
  };
  
  const updatePermalink = (bookNum: string, chapterNum: string) => {
    setBookNumber(bookNum);
    setChapterNumber(chapterNum);
    const permalink = `/${bookNum}/${chapterNum}.html`;
    setPermalinkUrl(permalink);
    
    // Update browser URL without reload using wouter
    navigate(permalink, { replace: true });
  };
  
  const handleTranslation = async (inputUrl: string) => {
    if (!inputUrl) return;
    
    setUrl(inputUrl);
    setError('');
    setLoading(true);
    setIsTranslating(true);
    setProgress(0);
    setTranslationStatus('Fetching content...');
    setStreamingContent('');
    
    // Extract book and chapter numbers
    const urlInfo = extractBookAndChapterFromUrl(inputUrl);
    if (!urlInfo) {
      setError('Invalid URL format. Could not extract book and chapter numbers.');
      setLoading(false);
      setIsTranslating(false);
      return;
    }
    
    // Update permalink
    updatePermalink(urlInfo.bookNumber, urlInfo.chapterNumber);
    
    try {
      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      // Start streaming request
      const response = await fetch('/api/translate-chapter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: inputUrl,
          bookNumber: urlInfo.bookNumber,
          chapterNumber: urlInfo.chapterNumber
        }),
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to translate chapter');
      }
      
      if (!response.body) {
        throw new Error('Response body is null');
      }
      
      // Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      setShowInitialMessage(false);
      
      let fullContent = '';
      let metadata: Partial<Chapter> = {
        chapterTitle: '',
        prevChapter: null,
        nextChapter: null
      };
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const event: TranslationStream = JSON.parse(line);
            
            switch (event.type) {
              case 'content':
                fullContent += event.data;
                setStreamingContent(fullContent);
                break;
              case 'status':
                setTranslationStatus(event.data);
                break;
              case 'progress':
                setProgress(event.data);
                break;
              case 'metadata':
                metadata = { ...metadata, ...event.data };
                break;
              case 'error':
                throw new Error(event.data);
              case 'complete':
                // Final update with complete data
                setChapter({
                  chapterTitle: metadata.chapterTitle || 'Chapter',
                  translatedContent: fullContent,
                  prevChapter: metadata.prevChapter || null,
                  nextChapter: metadata.nextChapter || null
                });
                setIsTranslating(false);
                break;
            }
          } catch (e) {
            console.error('Error parsing stream chunk:', e);
          }
        }
      }
      
    } catch (err: any) {
      console.error('Translation error:', err);
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to translate chapter');
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };
  
  const handleNavigate = (newUrl: string) => {
    setUrl(newUrl);
    handleTranslation(newUrl);
  };
  
  // Effect to handle initial URL, navigation, or pre-rendered data
  useEffect(() => {
    if (hasPreRenderedData) {
      // For pre-rendered data from static HTML
      const bookNum = window.chapterData!.bookNumber;
      const chapterNum = window.chapterData!.chapterNumber;
      
      // Set permalink URL
      const permalink = `/${bookNum}/${chapterNum}.html`;
      setPermalinkUrl(permalink);
      
      // Either load from cache or construct URL to fetch
      const constructedUrl = `https://www.69shuba.com/txt/${bookNum}/${chapterNum}`;
      setUrl(constructedUrl);
      
      // Fetch the content if not already cached
      // This might be redundant if using SSR, but ensures content loads
      setLoading(true);
      handleTranslation(constructedUrl);
    } 
    else if (initialUrl) {
      handleTranslation(initialUrl);
    } 
    else if (initialBookNumber && initialChapterNumber) {
      const constructedUrl = `https://www.69shuba.com/txt/${initialBookNumber}/${initialChapterNumber}`;
      setUrl(constructedUrl);
      handleTranslation(constructedUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <URLInputForm onSubmit={handleTranslation} loading={loading} />
      
      <ErrorDisplay
        message={error}
        onClose={() => setError('')}
      />
      
      {isTranslating && (
        <TranslationProgress
          progress={progress}
          status={translationStatus}
          streamingContent={streamingContent}
        />
      )}
      
      {chapter && !isTranslating && (
        <ChapterContent
          chapterTitle={chapter.chapterTitle}
          bookInfo={`Novel #${bookNumber}`}
          translatedContent={chapter.translatedContent}
          prevChapter={chapter.prevChapter}
          nextChapter={chapter.nextChapter}
          permalinkUrl={permalinkUrl}
          onNavigate={handleNavigate}
        />
      )}
      
      {showInitialMessage && !isTranslating && !chapter && (
        <div className="max-w-3xl mx-auto text-center py-12">
          <Card className="bg-white dark:bg-gray-900 inline-block transition-colors duration-200">
            <CardContent className="pt-6">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mx-auto w-fit mb-4">
                <Book className="text-primary h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Novel Translator</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Enter a chapter URL from 69shuba.com to get started</p>
              <div className="flex justify-center space-x-4">
                <a href="#" className="text-primary hover:underline flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How it works
                </a>
                <a href="#" className="text-primary hover:underline flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent translations
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
