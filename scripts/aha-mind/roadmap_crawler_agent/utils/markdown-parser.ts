import { ParsedResource, ParsedTopic, RawTopic } from "../state";
import { slugToTitle } from "../config";

/**
 * Regex bóc tách resource link đặc thù của roadmap.sh:
 * Cú pháp: [@type@Title](url)
 * Ví dụ: [@article@Accessibility for Developers](https://web.dev/accessibility)
 */
const ROADMAP_RESOURCE_REGEX = /\[@([^@]+)@([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

/**
 * Regex dự phòng cho link markdown thông thường trong mục resources:
 * Ví dụ: [Google Web Dev](https://web.dev)
 */
const FALLBACK_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

/**
 * Phân tích nội dung Markdown của 1 topic thành cấu trúc dữ liệu hoàn chỉnh
 * 
 * @param rawTopic Dữ liệu topic dạng text thô
 * @returns ParsedTopic chứa tiêu đề, mô tả, danh sách resources học tập
 */
export function parseTopicMarkdown(rawTopic: RawTopic): ParsedTopic {
  const content = rawTopic.content.trim();
  const lines = content.split("\n");

  // 1. Trích xuất Tiêu đề từ dòng H1 đầu tiên (# Title)
  let title = "";
  let titleLineIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("# ")) {
      title = line.replace(/^#\s+/, "").trim();
      titleLineIndex = i;
      break;
    }
  }

  // Nếu không tìm thấy thẻ H1, dùng topicName định dạng lại
  if (!title) {
    title = slugToTitle(rawTopic.topicName);
  }

  // 2. Trích xuất danh sách tài nguyên (Resources)
  const resources: ParsedResource[] = [];
  const visitedUrls = new Set<string>();

  // Ưu tiên regex chuẩn [@type@title](url)
  let match: RegExpExecArray | null;
  while ((match = ROADMAP_RESOURCE_REGEX.exec(content)) !== null) {
    const [, type, resourceTitle, url] = match;
    const cleanUrl = url.trim();
    if (!visitedUrls.has(cleanUrl)) {
      visitedUrls.add(cleanUrl);
      resources.push({
        type: type.trim().toLowerCase(),
        title: resourceTitle.trim(),
        url: cleanUrl,
      });
    }
  }

  // Nếu không tìm thấy link theo cú pháp roadmap.sh, tìm link markdown tiêu chuẩn
  if (resources.length === 0) {
    while ((match = FALLBACK_LINK_REGEX.exec(content)) !== null) {
      const [, resourceTitle, url] = match;
      const cleanUrl = url.trim();
      if (!visitedUrls.has(cleanUrl)) {
        visitedUrls.add(cleanUrl);
        resources.push({
          type: "link",
          title: resourceTitle.trim(),
          url: cleanUrl,
        });
      }
    }
  }

  // 3. Trích xuất phần mô tả (Description)
  // Lấy các dòng nằm sau thẻ H1 và trước dòng bắt đầu liệt kê link/resources
  const descLines: string[] = [];
  const startIndex = titleLineIndex >= 0 ? titleLineIndex + 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    // Bỏ qua dòng chỉ dẫn resource
    if (line.toLowerCase().includes("visit the following resources") || line.toLowerCase().includes("resources to learn more")) {
      break;
    }
    // Dừng khi bắt đầu gặp danh sách bullet chứa link
    if (line.startsWith("- [") || line.startsWith("* [")) {
      break;
    }
    if (line.length > 0) {
      descLines.push(line);
    }
  }

  const description = descLines.join("\n\n").trim();

  return {
    name: rawTopic.topicName,
    nodeId: rawTopic.nodeId,
    title,
    description,
    content,
    resources,
  };
}
