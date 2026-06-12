/**
 * url-utils.ts
 *
 * Các hàm tiện ích xử lý URL cho Docs Crawler Agent.
 *
 * WHY: Crawl đúng phạm vi là bài toán cốt lõi. Nếu không filter chặt,
 * agent sẽ bị "lạc" ra ngoài docs sang blog, marketing page, v.v.
 */

export interface CrawlScope {
  domain: string;       // ví dụ: "docs.example.com"
  basePath: string;     // ví dụ: "/guide" (path prefix cần crawl trong)
  protocol: string;     // "https:" hoặc "http:"
}

/**
 * Parse URL gốc để xác định phạm vi crawl.
 * Ví dụ: "https://docs.example.com/guide/intro" → { domain, basePath: "/guide", protocol }
 *
 * WHY dùng basePath level-1: Nếu URL gốc là /guide/intro, ta crawl /guide/** chứ không
 * chỉ /guide/intro/**. Mục tiêu là lấy toàn bộ section "guide", không phải chỉ 1 trang.
 */
export function parseCrawlScope(startUrl: string): CrawlScope {
  const parsed = new URL(startUrl);
  const pathParts = parsed.pathname.split("/").filter(Boolean); // bỏ empty string

  // Lấy segment đầu tiên của path làm basePath
  // ví dụ: /docs/guide → basePath = "/docs"
  // ví dụ: /docs → basePath = "/docs"
  // ví dụ: / → basePath = "/"
  const basePath = pathParts.length > 0 ? `/${pathParts[0]}` : "/";

  return {
    domain: parsed.hostname,
    basePath,
    protocol: parsed.protocol,
  };
}

/**
 * Normalize URL: bỏ fragment (#section), bỏ trailing slash, lowercase scheme+host.
 * WHY: Tránh duplicate khi cùng 1 page có nhiều cách viết URL khác nhau.
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Bỏ fragment (#...) vì chỉ là anchor trên cùng 1 page
    parsed.hash = "";
    // Bỏ trailing slash (trừ root path "/")
    if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Kiểm tra URL có nằm trong phạm vi crawl không.
 *
 * Rules:
 * 1. Phải cùng protocol (http/https)
 * 2. Phải cùng domain (hostname)
 * 3. Pathname phải bắt đầu bằng basePath
 *
 * WHY: Đây là "lá chắn" chính để không bị lạc ra ngoài docs.
 */
export function isInScope(url: string, scope: CrawlScope): boolean {
  try {
    const parsed = new URL(url);

    // Kiểm tra protocol
    if (parsed.protocol !== scope.protocol) return false;

    // Kiểm tra domain (bao gồm subdomain phải khớp chính xác)
    if (parsed.hostname !== scope.domain) return false;

    // Kiểm tra path prefix
    const pathname = parsed.pathname;
    if (scope.basePath === "/") return true; // crawl toàn bộ domain

    return pathname === scope.basePath || pathname.startsWith(scope.basePath + "/");
  } catch {
    return false; // URL không hợp lệ → bỏ qua
  }
}

/**
 * Kiểm tra URL có phải là tài nguyên tĩnh cần bỏ qua không.
 * WHY: Tránh crawl ảnh, video, PDF... không phải HTML page.
 */
export function isStaticAsset(url: string): boolean {
  const STATIC_EXTENSIONS = [
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico",
    ".css", ".js", ".json", ".xml", ".txt", ".pdf",
    ".zip", ".tar", ".gz", ".mp4", ".mp3", ".woff", ".woff2", ".ttf",
  ];
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    return STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

/**
 * Resolve relative URL thành absolute URL dựa trên base URL của trang hiện tại.
 * WHY: HTML thường chứa relative links như "../api" hay "/docs/guide".
 */
export function resolveUrl(href: string, baseUrl: string): string | null {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null; // href không hợp lệ (ví dụ: "mailto:", "javascript:")
  }
}

/**
 * Convert URL pathname thành filesystem path tương đối.
 * Ví dụ:
 *   "https://docs.example.com/guide/setup" → "docs.example.com/guide/setup.md"
 *   "https://docs.example.com/guide" → "docs.example.com/guide/index.md"
 *
 * WHY: Giữ nguyên cấu trúc URL trong filesystem giúp dễ navigate và reference sau này.
 */
export function urlToFilePath(url: string): string {
  const parsed = new URL(url);
  const domain = parsed.hostname;
  let pathname = parsed.pathname;

  // Bỏ trailing slash
  if (pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  // Path rỗng hoặc chỉ là "/" → index.md
  if (!pathname || pathname === "/") {
    return `${domain}/index.md`;
  }

  return `${domain}${pathname}.md`;
}
