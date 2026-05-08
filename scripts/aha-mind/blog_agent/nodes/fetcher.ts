import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
// @ts-ignore
import TurndownService from "turndown";
import { AhaMindState, Article } from "../state";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
// @ts-ignore
const pdfParse = require("pdf-parse");
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "@napi-rs/canvas";
import * as dns from "node:dns";

// Force IPv4 first to avoid IPv6 timeout issues with Cloudflare/Medium
dns.setDefaultResultOrder("ipv4first");

const STANDARD_FONT_DATA_URL = path.join(process.cwd(), "node_modules", "pdfjs-dist", "standard_fonts") + "/";

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Đảm bảo Turndown không bỏ qua thẻ img
turndownService.addRule('img', {
  filter: 'img',
  replacement: function (content, node: any) {
    const src = node.getAttribute('src');
    const alt = node.getAttribute('alt') || '';
    const title = node.getAttribute('title') || '';
    const titlePart = title ? ` "${title}"` : '';
    return src ? `![${alt}](${src}${titlePart})` : '';
  }
});

// ============================================================
// PDF HELPERS
// ============================================================

/**
 * Nhận biết URL trỏ đến file PDF.
 * Xử lý cả dạng: report.pdf | report.pdf?v=2 | report.PDF
 */
const isPdfSource = (url: string): boolean => {
  const lower = url.toLowerCase().split("?")[0].split("#")[0];
  return lower.endsWith(".pdf");
};

/**
 * Kiểm tra canvas có "trắng" không (>98% pixel sáng).
 * Dùng để skip các trang không có nội dung visual.
 */
const isCanvasBlank = (data: Uint8ClampedArray, width: number, height: number): boolean => {
  const totalPixels = width * height;
  let lightPixels = 0;
  for (let i = 0; i < data.length; i += 4) {
    // Pixel được coi là "sáng/trắng" nếu R, G, B đều > 240
    if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
      lightPixels++;
    }
  }
  return lightPixels / totalPixels > 0.98;
};

/**
 * Render từng trang PDF thành PNG và lưu vào outputDir.
 * Chỉ lưu những trang có nội dung visual thực sự (skip trang trắng).
 * @returns Danh sách relative paths (./assets/...) để nhúng vào Markdown
 */
const extractPdfImages = async (
  buffer: Buffer,
  outputDir: string,
  sourceUrl: string
): Promise<string[]> => {
  console.log("[Fetcher/PDF] Starting page rendering...");

  // pdfjs cần Uint8Array, không phải Buffer
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    standardFontDataUrl: STANDARD_FONT_DATA_URL,
  });
  const pdf = await loadingTask.promise;

  const imagePaths: string[] = [];
  const SCALE = 2.0; // 2x resolution — đủ sắc nét cho charts và text nhỏ

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: SCALE });

      // Tạo canvas Node.js (tương đương browser canvas)
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext("2d");

      // Đặt nền trắng trước khi render
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, viewport.width, viewport.height);

      await page.render({
        canvasContext: context as any,
        viewport,
      }).promise;

      // Lấy pixel data để kiểm tra trang có nội dung không
      const imageData = context.getImageData(0, 0, viewport.width, viewport.height);
      if (isCanvasBlank(imageData.data, viewport.width, viewport.height)) {
        console.log(`[Fetcher/PDF] Page ${pageNum}: blank, skipping.`);
        continue;
      }

      // Đặt tên file với hash để chống trùng lặp
      const hash = crypto
        .createHash("md5")
        .update(`${sourceUrl}-page-${pageNum}`)
        .digest("hex")
        .slice(0, 8);
      const fileName = `pdf-${hash}-p${pageNum}.png`;
      const filePath = path.join(outputDir, fileName);

      // Xuất PNG
      const pngBuffer = canvas.toBuffer("image/png");
      fs.writeFileSync(filePath, pngBuffer);
      imagePaths.push(`./assets/${fileName}`);

      console.log(`[Fetcher/PDF] Rendered page ${pageNum} → ${fileName}`);
    } catch (pageError) {
      console.error(`[Fetcher/PDF] Error rendering page ${pageNum}:`, (pageError as Error).message);
    }
  }

  console.log(`[Fetcher/PDF] Total pages rendered: ${imagePaths.length}/${pdf.numPages}`);
  return imagePaths;
};

/**
 * Trích xuất title từ PDF metadata, fallback về tên file trong URL.
 */
const extractPdfTitle = (info: Record<string, any>, url: string): string => {
  if (info?.Title && typeof info.Title === "string" && info.Title.trim().length > 0) {
    return info.Title.trim();
  }
  // Lấy tên file từ URL, bỏ đuôi .pdf
  const filename = url.split("/").pop() || "document";
  return decodeURIComponent(filename.replace(/\.pdf$/i, "").replace(/[-_]/g, " "));
};

