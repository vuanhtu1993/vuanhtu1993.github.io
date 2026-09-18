import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useEditMode } from './EditModeContext';
import styles from './AddTopicModal.module.css';

export default function AddTopicModal({
  isOpen,
  station,
  initialInsertPosition = null,
  initialTab = 'ref',
  onClose,
  onSave,
  isProcessing = false,
}) {
  const { searchTopics } = useEditMode();

  // Tab: 'new' (Tạo mới) | 'ref' (Từ kho tri thức)
  const [activeTab, setActiveTab] = useState('ref');

  // Form state tạo mới
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  // Form state chọn từ kho
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRefTopic, setSelectedRefTopic] = useState(null);

  // Position state: 'start' | 'end' | 'after:${nodeId}'
  const [selectedPositionKey, setSelectedPositionKey] = useState('end');

  const titleInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Danh sách các chủ đề hiện có trong chặng để chọn vị trí chèn
  const availableSteps = useMemo(() => {
    if (!station?.subtopics) return [];
    return station.subtopics.map((t) => ({
      nodeId: t.nodeId || t.name || t.id,
      title: t.title || 'Chủ đề',
    }));
  }, [station]);

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setContent('');
      setSearchTerm('');
      setSearchResults([]);
      setSelectedRefTopic(null);
      const tabToUse = initialTab || 'ref';
      setActiveTab(tabToUse);

      // Khởi tạo vị trí dựa trên initialInsertPosition
      if (initialInsertPosition?.type === 'start') {
        setSelectedPositionKey('start');
      } else if (initialInsertPosition?.type === 'after' && initialInsertPosition?.targetNodeId) {
        setSelectedPositionKey(`after:${initialInsertPosition.targetNodeId}`);
      } else {
        setSelectedPositionKey('end');
      }

      setTimeout(() => {
        if (tabToUse === 'ref') {
          searchInputRef.current?.focus();
        } else {
          titleInputRef.current?.focus();
        }
      }, 100);
    }
  }, [isOpen, initialInsertPosition, initialTab]);

  // Tìm kiếm topic từ kho khi đổi tab hoặc gõ từ khóa
  useEffect(() => {
    if (!isOpen || activeTab !== 'ref') return;
    const term = searchTerm.trim();

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchTopics(term, '');
        setSearchResults(data || []);
      } catch (err) {
        console.error('Lỗi tìm kiếm topics:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, term ? 250 : 0);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen, activeTab, searchTopics]);

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

  if (!isOpen || !station) return null;

  // Chèn mẫu sơ đồ Mermaid vào nội dung
  const handleInsertMermaid = () => {
    const template = `\n\n\`\`\`mermaid\ngraph TD\n    A["Bước 1: Khởi đầu"] --> B["Bước 2: Xử lý"]\n    B --> C{"Điều kiện kiểm tra?"}\n    C -- "Đạt" --> D["Hoàn thành"]\n    C -- "Chưa" --> B\n\`\`\`\n\n`;
    setContent((prev) => (prev ? prev.trimEnd() + template : template.trimStart()));
  };

  // Tính toán insertPosition object gửi lên API
  const getComputedInsertPosition = () => {
    if (selectedPositionKey === 'start') {
      return { type: 'start' };
    }
    if (selectedPositionKey.startsWith('after:')) {
      const targetNodeId = selectedPositionKey.replace('after:', '');
      return { type: 'after', targetNodeId };
    }
    return { type: 'end' };
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (isProcessing) return;

    const insertPosition = getComputedInsertPosition();

    if (activeTab === 'new') {
      if (!title.trim()) {
        alert('Vui lòng nhập tiêu đề chủ đề');
        titleInputRef.current?.focus();
        return;
      }
      await onSave({
        moduleId: station.id,
        title: title.trim(),
        description: description.trim(),
        content: content.trim() ? content : `# ${title.trim()}\n\n${description.trim()}`,
        resources: [],
        insertPosition,
      });
    } else {
      if (!selectedRefTopic) {
        alert('Vui lòng chọn một chủ đề từ danh sách kết quả');
        return;
      }
      await onSave({
        moduleId: station.id,
        title: selectedRefTopic.title,
        description: selectedRefTopic.description,
        content: selectedRefTopic.content,
        resources: selectedRefTopic.resources || [],
        ref: {
          isRef: true,
          sourceRoadmapSlug: selectedRefTopic.roadmapSlug,
          sourceNodeId: selectedRefTopic.nodeId,
        },
        insertPosition,
      });
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={isProcessing ? undefined : onClose}>
      <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Thêm Chủ đề vào Chặng</h3>
            <p className={styles.modalSubtitle}>
              Chặng: <strong>{station.title}</strong>
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

        {/* Tabs chuyển đổi chế độ */}
        <div className={styles.tabsNav}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'new' ? styles.tabBtnActive : ''}`}
            onClick={() => {
              setActiveTab('new');
              setTimeout(() => titleInputRef.current?.focus(), 50);
            }}
          >
            ✏️ Create New Topic
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'ref' ? styles.tabBtnActive : ''}`}
            onClick={() => {
              setActiveTab('ref');
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }}
          >
            📚 From Knowledge Base
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {/* Dropdown Vị trí chèn (chỉ hiển thị khi đã có ít nhất 1 chủ đề) */}
          {availableSteps.length > 0 && (
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="topic-position-select">
                <span>Vị trí xuất hiện trong chặng:</span>
              </label>
              <select
                id="topic-position-select"
                className={styles.select}
                value={selectedPositionKey}
                onChange={(e) => setSelectedPositionKey(e.target.value)}
                disabled={isProcessing}
              >
                <option value="start">📌 Ở đầu chặng (Bước đầu tiên)</option>
                {availableSteps.map((step, idx) => (
                  <option key={step.nodeId} value={`after:${step.nodeId}`}>
                    📌 Chèn sau bước {idx + 1}: &quot;{step.title}&quot;
                  </option>
                ))}
                <option value="end">📌 Ở cuối chặng (Mặc định)</option>
              </select>
            </div>
          )}

          {/* Tab 1: Tạo mới */}
          {activeTab === 'new' && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="new-topic-title">
                  <span>
                    Tên chủ đề <span className={styles.labelRequired}>*</span>
                  </span>
                </label>
                <input
                  id="new-topic-title"
                  ref={titleInputRef}
                  type="text"
                  className={styles.input}
                  placeholder="Ví dụ: Server-side Rendering (SSR)..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isProcessing}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="new-topic-desc">
                  <span>Mô tả ngắn gọn</span>
                </label>
                <input
                  id="new-topic-desc"
                  type="text"
                  className={styles.input}
                  placeholder="Tóm tắt nội dung cốt lõi của chủ đề..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isProcessing}
                />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.label}>
                  <span>Nội dung chi tiết (Markdown)</span>
                  <button
                    type="button"
                    className={styles.insertMermaidBtn}
                    onClick={handleInsertMermaid}
                    title="Insert Mermaid diagram template"
                  >
                    + Mermaid Template
                  </button>
                </div>
                <textarea
                  className={styles.textarea}
                  placeholder="Viết nội dung bài học, mã ví dụ hoặc sơ đồ Mermaid..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isProcessing}
                  rows={4}
                />
              </div>
            </>
          )}

          {/* Tab 2: Chọn từ kho tri thức */}
          {activeTab === 'ref' && (
            <div className={styles.formGroup}>
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
                  ref={searchInputRef}
                  type="text"
                  className={styles.searchInput}
                  placeholder="Gõ từ khóa tìm kiếm trên toàn bộ hệ thống..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isProcessing}
                />
              </div>

              <div className={styles.resultsList}>
                {isSearching ? (
                  <div className={styles.emptyState}>Đang tra cứu cơ sở tri thức...</div>
                ) : searchResults.length === 0 ? (
                  <div className={styles.emptyState}>
                    {searchTerm ? 'Không tìm thấy chủ đề nào phù hợp' : 'Không có gợi ý khả dụng'}
                  </div>
                ) : (
                  searchResults.map((item) => {
                    const isSelected =
                      selectedRefTopic?.nodeId === item.nodeId &&
                      selectedRefTopic?.roadmapSlug === item.roadmapSlug;
                    return (
                      <div
                        key={`${item.roadmapSlug}-${item.nodeId}`}
                        className={`${styles.resultItem} ${
                          isSelected ? styles.resultItemSelected : ''
                        }`}
                        onClick={() => setSelectedRefTopic(item)}
                      >
                        <div className={styles.resultHeader}>
                          <span className={styles.resultTitle}>{item.title}</span>
                          <span className={styles.resultBadge}>{item.roadmapSlug}</span>
                        </div>
                        {item.description && (
                          <p className={styles.resultDesc}>
                            {item.description.length > 90
                              ? `${item.description.substring(0, 90)}...`
                              : item.description}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {selectedRefTopic && (
                <div className={styles.positionBadge}>
                  ✓ Đã chọn: <strong>{selectedRefTopic.title}</strong> (từ{' '}
                  <code>{selectedRefTopic.roadmapSlug}</code>)
                </div>
              )}
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={
              isProcessing ||
              (activeTab === 'new' && !title.trim()) ||
              (activeTab === 'ref' && !selectedRefTopic)
            }
          >
            {isProcessing ? 'Saving...' : '+ Add Topic'}
          </button>
        </div>
      </div>
    </div>
  );
}
