import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";
import { AhaMindState, Article } from "../state";

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

export const fetchRssNode = async (state: AhaMindState): Promise<Partial<AhaMindState>> => {
  if (!state.articleUrl) {
    console.log("[Fetcher] No articleUrl provided. Skipping.");
    return { rawArticles: [], articleToProcess: null };
  }

  console.log(`[Fetcher] Fetching exact article from ${state.articleUrl}`);
  try {
    const response = await fetch(state.articleUrl);
    const html = await response.text();

    // Parse HTML with jsdom
    const doc = new JSDOM(html, { url: state.articleUrl });
    const reader = new Readability(doc.window.document);
    const articleParsed = reader.parse();

    if (!articleParsed) {
      console.error("[Fetcher] Failed to parse article content with Readability.");
      return { rawArticles: [], articleToProcess: null };
    }

    // Convert HTML directly from readability output to Markdown text clean
    const cleanContent = turndownService.turndown(articleParsed.content);
    
    const article: Article = {
      title: articleParsed.title || "Untitled",
      link: state.articleUrl,
      content: cleanContent,
      pubDate: new Date().toISOString()
    };

    console.log(`[Fetcher] Successfully fetched and parsed article: ${article.title}`);
    return { 
      rawArticles: [article], // Keeping this for backward compatibility
      articleToProcess: article
    };
  } catch (error) {
    console.error("[Fetcher] Error fetching or parsing the article:", error);
    return { rawArticles: [], articleToProcess: null };
  }
};
