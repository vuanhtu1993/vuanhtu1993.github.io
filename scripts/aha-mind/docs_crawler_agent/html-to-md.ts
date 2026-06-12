/**
 * html-to-md.ts
 *
 * Convert HTML page sang Markdown chất lượng cao.
 * Có tích hợp Cloudinary để upload ảnh gốc lên cloud nhằm tránh link chết.
 */

import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";
// @ts-ignore
import { gfm } from "turndown-plugin-gfm";
import { uploadImage } from "./cloudinary-utils.js";
import { resolveUrl } from "./url-utils.js";

// Cấu hình Turndown
const turndown = new TurndownService({
  headingStyle: "atx",       // Dùng # thay vì underline style
  hr: "---",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",  // Dùng ``` thay vì indent 4 spaces
  fence: "```",
  emDelimiter: "_",
  strongDelimiter: "**",
});

// Sử dụng plugin GFM (GitHub Flavored Markdown) để format table, code block tốt hơn
turndown.use(gfm);

// Custom rule: Giữ nguyên inline code
turndown.addRule("inlineCode", {
  filter: (node) =>
    node.nodeName === "CODE" && node.parentNode?.nodeName !== "PRE",
  replacement: (content) => `\`${content}\``,
});

// Custom rule: Fenced code block fallback
// GFM xử lý <pre><code> khá tốt, nhưng nếu site chỉ dùng <pre> mà không có <code>
// thì Turndown có thể làm mất dòng.
turndown.addRule("preWithoutCode", {
  filter: (node) => node.nodeName === "PRE" && !node.querySelector("code"),
  replacement: (_content, node) => {
    // Lấy nguyên text content để giữ lại các dòng ngắt (newlines)
    const code = node.textContent || "";
    return `\n\`\`\`\n${code}\n\`\`\`\n`;
  },
});

// Custom rule: Bỏ qua các element không có nội dung hữu ích
turndown.addRule("skipEmpty", {
  filter: (node) => {
    const tag = node.nodeName.toLowerCase();
    const skip = ["script", "style", "noscript", "iframe", "svg", "form"];
    return skip.includes(tag);
  },
  replacement: () => "",
});

export interface ConvertResult {
  title: string;
  markdown: string;
  wordCount: number;
}

/**
 * Convert raw HTML string → Markdown.
 *
 * Quy trình:
 * 1. Parse HTML bằng JSDOM, dùng Readability extract phần "main content"
 * 2. Parse lại main content để tìm tất cả thẻ <img>
 * 3. Upload các ảnh lên Cloudinary và update lại `src`
 * 4. Convert DOM đã update sang Markdown
 */
export async function convertHtmlToMarkdown(html: string, url: string): Promise<ConvertResult> {
  // Bước 1: Extract content bằng Readability
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  const title = article?.title || dom.window.document.title || "Untitled";
  const contentHtml =
    article?.content ||
    dom.window.document.body?.innerHTML ||
    "<p>Không thể extract nội dung</p>";

  // Bước 2 & 3: Xử lý thẻ <img> trong contentHtml
  const contentDom = new JSDOM(contentHtml, { url });

  // --- PRE-PROCESSING DOM ---
  // Fix lỗi mất xuống dòng trong các khối code (đặc biệt Docusaurus/PrismJS)
  const pres = contentDom.window.document.querySelectorAll("pre");
  pres.forEach(pre => {
    // 1. Thêm newline vào cuối mỗi dòng token-line của PrismJS
    const tokenLines = pre.querySelectorAll(".token-line");
    tokenLines.forEach(line => {
      line.appendChild(contentDom.window.document.createTextNode("\n"));
    });
    // 2. Chuyển thẻ <br> thành \n
    const brs = pre.querySelectorAll("br");
    brs.forEach(br => br.replaceWith("\n"));
    // 3. Nếu các div con được dùng như các dòng (không phải Prism), thêm \n
    if (tokenLines.length === 0) {
      const divs = pre.querySelectorAll("div");
      divs.forEach(div => {
        div.appendChild(contentDom.window.document.createTextNode("\n"));
      });
    }
  });
  // --- KẾT THÚC PRE-PROCESSING ---

  const images = Array.from(contentDom.window.document.querySelectorAll("img"));
  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname;

  // Upload song song tất cả ảnh có trong bài
  await Promise.all(
    images.map(async (img) => {
      let src = img.getAttribute("src");
      if (!src) return;

      const absoluteUrl = resolveUrl(src, url);
      if (absoluteUrl) {
        const cloudinaryUrl = await uploadImage(absoluteUrl, domain);
        // Thay thế thuộc tính src bằng link Cloudinary
        img.setAttribute("src", cloudinaryUrl);
      }
    })
  );

  // Bước 4: Convert HTML → Markdown
  let markdown = turndown.turndown(contentDom.window.document.body.innerHTML);

  // Clean up - bỏ nhiều blank lines liên tiếp
  markdown = markdown
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const wordCount = markdown.split(/\s+/).filter(Boolean).length;

  return { title, markdown, wordCount };
}

/**
 * Tạo YAML frontmatter chuẩn cho file markdown.
 */
export function buildFrontmatter(params: {
  title: string;
  sourceUrl: string;
  crawledAt: string;
}): string {
  const safeTitle = params.title.replace(/"/g, '\\"');

  return [
    "---",
    `title: "${safeTitle}"`,
    `source_url: "${params.sourceUrl}"`,
    `crawled_at: "${params.crawledAt}"`,
    "---",
    "",
  ].join("\n");
}
