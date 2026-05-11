import * as dns from "node:dns";
import { AhaMindState } from "../state";
import { isPdfSource, fetchPdfContent } from "../utils/pdf-helper";
import { fetchHtmlContent } from "../utils/html-helper";

// Force IPv4 first to avoid IPv6 timeout issues
dns.setDefaultResultOrder("ipv4first");

/**
 * MAIN FETCHER NODE (Smart Router)
 * Phân phối nhiệm vụ cho PDF-Helper hoặc HTML-Helper
 */
export const fetchRssNode = async (state: AhaMindState): Promise<Partial<AhaMindState>> => {
  if (!state.articleUrl) {
    console.log("[Fetcher] No articleUrl provided. Skipping.");
    return { rawArticles: [], articleToProcess: null };
  }

  console.log(`[Fetcher] Processing: ${state.articleUrl}`);

  try {
    let article = null;

    if (isPdfSource(state.articleUrl)) {
      console.log("[Fetcher] Detected PDF source → switching to PDF pipeline.");
      article = await fetchPdfContent(state.articleUrl);
    } 
    
    // Nếu không phải PDF hoặc PDF fetch thất bại, thử HTML pipeline
    if (!article) {
      console.log(`[Fetcher] Fetching article from ${state.articleUrl} via HTML pipeline...`);
      article = await fetchHtmlContent(state.articleUrl);
    }

    if (!article) {
      console.error("[Fetcher] Failed to fetch or parse article content.");
      return { rawArticles: [], articleToProcess: null };
    }

    console.log(`[Fetcher] Successfully processed article: ${article.title}`);
    return {
      rawArticles: [article],
      articleToProcess: article
    };
  } catch (error) {
    console.error("[Fetcher] Critical error during fetching:", (error as Error).message);
    return { rawArticles: [], articleToProcess: null };
  }
};