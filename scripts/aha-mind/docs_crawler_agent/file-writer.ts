/**
 * file-writer.ts
 *
 * Module lưu nội dung markdown ra filesystem, tổ chức theo cấu trúc URL.
 *
 * WHY tổ chức theo folder structure của URL?
 * - Dễ navigate: Cấu trúc file phản ánh đúng cấu trúc website
 * - Dễ reference sau này: Biết ngay file nào tương ứng URL nào
 * - Tránh conflict: Mỗi URL map duy nhất sang 1 filepath
 */

import fs from "fs";
import path from "path";
import { urlToFilePath } from "./url-utils.js";
import { buildFrontmatter } from "./html-to-md.js";

export interface SaveOptions {
  outputDir: string;  // Thư mục gốc để lưu output
  url: string;        // URL nguồn
  title: string;      // Title của trang
  markdown: string;   // Nội dung markdown đã convert
  crawledAt: string;  // Timestamp crawl (ISO string)
}

/**
 * Lưu một trang đã crawl thành file .md.
 *
 * Ví dụ:
 *   outputDir = "./output"
 *   url = "https://docs.example.com/guide/setup"
 *   → Lưu vào "./output/docs.example.com/guide/setup.md"
 *
 * @returns Absolute path của file đã lưu
 */
export function savePage(options: SaveOptions): string {
  const { outputDir, url, title, markdown, crawledAt } = options;

  // Convert URL → relative file path
  const relativePath = urlToFilePath(url);
  const absolutePath = path.join(outputDir, relativePath);

  // Tạo thư mục cha nếu chưa tồn tại
  // WHY recursive: Có thể cần tạo nhiều cấp thư mục cùng lúc
  const dir = path.dirname(absolutePath);
  fs.mkdirSync(dir, { recursive: true });

  // Build nội dung file: frontmatter + content
  const frontmatter = buildFrontmatter({ title, sourceUrl: url, crawledAt });
  const fileContent = `${frontmatter}\n${markdown}\n`;

  // Ghi file với encoding UTF-8 (quan trọng cho tiếng Việt và unicode)
  fs.writeFileSync(absolutePath, fileContent, "utf8");

  return absolutePath;
}

/**
 * List tất cả file .md đã crawl trong một thư mục output.
 * Dùng cho MCP tool `list_crawled_docs`.
 */
export function listCrawledFiles(outputDir: string): string[] {
  if (!fs.existsSync(outputDir)) return [];

  const results: string[] = [];

  function walkDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.endsWith(".md")) {
        // Trả về relative path so với outputDir
        results.push(path.relative(outputDir, fullPath));
      }
    }
  }

  walkDir(outputDir);
  return results.sort();
}

/**
 * Đọc metadata từ file .md đã lưu (parse YAML frontmatter).
 * WHY: Giúp kiểm tra lại những gì đã crawl mà không cần re-fetch.
 */
export function readPageMetadata(filePath: string): {
  title?: string;
  sourceUrl?: string;
  crawledAt?: string;
} | null {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    if (!content.startsWith("---")) return null;

    const endOfFrontmatter = content.indexOf("\n---", 3);
    if (endOfFrontmatter === -1) return null;

    const frontmatter = content.slice(3, endOfFrontmatter);
    const metadata: Record<string, string> = {};

    for (const line of frontmatter.split("\n")) {
      const match = line.match(/^(\w+):\s*"(.+)"$/);
      if (match) {
        metadata[match[1]] = match[2];
      }
    }

    return {
      title: metadata.title,
      sourceUrl: metadata.source_url,
      crawledAt: metadata.crawled_at,
    };
  } catch {
    return null;
  }
}
