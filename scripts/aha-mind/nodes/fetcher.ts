import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
// @ts-ignore
import TurndownService from "turndown";
import { AhaMindState, Article } from "../state";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

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

    // Phân tích nội dung đã được lọc để kiếm ảnh và download
    const contentDoc = new JSDOM(articleParsed.content || "", { url: state.articleUrl });
    const images = contentDoc.window.document.querySelectorAll("img");

    if (images.length > 0) {
      const outputDir = path.join(process.cwd(), "blog", "aha-mind", "assets");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      console.log(`[Fetcher] Found ${images.length} images. Downloading to local...`);
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        
        // Ưu tiên các attribue chuẩn của Lazyload (data-src, data-original) trước khi móc src
        let originalSrc = img.getAttribute("data-src") || img.getAttribute("data-original") || img.getAttribute("src") || img.getAttribute("srcset");
        
        if (!originalSrc) continue;

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
          
          if (buffer.length === 0) throw new Error("Empty image buffer");

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

    // Convert HTML trực tiếp từ DOM đã sửa đổi sang Markdown
    const cleanContent = turndownService.turndown(contentDoc.window.document.body.innerHTML);

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
