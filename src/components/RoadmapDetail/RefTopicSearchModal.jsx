import React, { useState, useEffect, useRef } from 'react';
import { useEditMode } from './EditModeContext';
import styles from './RefTopicSearchModal.module.css';

export default function RefTopicSearchModal({
  isOpen,
  parentTopic,
  onClose,
  onSelectTopic,
  isProcessing = false,
}) {
  const { searchTopics } = useEditMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  // Focus ô tìm kiếm khi mở modal
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setResults([]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Tự động tải danh sách gợi ý ban đầu hoặc tìm kiếm theo từ khóa
  useEffect(() => {
    if (!isOpen) return;
    const term = searchTerm.trim();

    setIsSearching(true);
    const handler = setTimeout(
      async () => {
        try {
          const parentId = parentTopic?.nodeId || parentTopic?.id || '';
          const data = await searchTopics(term, parentId);
          setResults(data || []);
        } catch (err) {
          console.error('Lỗi khi tìm kiếm topics:', err);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      },
      term ? 250 : 0
    );

    return () => clearTimeout(handler);
  }, [searchTerm, isOpen, parentTopic, searchTopics]);

  // Đóng modal khi bấm ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isProcessing]);

  if (!isOpen || !parentTopic) return null;

  return (
    <div className={styles.modalOverlay} onClick={isProcessing ? undefined : onClose}>
      <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Tham chiếu Topic con</h3>
            <p className={styles.modalSubtitle}>
              Gán topic vào chủ đề cha: <strong>{parentTopic.title}</strong>
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Search Input */}
        <div className={styles.searchBoxWrapper}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo tên chủ đề hoặc từ khóa (ví dụ: Routing, Docker, Hook, Auth...)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isProcessing}
          />
          {searchTerm && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Results List */}
        <div className={styles.resultsContainer}>
          {isSearching ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <span>Đang tìm kiếm trong kho dữ liệu...</span>
            </div>
          ) : searchTerm.trim() && results.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Không tìm thấy chủ đề nào khớp với từ khóa "{searchTerm}".</p>
              <span className={styles.emptyHint}>
                Hãy thử tìm với các từ khóa công nghệ ngắn gọn hơn.
              </span>
            </div>
          ) : results.length === 0 ? (
            <div className={styles.idleState}>
              <p>Nhập từ khóa phía trên để tìm kiếm chủ đề trong hệ thống.</p>
            </div>
          ) : (
            <div className={styles.resultsList}>
              {!searchTerm.trim() && (
                <div style={{ fontSize: '0.85rem', color: '#059669', marginBottom: '0.6rem', fontWeight: 600 }}>
                  Gợi ý chủ đề từ các lộ trình:
                </div>
              )}
              {results.map((topic) => (
                <div key={`${topic.roadmapSlug}-${topic.nodeId}`} className={styles.resultItem}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTitleRow}>
                      <span className={styles.itemTitle}>{topic.title}</span>
                      <span className={styles.roadmapBadge}>
                        {topic.roadmapTitle || topic.roadmapSlug}
                      </span>
                      {topic.isModule && (
                        <span className={styles.moduleBadge}>Chặng / Module</span>
                      )}
                    </div>
                    {topic.description && (
                      <p className={styles.itemDesc}>
                        {(() => {
                          const clean = topic.description
                            .replace(/```[\s\S]*?```/g, '')
                            .replace(/[#*`_\[\]()]/g, '')
                            .trim();
                          return clean.length > 120 ? clean.slice(0, 120) + '...' : clean;
                        })()}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.selectBtn}
                    onClick={() => onSelectTopic(topic)}
                    disabled={isProcessing}
                  >
                    + Assign Subtopic
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className={styles.modalFooter}>
          <span className={styles.footerHint}>
            Topic con được gán sẽ hiển thị dưới dạng nhánh phân nhánh (Branch) trên sơ đồ.
          </span>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isProcessing}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
