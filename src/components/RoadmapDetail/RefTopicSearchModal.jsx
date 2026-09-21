import React, { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
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
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Tìm kiếm topics
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const data = await searchTopics(searchTerm);
        if (isMounted) {
          const parentId = parentTopic?.nodeId || parentTopic?.id || parentTopic?.title;
          const filtered = data.filter((t) => {
            const tId = t.nodeId || t.id || t.title;
            return tId !== parentId && t.title?.toLowerCase() !== parentTopic?.title?.toLowerCase();
          });
          setResults(filtered);
        }
      } catch (err) {
        console.error('Lỗi khi tìm kiếm topics:', err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm, isOpen, searchTopics, parentTopic]);

  if (!isOpen || !parentTopic) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open && !isProcessing) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.modalOverlay} />
        <Dialog.Content className={styles.modalDialog}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <div>
              <Dialog.Title className={styles.modalTitle}>Tham chiếu Topic con</Dialog.Title>
              <Dialog.Description className={styles.modalSubtitle}>
                Gán topic vào chủ đề cha: <strong>{parentTopic.title}</strong>
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className={styles.closeBtn}
                disabled={isProcessing}
                aria-label="Close"
              >
                ✕
              </button>
            </Dialog.Close>
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
                <div className={styles.suggestionTitle}>
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
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
  );
}
