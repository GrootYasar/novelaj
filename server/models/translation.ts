import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

interface Translation {
  chapter_url: string;
  chapter_title: string;
  translated_content: string;
  prev_chapter: string | null;
  next_chapter: string | null;
  book_number: string;
  chapter_number: string;
}

class TranslationManager {
  private supabase;
  
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        console.log('TranslationManager: Supabase client initialized');
      } catch (error) {
        console.error('TranslationManager: Failed to initialize Supabase client:', error);
        this.supabase = null;
      }
    } else {
      console.log('TranslationManager: No Supabase credentials, using file-based storage only');
      this.supabase = null;
    }
  }
  
  async getCachedTranslation(url: string): Promise<Translation | null> {
    if (!this.supabase) return null;
    
    try {
      const { data, error } = await this.supabase
        .from('translations')
        .select('*')
        .eq('chapter_url', url)
        .single();
        
      if (error || !data) return null;
      return data as Translation;
    } catch (error) {
      console.error('Error fetching cached translation:', error);
      return null;
    }
  }
  
  async saveTranslation(translation: Translation): Promise<void> {
    // Save to Supabase if available
    if (this.supabase) {
      try {
        await this.supabase.from('translations').upsert({
          chapter_url: translation.chapter_url,
          chapter_title: translation.chapter_title,
          translated_content: translation.translated_content,
          prev_chapter: translation.prev_chapter,
          next_chapter: translation.next_chapter,
          book_number: translation.book_number,
          chapter_number: translation.chapter_number,
        });
      } catch (error) {
        console.error('Error saving to Supabase:', error);
      }
    }
    
    // Also save as static HTML file
    try {
      const staticDir = path.join(process.cwd(), 'static');
      const bookDir = path.join(staticDir, translation.book_number);
      
      // Create directories if they don't exist
      await fs.mkdir(staticDir, { recursive: true });
      await fs.mkdir(bookDir, { recursive: true });
      
      // Create HTML file with preloaded data
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${translation.chapter_title} - Novel Translator</title>
  <meta property="og:title" content="${translation.chapter_title} - Novel Translator">
  <meta property="og:description" content="Translated Chinese novel chapter">
  <meta name="description" content="Translated Chinese novel chapter">
  <link rel="canonical" href="/${translation.book_number}/${translation.chapter_number}.html">
  <script>
    window.chapterData = {
      bookNumber: "${translation.book_number}",
      chapterNumber: "${translation.chapter_number}",
      chapterTitle: "${translation.chapter_title.replace(/"/g, '\\"')}",
      prevChapter: ${translation.prev_chapter ? `"${translation.prev_chapter}"` : 'null'},
      nextChapter: ${translation.next_chapter ? `"${translation.next_chapter}"` : 'null'}
    };
  </script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`;
      
      await fs.writeFile(
        path.join(bookDir, `${translation.chapter_number}.html`),
        htmlContent
      );
      
    } catch (err) {
      console.error('Error saving static HTML:', err);
    }
  }
}

export const translationManager = new TranslationManager();
