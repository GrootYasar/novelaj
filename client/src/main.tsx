import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./hooks/ThemeProvider";

// Check for pre-rendered data from static HTML
declare global {
  interface Window {
    chapterData?: {
      bookNumber: string;
      chapterNumber: string;
      chapterTitle: string;
      prevChapter: string | null;
      nextChapter: string | null;
    };
  }
}

// Hydrate the app
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);
