import React, { useEffect } from 'react';
import styles from './ConfirmDeleteModal.module.css';

export default function ConfirmDeleteModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isProcessing = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, isProcessing]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={isProcessing ? undefined : onCancel}>
      <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.warningIcon}>⚠️</div>
          <h3 className={styles.modalTitle}>{title || 'Xác nhận xoá'}</h3>
        </div>

        <p className={styles.modalMessage}>
          {message || 'Hành động này sẽ xoá vĩnh viễn dữ liệu khỏi MongoDB Atlas và không thể khôi phục.'}
        </p>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={isProcessing}
          >
            Huỷ bỏ
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Đang xoá...' : 'Xác nhận Xoá'}
          </button>
        </div>
      </div>
    </div>
  );
}
