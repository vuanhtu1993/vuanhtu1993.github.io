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
    // Tạo regex tìm từ độc lập (không nằm trong chữ khác) - case insensitive
    // Gộp giải thích và analogy thành 1 popup
    const popupContent = `${term.explanation}${term.analogy ? ` (Ví dụ: ${term.analogy})` : ''}`.replace(/"/g, "'");

    // Tạm thời replace rất lỏng lẻo cho MVP, bỏ cờ 'g' để chỉ replace từ xuất hiện ĐẦU TIÊN nhằm tránh spam.
    const regex = new RegExp(`\\b(${term.word})\\b`, 'i');
    content = content.replace(regex, `<Term definition="${popupContent}">$1</Term>`);
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
