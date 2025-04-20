'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [chapter, setChapter] = useState({ chapterTitle: '', translatedContent: '', prevChapter: '', nextChapter: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) {
      setError('Please enter a chapter URL');
      return;
    }
    console.log('Submitting URL:', url);
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/translate-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      console.log('API Response:', data);
      if (data.error) throw new Error(data.error);
      setChapter(data);
    } catch (err) {
      console.log('API Error:', err.message);
      setError(err.message);
    }
    setLoading(false);
  };

  const handleNavigation = (newUrl) => {
    console.log('Navigating to:', newUrl);
    setUrl(newUrl);
  };

  useEffect(() => {
    if (url) {
      console.log('URL changed, fetching:', url);
      handleSubmit({ preventDefault: () => {} });
    }
  }, [url]);

  return (
    <>
      <header>
        <h1>Novel Translator</h1>
      </header>
      <main>
        <div className="input-form">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter chapter URL (e.g., https://www.69shuba.com/txt/84418/40150610)"
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Load Chapter'}
              </button>
            </div>
          </form>
        </div>
        {error && <p className="error">{error}</p>}
        {chapter.chapterTitle && (
          <div className="chapter-container">
            <h1 className="chapter-title">{chapter.chapterTitle}</h1>
            <div className="chapter-content" dangerouslySetInnerHTML={{ __html: chapter.translatedContent }} />
            <div className="nav-buttons">
              {chapter.prevChapter && (
                <button onClick={() => handleNavigation(chapter.prevChapter)} className="prev-btn">
                  Previous Chapter
                </button>
              )}
              {chapter.nextChapter && (
                <button onClick={() => handleNavigation(chapter.nextChapter)} className="next-btn">
                  Next Chapter
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}