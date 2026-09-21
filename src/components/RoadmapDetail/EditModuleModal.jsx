import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
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
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open && !isSaving) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.modalOverlay} />
        <Dialog.Content className={styles.modalDialog}>
          <div className={styles.modalHeader}>
            <Dialog.Title className={styles.modalTitle}>Chỉnh sửa Chặng Module</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className={styles.closeIconBtn}
                disabled={isSaving}
              >
                ✕
              </button>
            </Dialog.Close>
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
                {showPreview ? 'Edit' : 'Preview'}
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
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={isSaving || !title.trim()}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
}
