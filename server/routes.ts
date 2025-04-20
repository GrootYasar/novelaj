import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from 'axios';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Initialize Supabase client if credentials are available
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
// Define the type for supabase client
let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const BASE_URL = 'https://www.69shuba.com';

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for translating a chapter
  app.post('/api/translate-chapter', async (req, res) => {
    const { url, bookNumber, chapterNumber } = req.body;
    
    if (!url || !url.includes('69shuba')) {
      return res.status(400).json({ error: 'Invalid or missing URL' });
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Function to send stream events
    const sendEvent = (type: string, data: any) => {
      res.write(JSON.stringify({ 
        bookNumber,
        chapterNumber,
        type, 
        data 
      }) + '\n');
    };

    try {
      // Check cache first
      let cached = null;
      if (supabaseUrl && supabaseKey && supabase) {
        try {
          const { data, error } = await supabase
            .from('translations')
            .select('*')
            .eq('chapter_url', url)
            .single();
            
          if (data && !error) {
            cached = data;
          }
        } catch (err) {
          console.error('Error querying cache:', err);
        }
      }

      if (cached) {
        // Send cached data
        sendEvent('status', 'Loading cached translation...');
        sendEvent('progress', 100);
        sendEvent('content', cached.translated_content);
        sendEvent('metadata', {
          chapterTitle: cached.chapter_title,
          prevChapter: cached.prev_chapter,
          nextChapter: cached.next_chapter
        });
        sendEvent('complete', true);
        return res.end();
      }

      // Fetch and process data
      sendEvent('status', 'Fetching chapter content...');
      sendEvent('progress', 10);

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const html = iconv.decode(Buffer.from(response.data), 'gbk');
      const $ = load(html);

      sendEvent('status', 'Extracting chapter content...');
      sendEvent('progress', 20);

      const chapterTitle = $('.txtnav h1').text().trim() || 'Chapter';
      let content = $('.txtnav').html() || '';
      
      if (!content) {
        sendEvent('error', 'No content found');
        return res.end();
      }

      // Aggressive cleaning to remove metadata, notes, and navigation
      $('.txtnav .contentadv, .txtnav .bottom-ad, .txtnav script, .txtnav .page1, .txtnav p:contains("ps"), .txtnav p:contains("作者"), .txtnav p:contains("本章完")').remove();
      content = $('.txtnav').html() || '';

      // Extract only the main body paragraphs
      const $content = load(content);
      let paragraphs;
      
      if ($content.root().find('p').length) {
        paragraphs = $content.root().find('p').toArray().filter(el => {
          const text = $(el).text();
          return Boolean(text) && !text.match(/ps|作者|本章完|感谢/);
        });
      } else {
        paragraphs = $content.root().contents().toArray().filter(el => {
          if (el.type !== 'text') return false;
          const text = $(el).text().trim();
          return Boolean(text) && !text.match(/ps|作者|本章完|感谢/);
        });
      }
      // Convert back to cheerio collection
      paragraphs = $(paragraphs);
      
      const originalSegments: string[] = [];
      paragraphs.each((i, el) => {
        const text = $(el).text().trim();
        if (text) originalSegments.push(text);
      });
      
      if (originalSegments.length === 0) {
        const textContent = $content.text().trim().replace(/\s*(ps|作者|本章完|感谢).*|\n{2,}/g, '\n\n');
        originalSegments.push(...textContent.split('\n\n').map(t => t.trim()).filter(t => t && !t.match(/ps|作者|本章完|感谢/)));
      }

      // Get navigation links
      const prevLink = $('.page1 a').filter((i, el) => $(el).text().includes('上一章'));
      const nextLink = $('.page1 a').filter((i, el) => $(el).text().includes('下一章'));
      const prevChapter = prevLink.length ? new URL(prevLink.attr('href') || '', BASE_URL).href : null;
      const nextChapter = nextLink.length ? new URL(nextLink.attr('href') || '', BASE_URL).href : null;

      sendEvent('metadata', {
        chapterTitle,
        prevChapter,
        nextChapter
      });
      
      sendEvent('status', 'Translating chapter...');
      sendEvent('progress', 30);

      // Use Google's Generative AI for translation
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Translate in batches for streaming
      const batchSize = 5;
      const batches = Math.ceil(originalSegments.length / batchSize);
      let translatedContent = '';
      
      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, originalSegments.length);
        const batch = originalSegments.slice(start, end);
        
        sendEvent('status', `Translating batch ${i+1}/${batches}...`);
        sendEvent('progress', 30 + Math.floor((i / batches) * 60));
        
        const result = await model.generateContent(
          `Translate the following Chinese text to English naturally and fluently, clearly and accurately, maintaining the tone and intent of original text:\n\n${batch.join('\n\n')}`
        );
        
        const translatedText = result.response.text();
        const translatedSegments = translatedText.split('\n\n').map(t => t.trim()).filter(t => t);
        
        // Add translated paragraphs to content
        for (let j = 0; j < Math.min(batch.length, translatedSegments.length); j++) {
          const paragraph = `<p>${translatedSegments[j] || ''}</p>\n`;
          translatedContent += paragraph;
          sendEvent('content', paragraph);
        }
        
        // Add any missing paragraphs if translation returned fewer than expected
        if (translatedSegments.length < batch.length) {
          for (let j = translatedSegments.length; j < batch.length; j++) {
            const paragraph = '<p></p>\n';
            translatedContent += paragraph;
            sendEvent('content', paragraph);
          }
        }
      }

      sendEvent('status', 'Finalizing translation...');
      sendEvent('progress', 90);

      // Save translation to cache
      if (supabaseUrl && supabaseKey && supabase) {
        try {
          await supabase.from('translations').upsert({
            chapter_url: url,
            chapter_title: chapterTitle,
            translated_content: translatedContent,
            prev_chapter: prevChapter,
            next_chapter: nextChapter,
            book_number: bookNumber,
            chapter_number: chapterNumber,
          });
        } catch (err) {
          console.error('Error saving to Supabase:', err);
        }
      }

      // Save as static HTML file for Vercel
      try {
        const staticDir = path.join(process.cwd(), 'static');
        const bookDir = path.join(staticDir, bookNumber);
        
        // Create directories if they don't exist
        await fs.mkdir(staticDir, { recursive: true });
        await fs.mkdir(bookDir, { recursive: true });
        
        // Create HTML file
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${chapterTitle} - Novel Translator</title>
  <meta property="og:title" content="${chapterTitle} - Novel Translator">
  <meta property="og:description" content="Translated Chinese novel chapter">
  <meta name="description" content="Translated Chinese novel chapter">
  <link rel="canonical" href="/${bookNumber}/${chapterNumber}.html">
  <script>
    window.chapterData = {
      bookNumber: "${bookNumber}",
      chapterNumber: "${chapterNumber}",
      chapterTitle: "${chapterTitle.replace(/"/g, '\\"')}",
      prevChapter: ${prevChapter ? `"${prevChapter}"` : 'null'},
      nextChapter: ${nextChapter ? `"${nextChapter}"` : 'null'}
    };
  </script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`;
        
        await fs.writeFile(
          path.join(bookDir, `${chapterNumber}.html`),
          htmlContent
        );
        
      } catch (err) {
        console.error('Error saving static HTML:', err);
        // Continue even if static generation fails
      }

      sendEvent('status', 'Translation complete!');
      sendEvent('progress', 100);
      sendEvent('complete', true);
      
      return res.end();
      
    } catch (error: any) {
      console.error('Error processing chapter:', error);
      sendEvent('error', error.message || 'Failed to process chapter');
      return res.end();
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
