/**
 * mdx_exporter.ts — Node 6: MDX Exporter
 * ==========================================
 * Tạo file MDX hoàn chỉnh theo chuẩn Docusaurus từ bản dịch tiếng Việt.
 * Đặt tên file theo khoảng trang (PageRange) để không bị ghi đè.
 *
 * Output structure:
 * blog/aha-interpreter/<book-slug>/
 *   ├── pages-1-10.mdx
 *   └── ...
 */

import * as fs from "fs";
import * as path from "path";
import { InterpreterState } from "../state";
import { OUTPUT_DIR, MDX_CONFIG } from "../config";
import { cleanMarkdown } from "./md_cleaner";

// ─── MDX Generation ───────────────────────────────────────────────────────────

/**
 * Tạo YAML frontmatter theo chuẩn Docusaurus.
 */
function buildFrontmatter(params: {
  slug: string;
  startPage: number;
  endPage: number;
  chapterTitle: string;
  bookTitle: string;
  date: string;
}): string {
  const { slug, startPage, endPage, chapterTitle, bookTitle, date } = params;
  const pageRangeStr = endPage === Infinity ? `${startPage}-end` : `${startPage}-${endPage}`;
  const fullSlug = `${MDX_CONFIG.SLUG_PREFIX}-${slug}-pages-${pageRangeStr}`;
  const tagsYaml = MDX_CONFIG.DEFAULT_TAGS.map(t => `  - ${t}`).join("\n");
  const authorsYaml = MDX_CONFIG.AUTHORS.map(a => `  - ${a}`).join("\n");

  return `---
slug: ${fullSlug}
title: "[${bookTitle}] ${chapterTitle}"
date: ${date}
authors:
${authorsYaml}
tags:
${tagsYaml}
---`;
}

/**
 * Tạo attribution block — nguồn gốc bài viết.
 */
function buildAttribution(bookTitle: string, originalAuthor: string, isTranslated: boolean): string {
  const sourceText = isTranslated
    ? `Đây là bản dịch tiếng Việt của **"${bookTitle}"** (Tác giả: ${originalAuthor}).\nBài được dịch tự động bởi **Aha! Mind Interpreter** — pipeline dịch sách kỹ thuật sử dụng Gemini Flash.\n\n⚠️ *Bản dịch tự động — có thể có lỗi. Vui lòng đối chiếu với bản gốc tiếng Anh khi cần độ chính xác cao.*`
    : `Đây là nội dung được trích xuất từ **"${bookTitle}"** (Tác giả: ${originalAuthor}).\nBài được extract tự động bởi **Aha! Mind Interpreter**.`;

  return `:::info 📚 Về bài viết này
${sourceText}
:::`;
}

/**
 * Escape các ký tự đặc biệt trong frontmatter string value.
 */
function escapeFrontmatterString(str: string): string {
  return str.replace(/"/g, '\\"');
}

/**
 * Sanitize nội dung trước khi ghi vào MDX.
 *
 * Vấn đề: MDX dùng JSX syntax. Các HTML void elements như <br>, <hr>, <img>
 * PHẢI được viết dạng self-closing (<br/>, <hr/>, <img/>) — ngược lại Docusaurus
 * sẽ throw "Expected a closing tag" error khi build.
 *
 * Nguồn gốc: pymupdf4llm extract table cells có <br> từ PDF layout,
 * masker.ts bỏ qua (không có attribute), LLM giữ nguyên → lỗi MDX.
 */
function sanitizeMdxContent(content: string): string {
  // Danh sách HTML void elements phổ biến cần self-close trong JSX
  const voidElements = ["br", "hr", "img", "input", "meta", "link", "area", "base", "col", "embed", "param", "source", "track", "wbr"];
  const voidPattern = new RegExp(
    `<(${voidElements.join("|")})(\\s[^>]*)?>(?!</)`,
    "gi"
  );
  // <br> → <br/>  |  <hr class="x"> → <hr class="x"/>
  return content.replace(voidPattern, (match, tag, attrs) => {
    const cleanAttrs = attrs ?? "";
    return `<${tag}${cleanAttrs}/>`;
  });
}

// ─── Main Node ────────────────────────────────────────────────────────────────

export const mdxExporterNode = async (
  state: InterpreterState
): Promise<Partial<InterpreterState>> => {
  const chapter = state.chapters[state.currentChapterIndex];

  if (!state.translatedContent || !chapter) {
    console.log("[Exporter] ⚠️ Không có nội dung để xuất.");
    return {};
  }

  const { bookMetadata, pageRange } = state;
  const today = new Date().toISOString().split("T")[0];

  console.log(`\n[Exporter] 📝 Tạo MDX cho: "${chapter.title}"`);

  // ── Sanitize nội dung — fix HTML void elements thành JSX-compatible ──
  const sanitizedContent = sanitizeMdxContent(state.translatedContent);
  // ── Làm sạch markdown ──
  const finalContent = cleanMarkdown(sanitizedContent);

  // ── Build MDX components ──
  const frontmatter = buildFrontmatter({
    slug: bookMetadata.slug,
    startPage: pageRange.start,
    endPage: pageRange.end,
    chapterTitle: escapeFrontmatterString(chapter.title),
    bookTitle: escapeFrontmatterString(bookMetadata.title),
    date: today,
  });

  const attribution = buildAttribution(bookMetadata.title, bookMetadata.originalAuthor, state.shouldTranslate);

  // ── Assemble full MDX ──
  const mdxContent = `${frontmatter}

${attribution}

<!-- truncate -->

${finalContent}

---

*Made by Anh Tu - Share to be share*
`;

  // ── Write to file ──
  const bookDir = path.join(OUTPUT_DIR, bookMetadata.slug);
  if (!fs.existsSync(bookDir)) {
    fs.mkdirSync(bookDir, { recursive: true });
    console.log(`[Exporter] 📁 Tạo thư mục: ${bookDir}`);
  }

  const pageRangeStr = pageRange.end === Infinity ? `${pageRange.start}-end` : `${pageRange.start}-${pageRange.end}`;
  const fileName = `pages-${pageRangeStr}.mdx`;
  const filePath = path.join(bookDir, fileName);

  fs.writeFileSync(filePath, mdxContent, "utf-8");

  console.log(`[Exporter] ✅ Đã ghi: ${filePath}`);
  console.log(`[Exporter] Kích thước file: ${(mdxContent.length / 1024).toFixed(1)} KB`);

  return {
    finalMdxContent: mdxContent,
    processedChapters: [filePath],
  };
};
