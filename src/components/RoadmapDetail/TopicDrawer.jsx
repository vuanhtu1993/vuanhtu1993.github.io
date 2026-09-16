import React, { useEffect } from 'react';
import styles from './TopicDrawer.module.css';

const RESOURCE_LABELS = {
  official: 'Docs',
  article: 'Article',
  video: 'Video',
  opensource: 'Open Source',
  github: 'Code',
  course: 'Course',
  book: 'Book',
  feed: 'Feed',
};

const BADGE_CLASS_MAP = {
  official: styles.badgeOfficial,
  article: styles.badgeArticle,
  video: styles.badgeVideo,
  opensource: styles.badgeOpensource,
  github: styles.badgeOpensource,
};

export default function TopicDrawer({
  topic,
  isOpen,
  onClose,
  isCompleted,
  onToggleCompleted,
  onPrevTopic,
  onNextTopic,
  hasPrev,
  hasNext,
}) {
  // Đóng drawer khi bấm phím ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !topic) return null;

  // Lấy danh sách tài nguyên
  const resources = topic.resources || [];

  // Làm sạch content text để hiển thị phần giảng giải (loại bỏ phần heading trùng lặp và list resource tag)
  const cleanContentParagraphs = (topic.content || '')
    .split('\n\n')
    .filter((para) => {
      const trimmed = para.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith('# ')) return false; // bỏ h1 trùng tiêu đề
      if (trimmed.toLowerCase().includes('visit the following resources')) return false;
      if (trimmed.startsWith('- [@')) return false; // bỏ các dòng link thô vì đã có khung Resource riêng
      return true;
    });

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawerPanel} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.topicTitle} title={topic.title}>
              {topic.title}
            </h2>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Đóng chi tiết"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.drawerBody}>
          {/* Completion Action Banner */}
          <div
            className={`${styles.actionBanner} ${
              isCompleted ? styles.actionBannerCompleted : ''
            }`}
          >
            <div className={styles.completionStatus}>
              <span className={styles.statusDot}>{isCompleted ? '✓' : '—'}</span>
              <span>{isCompleted ? 'Bạn đã hoàn thành chủ đề này' : 'Chưa hoàn thành'}</span>
            </div>
            <button
              type="button"
              className={`${styles.completeButton} ${
                isCompleted ? styles.completeButtonActive : ''
              }`}
              onClick={() => onToggleCompleted(topic.nodeId || topic.name || topic.id)}
            >
              {isCompleted ? 'Đã hoàn thành' : 'Đánh dấu đã học'}
            </button>
          </div>

          {/* Description Box */}
          {topic.description && (
            <div className={styles.descriptionBox}>
              <strong>Khái quát cốt lõi:</strong>
              <div style={{ marginTop: '0.35rem' }}>{topic.description}</div>
            </div>
          )}

          {/* Content Body */}
          {cleanContentParagraphs.length > 0 && (
            <>
              <h3 className={styles.sectionHeading}>Nội Dung Chi Tiết</h3>
              <div className={styles.contentBody}>
                {cleanContentParagraphs.map((para, index) => (
                  <p key={index}>{para}</p>
                ))}
              </div>
            </>
          )}

          {/* Resources List */}
          {resources.length > 0 && (
            <>
              <h3 className={styles.sectionHeading}>
                Tài Liệu & Nguồn Tham Khảo ({resources.length})
              </h3>
              <div className={styles.resourceList}>
                {resources.map((res, index) => {
                  const typeKey = (res.type || 'article').toLowerCase();
                  const label = RESOURCE_LABELS[typeKey] || 'Tài liệu';

                  return (
                    <a
                      key={index}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.resourceCard}
                    >
                      <div className={styles.resourceInfo}>
                        <span
                          className={`${styles.resourceTypeBadge} ${
                            BADGE_CLASS_MAP[typeKey] || ''
                          }`}
                        >
                          {label}
                        </span>
                        <span className={styles.resourceTitle}>{res.title}</span>
                      </div>
                      <span className={styles.resourceExternalIcon}>↗</span>
                    </a>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer Navigation */}
        <div className={styles.drawerFooter}>
          <div className={styles.navButtons}>
            <button
              type="button"
              className={styles.navButton}
              onClick={onPrevTopic}
              disabled={!hasPrev}
            >
              ← Chủ đề trước
            </button>
            <button
              type="button"
              className={`${styles.navButton} ${hasNext ? styles.navButtonPrimary : ''}`}
              onClick={onNextTopic}
              disabled={!hasNext}
            >
              Chủ đề kế tiếp →
            </button>
          </div>
          <div className={styles.footerCopyright}>Made by Anh Tu - Share to be share</div>
        </div>
      </div>
    </div>
  );
}
