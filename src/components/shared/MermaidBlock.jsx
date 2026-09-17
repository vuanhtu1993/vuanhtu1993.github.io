import React, { useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Mermaid from '@theme/Mermaid';
import styles from './MermaidBlock.module.css';

class MermaidErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Mermaid rendering error caught by MermaidBlock:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorHeader}>
            <span className={styles.errorTitle}>Cú pháp Mermaid đang soạn thảo hoặc có lỗi cú pháp</span>
          </div>
          <p className={styles.errorMessage}>
            {this.state.error?.message || 'Không thể render biểu đồ Mermaid.'}
          </p>
          <pre className={styles.errorSource}>
            <code>{this.props.value}</code>
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MermaidBlock({ value }) {
  const [showSource, setShowSource] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleanValue = (value || '').trim();
  if (!cleanValue) return null;

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(cleanValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Không thể sao chép mã Mermaid:', e);
    }
  };

  return (
    <div className={styles.container}>
      {/* Action Header */}
      <div className={styles.header}>
        <div className={styles.badge}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="18" r="3" />
            <path d="M18 9v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9" />
          </svg>
          <span>Sơ đồ Mermaid</span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => setShowSource((prev) => !prev)}
            title={showSource ? 'Ẩn mã nguồn Mermaid' : 'Xem mã nguồn Mermaid'}
          >
            {showSource ? 'Ẩn mã nguồn' : 'Xem mã nguồn'}
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={handleCopy}
            title="Sao chép mã nguồn Mermaid"
          >
            {copied ? 'Đã chép' : 'Sao chép'}
          </button>
        </div>
      </div>

      {/* Diagram Viewer wrapped in BrowserOnly & Local ErrorBoundary */}
      <div className={styles.diagramWrapper}>
        <BrowserOnly fallback={<div className={styles.loading}>Đang tải sơ đồ...</div>}>
          {() => (
            <MermaidErrorBoundary value={cleanValue}>
              <Mermaid value={cleanValue} />
            </MermaidErrorBoundary>
          )}
        </BrowserOnly>
      </div>

      {/* Raw Source Code Viewer (collapsible) */}
      {showSource && (
        <div className={styles.sourceWrapper}>
          <pre className={styles.sourceCode}>
            <code>{cleanValue}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
