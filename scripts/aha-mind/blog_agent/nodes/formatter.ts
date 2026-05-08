import { AhaMindState } from "../state";

export const mdxFormatterNode = async (state: AhaMindState): Promise<Partial<AhaMindState>> => {
  if (!state.articleToProcess) {
    return { finalMdxContent: "" };
  }

  console.log(`[Formatter] Formatting MDX for: ${state.articleToProcess.title}`);

  let content = state.articleToProcess.content;

  // Thay thế các từ vựng bằng Component <Term />
  // Note: Cách replace này trong MVP khá đơn giản (find & replace), 
  // có thể thay cả bên trong URL hoặc thành phần khác. MVP tạm chấp nhận.
  for (const term of state.extractedTerms) {
    const popupContent = `${term.explanation}${term.analogy ? ` (Ví dụ: ${term.analogy})` : ''}`.replace(/"/g, "'");

    // Regex phức tạp hơn: Bỏ qua nếu từ nằm trong cấu trúc Markdown Image ![alt](url) hoặc Link [text](url)
    // Chúng ta sẽ tìm cả cấu trúc link/image HOẶC từ cần tìm. 
    // Nếu khớp link/image thì giữ nguyên, nếu khớp từ thì mới bọc <Term />
    const regex = new RegExp(`(!?\\[.*?\\]\\(.*?\\))|\\b(${term.word})\\b`, 'gi');
    
    let replacedFirst = false; // Chỉ replace từ đầu tiên xuất hiện để tránh spam
    content = content.replace(regex, (match, group1, group2) => {
      if (group1) return group1; // Trả về nguyên vẹn nếu là link hoặc ảnh
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
