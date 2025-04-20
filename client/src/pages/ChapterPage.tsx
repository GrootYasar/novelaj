import NovelTranslator from '@/components/NovelTranslator';
import { useParams } from 'wouter';

export default function ChapterPage() {
  const params = useParams<{ bookNumber: string; chapterNumber: string }>();
  const bookNumber = params?.bookNumber;
  const chapterNumber = params?.chapterNumber?.replace('.html', '');
  
  if (!bookNumber || !chapterNumber) {
    return <div>Invalid chapter URL</div>;
  }
  
  // Construct the 69shuba URL
  const chapterUrl = `https://www.69shuba.com/txt/${bookNumber}/${chapterNumber}`;
  
  return (
    <NovelTranslator 
      initialUrl={chapterUrl}
      initialBookNumber={bookNumber}
      initialChapterNumber={chapterNumber}
    />
  );
}
