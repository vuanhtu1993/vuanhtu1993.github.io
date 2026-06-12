/**
 * crawler.ts
 *
 * Core crawling engine — trái tim của Documentation Crawler Agent.
 *
 * Strategy: BFS (Breadth-First Search) sequential crawl.
 *
 * WHY BFS thay vì DFS?
 * - BFS crawl theo từng "layer" (cùng depth), đảm bảo các trang
 *   quan trọng (gần root) được crawl trước nếu đạt maxPages.
 * - Với docs site, trang index thường link đến section, section link đến sub-pages.
 *   BFS capture được cả structure này theo đúng thứ tự ưu tiên.
 *
 * WHY Sequential (tuần tự) thay vì Parallel?
 * - An toàn hơn: Không trigger rate limiting của server
 * - Lịch sự hơn: Không làm server bị quá tải
 * - Đủ nhanh: Hầu hết docs site vài trăm trang, sequential vẫn hoàn thành trong vài phút
 */

import { chromium, Browser, Page } from "playwright";
import {
  CrawlScope,
  parseCrawlScope,
  normalizeUrl,
  isInScope,
  isStaticAsset,
  resolveUrl,
} from "./url-utils.js";
import { convertHtmlToMarkdown } from "./html-to-md.js";
import { savePage } from "./file-writer.js";

export interface CrawlOptions {
  startUrl: string;         // URL bắt đầu crawl
  outputDir: string;        // Thư mục lưu output
  maxPages?: number;        // Giới hạn số trang (default: 200)
  delayMs?: number;         // Delay giữa requests ms (default: 800ms)
  timeout?: number;         // Page load timeout ms (default: 15000)
}

export interface CrawlProgress {
  current: number;          // Số trang đã crawl
  total: number;            // Số trang trong queue
  currentUrl: string;       // URL đang crawl
  savedPath?: string;       // Path file vừa lưu
  skipped?: boolean;        // Trang này bị skip (error, out of scope, etc.)
  error?: string;           // Lỗi nếu có
}

export type ProgressCallback = (progress: CrawlProgress) => void;

export interface CrawlResult {
  startUrl: string;
  totalCrawled: number;
  totalSkipped: number;
  outputDir: string;
  duration: number;           // milliseconds
  crawledUrls: string[];
  errors: { url: string; error: string }[];
}

/**
 * Main crawl function.
 *
 * Quy trình:
 * 1. Launch Playwright Chromium (headless)
 * 2. Parse scope từ startUrl
 * 3. BFS queue: visit page → extract links → add in-scope links to queue
 * 4. Với mỗi page: convert HTML → Markdown → save .md file
 * 5. Report progress qua callback
 * 6. Dừng khi queue rỗng hoặc đạt maxPages
 */
export async function crawl(
  options: CrawlOptions,
  onProgress?: ProgressCallback
): Promise<CrawlResult> {
  const {
    startUrl,
    outputDir,
    maxPages = 200,
    delayMs = 800,
    timeout = 15000,
  } = options;

  const startTime = Date.now();
  const scope: CrawlScope = parseCrawlScope(startUrl);

  // BFS data structures
  const queue: string[] = [normalizeUrl(startUrl)];
  const visited = new Set<string>();
  const crawledUrls: string[] = [];
  const errors: { url: string; error: string }[] = [];

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Launch browser headless (không hiện UI)
    // WHY Playwright thay vì fetch?
    // Playwright render JavaScript → capture SPA (React/Vue/Next.js docs)
    // và bypass nhiều Cloudflare challenges
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        // User agent thực tế để tránh bị block
      ],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      // Ignore HTTPS certificate errors
      ignoreHTTPSErrors: true,
    });

    page = await context.newPage();

    // Block unnecessary resources để crawl nhanh hơn
    // WHY: Docs chỉ cần HTML content, không cần ảnh/font/analytics
    await page.route("**/*", (route) => {
      const resourceType = route.request().resourceType();
      const BLOCK_TYPES = ["image", "media", "font", "stylesheet"];
      if (BLOCK_TYPES.includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });

    let crawledCount = 0;
    let skippedCount = 0;

    while (queue.length > 0 && crawledCount < maxPages) {
      const url = queue.shift()!;

      // Skip nếu đã visit
      if (visited.has(url)) continue;
      visited.add(url);

      // Skip static assets
      if (isStaticAsset(url)) {
        skippedCount++;
        continue;
      }

      // Report progress
      crawledCount++;
      onProgress?.({
        current: crawledCount,
        total: Math.min(visited.size + queue.length, maxPages),
        currentUrl: url,
      });

      try {
        // Navigate đến page với timeout
        await page.goto(url, {
          waitUntil: "domcontentloaded", // Không chờ tất cả resources load
          timeout,
        });

        // Chờ thêm để JavaScript render xong (cần cho SPA)
        // WHY networkidle: Đợi không còn network request nào → đảm bảo content đã render
        await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {
          // Timeout networkidle là OK, vẫn tiếp tục
        });

        // Lấy HTML sau khi JS đã render
        const html = await page.content();

        // Convert HTML → Markdown (có xử lý upload ảnh Cloudinary)
        const { title, markdown, wordCount } = await convertHtmlToMarkdown(html, url);

        // Skip trang không có nội dung thực sự (< 50 words)
        if (wordCount < 50) {
          skippedCount++;
          onProgress?.({
            current: crawledCount,
            total: Math.min(visited.size + queue.length, maxPages),
            currentUrl: url,
            skipped: true,
          });
          continue;
        }

        // Lưu file markdown
        const crawledAt = new Date().toISOString();
        const savedPath = savePage({ outputDir, url, title, markdown, crawledAt });
        crawledUrls.push(url);

        onProgress?.({
          current: crawledCount,
          total: Math.min(visited.size + queue.length, maxPages),
          currentUrl: url,
          savedPath,
        });

        // Extract tất cả links từ trang hiện tại
        const links = await extractLinks(page, url);

        // Filter và add vào queue
        for (const link of links) {
          const normalized = normalizeUrl(link);
          if (!visited.has(normalized) && isInScope(normalized, scope)) {
            queue.push(normalized);
          }
        }

        // Delay lịch sự giữa các request
        // WHY delay? Tránh bị coi là bot và bị block bởi server
        await sleep(delayMs);

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        errors.push({ url, error: errorMsg });
        skippedCount++;

        onProgress?.({
          current: crawledCount,
          total: Math.min(visited.size + queue.length, maxPages),
          currentUrl: url,
          skipped: true,
          error: errorMsg,
        });
      }
    }

    return {
      startUrl,
      totalCrawled: crawledUrls.length,
      totalSkipped: skippedCount,
      outputDir,
      duration: Date.now() - startTime,
      crawledUrls,
      errors,
    };

  } finally {
    // Luôn đóng browser dù có lỗi hay không
    await browser?.close();
  }
}

/**
 * Extract tất cả href links từ page hiện tại.
 * WHY dùng page.evaluate: Chạy code trực tiếp trong browser context
 * để access DOM sau khi JavaScript đã render.
 */
async function extractLinks(page: Page, baseUrl: string): Promise<string[]> {
  const hrefs = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll("a[href]"));
    return anchors.map((a) => (a as HTMLAnchorElement).href);
  });

  // Resolve relative URLs và filter invalid
  return hrefs
    .map((href) => resolveUrl(href, baseUrl))
    .filter((url): url is string => url !== null);
}

/** Simple sleep/delay helper */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
