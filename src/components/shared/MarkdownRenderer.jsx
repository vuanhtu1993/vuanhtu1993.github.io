import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidBlock from './MermaidBlock';
import styles from './MarkdownRenderer.module.css';

/**
 * Component hiển thị Markdown chuẩn hóa
 * Hỗ trợ GFM (tables, strikethrough, tasklists), code blocks, links an toàn, Mermaid diagrams
 */
export default function MarkdownRenderer({ content, inline = false, truncate = null, className = '' }) {
  if (!content || typeof content !== 'string') {
    return null;
  }

  let text = content;

  // Trong chế độ preview thu gọn (truncate), loại bỏ các khối Mermaid hoặc code block lớn
  // để tránh làm vỡ giao diện lưới thẻ bài (card grid)
  if (truncate) {
    const hasMermaid = /```mermaid[\s\S]*?```/g.test(text);
    let cleanText = text.replace(/```mermaid[\s\S]*?```/g, '').trim();
    if (!cleanText && hasMermaid) {
      cleanText = '📊 [Có sơ đồ Mermaid]';
    } else if (hasMermaid) {
      cleanText += ' (📊 kèm sơ đồ)';
    }
    if (cleanText.length > truncate) {
      cleanText = cleanText.slice(0, truncate).trim() + '...';
    }
    text = cleanText;
  }

  return (
    <div className={`${styles.markdownContainer} ${inline ? styles.inline : ''} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" className={styles.link} />
          ),
          pre: ({ node, children, ...props }) => {
            // Bắt trường hợp pre chứa code mermaid để render MermaidBlock trực tiếp, không bọc thẻ pre
            const child = Array.isArray(children) ? children[0] : children;
            if (
              React.isValidElement(child) &&
              (child.props?.className?.includes('language-mermaid') ||
                child.props?.className?.includes('mermaid'))
            ) {
              const codeString = String(child.props.children || '').replace(/\n$/, '');
              return <MermaidBlock value={codeString} />;
            }
            return <pre {...props}>{children}</pre>;
          },
          code: ({ node, inline: isInline, className: codeClassName, children, ...props }) => {
            const match = /language-(\w+)/.exec(codeClassName || '');
            const language = match ? match[1] : '';
            const codeString = String(children || '').replace(/\n$/, '');

            // Fallback nếu không bị bắt bởi thẻ pre
            if (!isInline && (language === 'mermaid' || codeClassName === 'mermaid')) {
              return <MermaidBlock value={codeString} />;
            }

            if (isInline) {
              return (
                <code className={styles.inlineCode} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={styles.blockCode} {...props}>
                {children}
              </code>
            );
          },
          table: ({ node, ...props }) => (
            <div className={styles.tableWrapper}>
              <table {...props} />
            </div>
          ),
          img: ({ node, alt, src, ...props }) => (
            <span className={styles.imageWrapper}>
              <img
                src={src}
                alt={alt || 'Hình ảnh minh họa'}
                loading="lazy"
                className={styles.image}
                {...props}
              />
              {alt && <span className={styles.imageCaption}>{alt}</span>}
            </span>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