/**
 * Main PDF fetcher: download + extract text + render images song song.
 * @returns Article object hoặc null nếu fetch thất bại
 */
const fetchPdfContent = async (url: string): Promise<Article | null> => {
  console.log(`[Fetcher/PDF] Downloading: ${url}`);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/pdf,*/*;q=0.8"
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} when fetching PDF`);
  }

  // Double-check Content-Type để tránh nhầm lẫn với HTML redirect
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("pdf") && !url.toLowerCase().endsWith(".pdf")) {
    console.warn("[Fetcher/PDF] Server không trả về Content-Type PDF. Fallback sang HTML parser.");
    return null;
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  console.log(`[Fetcher/PDF] Downloaded ${(buffer.length / 1024).toFixed(1)} KB`);

  // Chuẩn bị output directory (tương tự HTML flow)
  const outputDir = path.join(process.cwd(), "blog", "aha-mind", "assets");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Chạy SONG SONG: extract text + render pages thành ảnh
  const [textData, imagePaths] = await Promise.all([
    pdfParse(buffer),
    extractPdfImages(buffer, outputDir, url),
  ]);

  // Sanitize raw text to prevent MDX compilation errors (escape <, >, {, })
  const sanitizedText = textData.text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");

  // Build content: text + image references ở cuối
  // LLM sẽ thấy cả text và biết có ảnh đính kèm
  const imageSection = imagePaths.length > 0
    ? "\n\n---\n\n## 📸 Hình ảnh từ tài liệu\n\n" +
    imagePaths.map((p, i) => `![Trang ${i + 1}](${p})`).join("\n\n")
    : "";

  const fullContent = sanitizedText.trim() + imageSection;

  const article: Article = {
    title: extractPdfTitle(textData.info, url),
    link: url,
    content: fullContent,
    pubDate: new Date().toISOString(),
  };

  console.log(
    `[Fetcher/PDF] ✅ Done: "${article.title}" | ${textData.numpages} pages | ${imagePaths.length} images extracted`
  );

  return article;
};

// ============================================================
// MAIN FETCHER NODE (Smart Router)
// ============================================================

export const fetchRssNode = async (state: AhaMindState): Promise<Partial<AhaMindState>> => {
  if (!state.articleUrl) {
    console.log("[Fetcher] No articleUrl provided. Skipping.");
    return { rawArticles: [], articleToProcess: null };
  }

  console.log(`[Fetcher] Processing: ${state.articleUrl}`);

  try {
    // ── PDF BRANCH ──────────────────────────────────────────
    if (isPdfSource(state.articleUrl)) {
      console.log("[Fetcher] Detected PDF source → switching to PDF pipeline.");
      const article = await fetchPdfContent(state.articleUrl);

      if (article) {
        return { rawArticles: [article], articleToProcess: article };
      }

      // fetchPdfContent trả null → Content-Type không phải PDF
      // Tiếp tục xuống HTML fallback bên dưới
      console.warn("[Fetcher] PDF parse returned null, attempting HTML fallback...");
    }

    // ── HTML BRANCH (logic gốc, không thay đổi) ─────────────
    console.log(`[Fetcher] Fetching exact article from ${state.articleUrl}`);

    let response;
    let html = "";
    let isJinaFallback = false;

    try {
      response = await fetch(state.articleUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5"
        },
        // @ts-ignore - undici/fetch supports signal
        signal: AbortSignal.timeout(15000)
      });

      // Force Jina for Medium even if fetch succeeds, because direct fetch often returns incomplete content/paywall
      if (state.articleUrl.includes("medium.com")) {
        console.log("[Fetcher] Medium detected. Forcing Jina Reader for better extraction...");
        throw new Error("Force Jina for Medium");
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      html = await response.text();
    } catch (fetchError: any) {
      console.warn(`[Fetcher] Direct fetch failed: ${fetchError.message}. Attempting Jina Reader fallback...`);

      const jinaUrl = `https://r.jina.ai/${state.articleUrl}`;
      const jinaResponse = await fetch(jinaUrl, {
        headers: { "X-Return-Format": "html" } // Request HTML to keep pipeline compatibility
      });

      if (!jinaResponse.ok) {
        throw new Error(`Both direct fetch and Jina fallback failed. (Jina: ${jinaResponse.status})`);
      }

      html = await jinaResponse.text();
      isJinaFallback = true;
      console.log("[Fetcher] Successfully fetched content via Jina Reader.");
    }

    // Parse HTML with jsdom
    const doc = new JSDOM(html, { url: state.articleUrl });
    const reader = new Readability(doc.window.document);
    const articleParsed = reader.parse();

    if (!articleParsed) {
      console.error("[Fetcher] Failed to parse article content with Readability.");
      return { rawArticles: [], articleToProcess: null };
    }

    // Phân tích nội dung đã được lọc để kiếm ảnh và download
    const contentDoc = new JSDOM(articleParsed.content || "", { url: state.articleUrl });
    const images = contentDoc.window.document.querySelectorAll("img");
    console.log(`[Fetcher] Processing ${images.length} image tags in DOM...`);

    if (images.length > 0) {
      const outputDir = path.join(process.cwd(), "blog", "aha-mind", "assets");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      for (let i = 0; i < images.length; i++) {
        const img = images[i];

        // Ưu tiên các attribue chuẩn của Lazyload (data-src, data-original) trước khi móc src
        let originalSrc = img.getAttribute("data-src") || img.getAttribute("data-original") || img.getAttribute("src") || img.getAttribute("srcset");

        if (!originalSrc) {
          console.warn(`[Fetcher] Image ${i} has no src/data-src, skipping.`);
          continue;
        }

        let parsedSrc = originalSrc;
        // Bóc URL đầu tiên nếu thẻ chứa cấu trúc srcset (phân tách bởi khoảng trắng)
        // Regex bóc nguyên cụm ký tự không chứa dấu cách đầu tiên. Giữ được data: URIs và URL chứa dấu phẩy (như Substack CDN).
        const match = originalSrc.trim().match(/^(\S+)/);
        if (match) {
          parsedSrc = match[1];
        }
        // Gỡ dấu phẩy dư thừa ở đuôi nếu HTML web dởm
        if (parsedSrc.endsWith(',')) {
          parsedSrc = parsedSrc.slice(0, -1);
        }

        let absoluteUrl = "";
        try {
          // Resolve dạng tuyệt đối
          absoluteUrl = new URL(parsedSrc, state.articleUrl).href;

          const imgResponse = await fetch(absoluteUrl);
          if (!imgResponse.ok) throw new Error(`HTTP ${imgResponse.status}`);

          const arrayBuffer = await imgResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          if (buffer.length < 500) {
            // Thường là icon hoặc ảnh lỗi (như trường hợp 990 bytes) -> Bỏ qua để đỡ rác
            console.warn(`[Fetcher] Image ${i} too small (${buffer.length} bytes), skipping.`);
            img.remove();
            continue;
          }

          // Xác định extension file
          const contentType = imgResponse.headers.get("content-type") || "";
          let ext = ".jpg";
          if (contentType.includes("png")) ext = ".png";
          else if (contentType.includes("gif")) ext = ".gif";
          else if (contentType.includes("webp")) ext = ".webp";
          else if (contentType.includes("svg")) ext = ".svg";

          // Mã hoá tên file để chống trùng lặp
          const hash = crypto.createHash("md5").update(absoluteUrl).digest("hex").slice(0, 8);
          const fileName = `img-${hash}${ext}`;
          const filePath = path.join(outputDir, fileName);

          fs.writeFileSync(filePath, buffer);

          // Inject đường dẫn cục bộ ngược lại cho Docusaurus
          img.setAttribute("src", `./assets/${fileName}`);

          // Dọn dẹp thuộc tính nhiễu
          img.removeAttribute("srcset");
          img.removeAttribute("data-src");
          img.removeAttribute("data-original");
          img.removeAttribute("loading");

          console.log(`[Fetcher] Downloaded image: ${fileName}`);
        } catch (imgError) {
          console.error(`[Fetcher] Lỗi tải ảnh (${parsedSrc}):`, (imgError as Error).message);

          // QUAN TRỌNG: Nếu ảnh lỗi tải về & không inject được `./assets/...` 
          // phải thiết lập nó về dạng tuyệt đối hoặc gỡ thẻ để Docusaurus ko báo lỗi "Module not found" lúc dev rỗng.
          if (absoluteUrl && absoluteUrl.startsWith("http")) {
            img.setAttribute("src", absoluteUrl);
          } else {
            img.remove();
          }
        }
      }
    }

    // Convert sang Markdown từ DOM đã xử lý
    let cleanContent = turndownService.turndown(contentDoc.window.document.body);
    
    // Xử lý các rác từ Jina Reader hoặc Medium
    cleanContent = cleanContent
      .replace(/Press enter or click to view image in full size/gi, "")
      .replace(/\n{3,}/g, "\n\n") // Xử lý xuống hàng dư thừa
      .trim();
    
    console.log(`[Fetcher] Markdown content length: ${cleanContent.length}`);
    const imgCountInMd = (cleanContent.match(/!\[/g) || []).length;
    console.log(`[Fetcher] Found ${imgCountInMd} images in final Markdown.`);

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
