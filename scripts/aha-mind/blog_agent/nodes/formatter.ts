import { AhaMindState } from "../state";

export const mdxFormatterNode = async (state: AhaMindState): Promise<Partial<AhaMindState>> => {
  if (!state.articleToProcess) {
    return { finalMdxContent: "" };
  }

  console.log(`[Formatter] Formatting MDX for: ${state.articleToProcess.title}`);

  let content = state.articleToProcess.content;

  // Sắp xếp từ vựng theo độ dài giảm dần để tránh thay thế từ ngắn nằm trong từ dài (ví dụ: 'API' vs 'API Gateway')
  const sortedTerms = [...state.extractedTerms].sort((a, b) => b.word.length - a.word.length);

  // Thay thế các từ vựng bằng Component <Term />
  for (const term of sortedTerms) {
    const popupContent = `${term.explanation}${term.analogy ? ` (Ví dụ: ${term.analogy})` : ""}`.replace(/"/g, "'");

    // Escape các ký tự đặc biệt trong từ vựng để dùng trong Regex
    const escapedWord = term.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    /**
     * Regex cải tiến:
     * 1. (```[\s\S]*?```) : Bỏ qua Code blocks (fenced)
     * 2. (`[^`\n]+`)      : Bỏ qua Inline code
     * 3. (!?\[.*?\]\(.*?\)) : Bỏ qua Markdown Image/Link
     * 4. \b(word)\b       : Tìm từ vựng chính xác (case-insensitive)
     */
    const regex = new RegExp(`(\`\`\`[\\s\\S]*?\`\`\`|\`[^\`\\n]+\`|!?\\[.*?\\]\\(.*?\\))|\\b(${escapedWord})\\b`, "gi");

    let replacedFirst = false;
    content = content.replace(regex, (match, group1, group2) => {
      // Nếu khớp group1 (code, link, image) thì trả về nguyên vẹn
      if (group1) return group1;
      // Nếu khớp group2 (từ vựng) và chưa replace lần nào trong bài
      if (!replacedFirst && group2) {
        replacedFirst = true;
        return `<Term definition="${popupContent}">${group2}</Term>`;
      }
      return match;
    });
  }

  // Tạo slug từ tiêu đề
  const slug = state.articleToProcess.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const dateStr = new Date(state.articleToProcess.pubDate).toISOString().split("T")[0];

  // Gắn Frontmatter theo chuẩn Docusaurus
  const mdx = `---
slug: aha-mind-${slug}
title: "${state.articleToProcess.title.replace(/"/g, '\\"')}"
date: ${dateStr}
authors: [anhhtus]
tags: [aha-mind, auto-generated, daily-digest]
---

import Term from '@site/src/components/Term';

> Bài viết được biên dịch tự động bởi **Aha! Mind Socratic Engine**. Nguồn bài viết: [Link gốc](${state.articleToProcess.link})

<!-- truncate -->
${content}

---
*Made by Anh Tu - Share to be share*
`;

  console.log(`[Formatter] MDX File prepared.`);
  return { finalMdxContent: mdx };
};
