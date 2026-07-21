/**
 * md_cleaner.ts
 * =====================================
 * Utility function để làm sạch nội dung Markdown.
 */

export function cleanMarkdown(content: string): string {
  // Tách text thành các phần: code blocks (```...```), inline code (`...`), và text thường
  // Mục đích là KHÔNG thực hiện clean-up/escaping bên trong code blocks
  const parts = content.split(/(```[\s\S]*?```|`[^`\n]+`)/g);
  
  for (let i = 0; i < parts.length; i++) {
    // Nếu là đoạn text thông thường (không phải code block hoặc inline code)
    if (!parts[i].startsWith('```') && !parts[i].startsWith('`')) {
      let text = parts[i];
      
      // 1. Nhiều space liên tiếp trong dòng (không bao gồm khoảng trắng ở đầu dòng để giữ nguyên indent)
      text = text.replace(/(?<!^)[ \t]{2,}(?! )/gm, ' ');
      
      // 2. Trailing whitespace mỗi dòng
      text = text.replace(/[ \t]+$/gm, '');
      
      // 3. Dòng chỉ có dấu cách -> dòng trống
      text = text.replace(/^[ \t]+$/gm, '');
      
      // 4. Giảm số dòng trắng liên tiếp (3+ dòng trắng -> 2 dòng trắng)
      text = text.replace(/\n{3,}/g, '\n\n');
      
      // 5. Escape dấu ngoặc nhọn { } để tránh lỗi MDX "Could not parse expression with acorn"
      // MDX biên dịch {...} như một biểu thức Javascript.
      text = text.replace(/(?<!\\)\{/g, '\\{').replace(/(?<!\\)\}/g, '\\}');

      // 6. Escape các thẻ HTML không hợp lệ hoặc không an toàn (ví dụ <script>, <head>)
      // MDX sẽ crash nếu gặp thẻ JSX không đóng (Expected a closing tag).
      text = text.replace(/<(\/?)([a-zA-Z0-9\-]+)/g, (match, slash, tag) => {
        const allowedTags = [
          'br', 'hr', 'img', 'b', 'i', 'u', 'strong', 'em', 'sub', 'sup', 
          'table', 'thead', 'tbody', 'tr', 'td', 'th', 'a', 'span', 'div', 
          'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 
          'blockquote', 'code', 'pre'
        ];
        if (allowedTags.includes(tag.toLowerCase())) {
          return match; // Giữ nguyên các thẻ định dạng hợp lệ
        }
        return `&lt;${slash}${tag}`; // Escape '<' thành '&lt;'
      });
      
      parts[i] = text;
    }
  }

  // Nối lại và trim đầu/cuối
  return parts.join('').trim();
}
