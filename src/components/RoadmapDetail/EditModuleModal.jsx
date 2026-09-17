import React, { useState, useEffect } from 'react';
import MarkdownRenderer from '../shared/MarkdownRenderer';
import styles from './EditModuleModal.module.css';

export default function EditModuleModal({
  isOpen,
  module,
  onSave,
  onCancel,
  isSaving = false,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (module) {
      setTitle(module.title || '');
      setDescription(module.description || '');
      setShowPreview(false);
    }
  }, [module, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, isSaving]);

  if (!isOpen || !module) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={isSaving ? undefined : onCancel}>
      <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>✏️ Chỉnh sửa Chặng Module</h3>
          <button
            type="button"
            className={styles.closeIconBtn}
            onClick={onCancel}
            disabled={isSaving}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tên Module / Chặng <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên chặng..."
              required
              disabled={isSaving}
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label className={styles.label}>Mô tả khái quát (Hỗ trợ Markdown)</label>
              <button
                type="button"
                className={styles.previewToggleBtn}
                onClick={() => setShowPreview((prev) => !prev)}
              >
                {showPreview ? '📝 Viết' : '👁️ Xem trước'}
              </button>
            </div>

            {showPreview ? (
              <div className={styles.previewBox}>
                <MarkdownRenderer content={description || '_Chưa có mô tả_'} />
              </div>
            ) : (
              <textarea
                className={styles.textarea}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả cho chặng này (hỗ trợ markdown)..."
                disabled={isSaving}
              />
            )}
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onCancel}
              disabled={isSaving}
            >
              Huỷ
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={isSaving || !title.trim()}
            >
              {isSaving ? 'Đang lưu vào MongoDB...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
