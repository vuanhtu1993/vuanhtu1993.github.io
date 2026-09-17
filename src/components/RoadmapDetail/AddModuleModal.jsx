import React, { useState, useEffect, useRef } from 'react';
import MarkdownRenderer from '../shared/MarkdownRenderer';
import styles from './AddModuleModal.module.css';

export default function AddModuleModal({
  isOpen,
  insertPosition = null,
  stations = [],
  onSave,
  onCancel,
  isSaving = false,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPositionKey, setSelectedPositionKey] = useState('end');

  const titleInputRef = useRef(null);

  // Khởi tạo vị trí và reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setShowPreview(false);

      if (insertPosition?.type === 'start') {
        setSelectedPositionKey('start');
      } else if (insertPosition?.type === 'after' && insertPosition?.targetModuleId) {
        setSelectedPositionKey(`after:${insertPosition.targetModuleId}`);
      } else {
        setSelectedPositionKey('end');
      }

      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, insertPosition]);

  // Đóng modal khi bấm ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, isSaving]);

  if (!isOpen) return null;

  // Tính toán insertPosition object gửi lên API
  const getComputedInsertPosition = () => {
    if (selectedPositionKey === 'start') {
      return { type: 'start' };
    }
    if (selectedPositionKey.startsWith('after:')) {
      const targetModuleId = selectedPositionKey.replace('after:', '');
      return { type: 'after', targetModuleId };
    }
    return { type: 'end' };
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!title.trim() || isSaving) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      insertPosition: getComputedInsertPosition(),
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={isSaving ? undefined : onCancel}>
      <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Thêm Chặng mới (Module)</h3>
            <p className={styles.modalSubtitle}>
              Tạo một chặng kiến thức mới trên trục thời gian Roadmap
            </p>
          </div>
          <button
            type="button"
            className={styles.closeIconBtn}
            onClick={onCancel}
            disabled={isSaving}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Dropdown chọn vị trí chặng */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="module-position-select">
              <span>Vị trí xuất hiện của Chặng mới:</span>
            </label>
            <select
              id="module-position-select"
              className={styles.formSelect}
              value={selectedPositionKey}
              onChange={(e) => setSelectedPositionKey(e.target.value)}
              disabled={isSaving}
            >
              <option value="start">📌 Ở đầu lộ trình (Chặng 1)</option>
              {stations.map((st, idx) => (
                <option key={st.id} value={`after:${st.id}`}>
                  📌 Chèn sau Chặng {idx + 1}: &quot;{st.title}&quot;
                </option>
              ))}
              <option value="end">📌 Ở cuối lộ trình (Mặc định)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="module-title">
              <span>
                Tên Chặng <span className={styles.requiredMark}>*</span>
              </span>
            </label>
            <input
              id="module-title"
              ref={titleInputRef}
              type="text"
              className={styles.formInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Kiến trúc Backend & Database..."
              disabled={isSaving}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formLabel}>
              <span>Mô tả tổng quan Chặng (Markdown)</span>
              {description && (
                <button
                  type="button"
                  className={styles.previewToggleBtn}
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Chỉnh sửa' : 'Xem trước'}
                </button>
              )}
            </div>

            {showPreview ? (
              <div className={styles.previewBox}>
                <MarkdownRenderer content={description} />
              </div>
            ) : (
              <textarea
                className={styles.formTextarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả mục tiêu, kết quả đầu ra và các chủ đề cốt lõi của chặng này..."
                rows={4}
                disabled={isSaving}
              />
            )}
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onCancel}
              disabled={isSaving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={isSaving || !title.trim()}
            >
              {isSaving ? 'Đang tạo chặng...' : '+ Tạo Chặng mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
