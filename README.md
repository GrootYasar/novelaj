# Chinese Novel Translator

A web application that translates Chinese novels from 69shuba.com to English, with features for static HTML generation, streaming API responses, and theme toggle functionality.

## Features

- Translate Chinese novel chapters from 69shuba.com
- Real-time streaming translation with progress updates
- Dark/light theme toggle
- Static HTML generation for chapter permalinks
- Responsive design for all devices
- Optional Supabase integration for caching translations

## Setting Up Environment Variables

For the application to work properly, you'll need to set up the following environment variables in your Vercel project:

- `GEMINI_API_KEY`: Required for translation functionality (Google Generative AI API)
- `SUPABASE_URL`: Optional for caching translations
- `SUPABASE_ANON_KEY`: Optional for caching translations

## Deploying to Vercel

1. Fork this repository or push it to your GitHub account
2. Create a new project in Vercel and link to your repository
3. Set up the required environment variables in the Vercel dashboard
4. Deploy the project

The application will automatically generate static HTML files for each translated chapter, making it SEO-friendly and fast to load.

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your API keys:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=your_supabase_url (optional)
   SUPABASE_ANON_KEY=your_supabase_anon_key (optional)
   ```
4. Run the development server: `npm run dev`
5. Open [http://localhost:5000](http://localhost:5000) in your browser

## How it Works

1. A user enters a URL from 69shuba.com
2. The server fetches the Chinese content and extracts the novel text
3. The text is translated using Google's Generative AI (Gemini)
4. The translation is streamed back to the client in real-time
5. The client displays the translation with navigation links
6. The server generates a static HTML file for the translated chapter
7. Users can share permalinks to specific chapters

## Technology Stack

- Frontend: React, Tailwind CSS, shadcn/ui components
- Backend: Express.js, Node.js
- Translation: Google Generative AI (Gemini)
- Optional Database: Supabase (PostgreSQL)
- Deployment: Vercel