import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import styles from './ConfirmDeleteModal.module.css';

export default function ConfirmDeleteModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isProcessing = false,
}) {
  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open && !isProcessing) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.modalOverlay} />
        <Dialog.Content className={styles.modalDialog}>
          <div className={styles.modalHeader}>
            <div className={styles.warningIcon}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <Dialog.Title className={styles.modalTitle}>{title || 'Xác nhận xoá'}</Dialog.Title>
          </div>

          <Dialog.Description className={styles.modalMessage}>
            {message || 'Hành động này sẽ xoá vĩnh viễn dữ liệu khỏi MongoDB Atlas và không thể khôi phục.'}
          </Dialog.Description>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={onConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
