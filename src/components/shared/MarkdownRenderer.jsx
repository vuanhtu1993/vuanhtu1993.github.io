import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './MarkdownRenderer.module.css';

/**
 * Component hiển thị Markdown chuẩn hóa
 * Hỗ trợ GFM (tables, strikethrough, tasklists), code blocks, links an toàn
 */
export default function MarkdownRenderer({ content, inline = false, truncate = null, className = '' }) {
  if (!content || typeof content !== 'string') {
    return null;
  }

  let text = content;
  if (truncate && text.length > truncate) {
    text = text.slice(0, truncate).trim() + '...';
  }

  return (
    <div className={`${styles.markdownContainer} ${inline ? styles.inline : ''} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" className={styles.link} />
          ),
          code: ({ node, inline: isInline, className: codeClassName, children, ...props }) => {
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
