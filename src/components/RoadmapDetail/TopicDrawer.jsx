import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import MarkdownRenderer from '../shared/MarkdownRenderer';
import { useEditMode } from './EditModeContext';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import RefTopicSearchModal from './RefTopicSearchModal';
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
  allTopics = [],
  onSelectTopic,
  isOpen,
  onClose,
  isCompleted,
  onToggleCompleted,
  onPrevTopic,
  onNextTopic,
  hasPrev,
  hasNext,
}) {
  const {
    isEditMode,
    updateTopic,
    deleteTopic,
    addRefChildTopic,
    unlinkChildTopic,
    saveStatus,
  } = useEditMode();

  // Edit Mode state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [resources, setResources] = useState([]);
  const [showDescPreview, setShowDescPreview] = useState(false);
  const [showContentPreview, setShowContentPreview] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cloudinary image inserter state
  const [showImageInserter, setShowImageInserter] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  // Ref Topic Modal state
  const [showRefSearchModal, setShowRefSearchModal] = useState(false);
  const [isAddingRef, setIsAddingRef] = useState(false);

  // New resource state
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');
  const [newResType, setNewResType] = useState('article');

  // Khởi tạo state khi mở topic
  useEffect(() => {
    if (topic) {
      setTitle(topic.title || '');
      setDescription(topic.description || '');
      setContent(topic.content || '');
      setResources(topic.resources || []);
      setShowDescPreview(false);
      setShowContentPreview(false);
      setShowDeleteModal(false);
      setShowImageInserter(false);
      setImageUrl('');
      setImageAlt('');
      setShowRefSearchModal(false);
    }
  }, [topic, isOpen]);

  if (!isOpen || !topic) return null;

  const topicNodeId = topic.nodeId || topic.name || topic.id;

  // Lấy danh sách các topic con thuộc topic này
  const childTopics = (allTopics || []).filter((t) => {
    if (!t.parentTopic) return false;
    const pId = t.parentTopic.id || t.parentTopic.title;
    return pId === topicNodeId || t.parentTopic.title?.toLowerCase() === topic.title?.toLowerCase();
  });

  // Xử lý lưu thay đổi
  const handleSaveTopic = async () => {
    try {
      await updateTopic(topicNodeId, {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        resources,
      });
    } catch (e) {
      alert(`Lỗi khi lưu topic: ${e.message}`);
    }
  };

  // Xử lý xoá topic
  const handleDeleteTopic = async () => {
    setIsDeleting(true);
    try {
      await deleteTopic(topicNodeId);
      setShowDeleteModal(false);
      onClose();
    } catch (e) {
      alert(`Lỗi khi xoá topic: ${e.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Thêm tài nguyên mới
  const handleAddResource = () => {
    if (!newResTitle.trim() || !newResUrl.trim()) return;
    setResources([
      ...resources,
      {
        title: newResTitle.trim(),
        url: newResUrl.trim(),
        type: newResType,
      },
    ]);
    setNewResTitle('');
    setNewResUrl('');
  };

  // Xoá 1 tài nguyên khỏi danh sách
  const handleRemoveResource = (index) => {
    setResources(resources.filter((_, idx) => idx !== index));
  };

  // Chèn cú pháp ảnh Cloudinary vào nội dung
  const handleInsertImage = () => {
    if (!imageUrl.trim()) return;
    const alt = imageAlt.trim() || 'Hình ảnh minh họa';
    const imageMarkdown = `\n\n![${alt}](${imageUrl.trim()})\n\n`;
    setContent((prev) => (prev ? prev.trimEnd() + imageMarkdown : imageMarkdown));
    setImageUrl('');
    setImageAlt('');
    setShowImageInserter(false);
  };

  // Chèn mẫu sơ đồ Mermaid vào nội dung
  const handleInsertMermaid = () => {
    const template = `\n\n\`\`\`mermaid\ngraph TD\n    Start["Bắt đầu (Start)"] --> Process["Xử lý (Process)"]\n    Process --> Check{"Điều kiện hợp lệ?"}\n    Check -- "Hợp lệ" --> Success["Thành công (Success)"]\n    Check -- "Không" --> Fallback["Xử lý lỗi (Fallback)"]\n\`\`\`\n\n`;
    setContent((prev) => (prev ? prev.trimEnd() + template : template));
  };

  // Xử lý gán topic con tham chiếu từ modal tìm kiếm
  const handleSelectRefTopic = async (selectedTopic) => {
    setIsAddingRef(true);
    try {
      await addRefChildTopic(topicNodeId, {
        sourceRoadmapSlug: selectedTopic.roadmapSlug,
        sourceNodeId: selectedTopic.nodeId,
        moduleId: topic.moduleId,
      });
      setShowRefSearchModal(false);
    } catch (err) {
      alert(`Lỗi khi gán topic con: ${err.message}`);
    } finally {
      setIsAddingRef(false);
    }
  };

  // Xử lý gỡ liên kết topic con
  const handleUnlinkChild = async (childNodeId) => {
    if (!window.confirm('Bạn có chắc chắn muốn gỡ liên kết chủ đề con này khỏi chủ đề cha?')) {
      return;
    }
    try {
      await unlinkChildTopic(childNodeId);
    } catch (err) {
      alert(`Lỗi khi gỡ liên kết topic: ${err.message}`);
    }
  };

  // Làm sạch content text để hiển thị (loại bỏ phần heading trùng lặp và list resource tag)
  const cleanContentText = (topic.content || '')
    .split('\n\n')
    .filter((para) => {
      const trimmed = para.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith('# ')) return false; // bỏ h1 trùng tiêu đề
      if (trimmed.toLowerCase().includes('visit the following resources')) return false;
      if (trimmed.startsWith('- [@')) return false; // bỏ các dòng link thô vì đã có khung Resource riêng
      return true;
    })
    .join('\n\n');

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.drawerOverlay} />
          <Dialog.Content
            className={styles.drawerPanel}
            onEscapeKeyDown={(e) => {
              if (showDeleteModal || showRefSearchModal) {
                e.preventDefault();
              }
            }}
          >
            {/* Header */}
            <div className={styles.drawerHeader}>
              <div className={styles.headerLeft}>
                {isEditMode ? (
                  <input
                    type="text"
                    className={styles.editInput}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tiêu đề chủ đề..."
                  />
                ) : (
                  <Dialog.Title className={styles.topicTitle} title={topic.title}>
                    {topic.title}
                  </Dialog.Title>
                )}
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className={styles.closeButton}
                  aria-label="Close details"
                >
                  ✕
                </button>
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className={styles.drawerBody}>
            {/* Edit Mode Notification Banner */}
            {isEditMode && (
              <div className={styles.editBanner}>
                <span>Chế độ chỉnh sửa đang bật — Mọi thay đổi sẽ được lưu vào database</span>
                {saveStatus === 'saving' && <span className={styles.statusSaving}>Đang lưu...</span>}
                {saveStatus === 'saved' && <span className={styles.statusSaved}>Đã lưu</span>}
                {saveStatus === 'error' && <span className={styles.statusError}>Lỗi lưu</span>}
              </div>
            )}

            {/* Completion Action Banner (chỉ hiển thị ở chế độ xem) */}
            {!isEditMode && (
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
                  onClick={() => onToggleCompleted(topicNodeId)}
                >
                  {isCompleted ? 'Completed' : 'Mark as Learned'}
                </button>
              </div>
            )}

            {/* Description Section */}
            {isEditMode ? (
              <div>
                <div className={styles.editLabelRow}>
                  <label className={styles.editLabel}>Khái quát cốt lõi (Markdown)</label>
                  <button
                    type="button"
                    className={styles.previewToggleBtn}
                    onClick={() => setShowDescPreview((prev) => !prev)}
                  >
                    {showDescPreview ? 'Edit' : 'Preview'}
                  </button>
                </div>
                {showDescPreview ? (
                  <div className={styles.previewBox}>
                    <MarkdownRenderer content={description || '_Chưa có mô tả_'} />
                  </div>
                ) : (
                  <textarea
                    className={styles.editTextarea}
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập mô tả khái quát..."
                  />
                )}
              </div>
            ) : (
              topic.description && (
                <div className={styles.descriptionBox}>
                  <strong>Khái quát cốt lõi:</strong>
                  <div className={styles.descriptionMarkdown}>
                    <MarkdownRenderer content={topic.description} />
                  </div>
                </div>
              )
            )}

            {/* Content Section */}
            {isEditMode ? (
              <div>
                <div className={styles.editLabelRow}>
                  <label className={styles.editLabel}>Nội Dung Chi Tiết (Markdown)</label>
                  <div className={styles.editActionButtons}>
                    <button
                      type="button"
                      className={styles.insertMermaidBtn}
                      onClick={handleInsertMermaid}
                      title="Insert Mermaid diagram template"
                    >
                      + Mermaid Diagram
                    </button>
                    <button
                      type="button"
                      className={styles.insertImageBtn}
                      onClick={() => setShowImageInserter((prev) => !prev)}
                      title="Insert image from Cloudinary link"
                    >
                      {showImageInserter ? 'Close Inserter' : 'Insert Cloudinary Image'}
                    </button>
                    <button
                      type="button"
                      className={styles.previewToggleBtn}
                      onClick={() => setShowContentPreview((prev) => !prev)}
                    >
                      {showContentPreview ? 'Edit' : 'Preview'}
                    </button>
                  </div>
                </div>

                {showImageInserter && (
                  <div className={`${styles.addResourceForm} ${styles.imageInserterForm}`}>
                    <span className={styles.imageInserterTitle}>
                      Chèn hình ảnh Cloudinary vào nội dung:
                    </span>
                    <div className={styles.addResourceInputs}>
                      <input
                        type="url"
                        placeholder="Dán link Cloudinary (https://res.cloudinary.com/...)"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className={styles.inputUrl}
                      />
                      <input
                        type="text"
                        placeholder="Mô tả / Chú thích ảnh (Alt text)..."
                        value={imageAlt}
                        onChange={(e) => setImageAlt(e.target.value)}
                        className={styles.inputAlt}
                      />
                    </div>
                    <button
                      type="button"
                      className={`${styles.addResourceBtn} ${styles.insertImageBtnSubmit}`}
                      onClick={handleInsertImage}
                      disabled={!imageUrl.trim()}
                    >
                      + Insert Image Markdown
                    </button>
                  </div>
                )}

                {showContentPreview ? (
                  <div className={styles.previewBox}>
                    <MarkdownRenderer content={content || '_Chưa có nội dung_'} />
                  </div>
                ) : (
                  <textarea
                    className={styles.editTextarea}
                    rows={10}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập nội dung bài giảng chi tiết (hỗ trợ đầy đủ Markdown)..."
                  />
                )}
              </div>
            ) : (
              cleanContentText && (
                <>
                  <h3 className={styles.sectionHeading}>Nội Dung Chi Tiết</h3>
                  <div className={styles.contentBody}>
                    <MarkdownRenderer content={cleanContentText} />
                  </div>
                </>
              )
            )}

            {/* Resources Section */}
            {isEditMode ? (
              <div>
                <div className={styles.editLabelRow}>
                  <label className={styles.editLabel}>Tài liệu & Nguồn tham khảo ({resources.length})</label>
                </div>

                {resources.map((res, index) => (
                  <div key={index} className={styles.resourceEditRow}>
                    <div>
                      <span
                        className={`${styles.resourceTypeBadge} ${styles.resourceBadgeMargin} ${
                          BADGE_CLASS_MAP[res.type?.toLowerCase()] || ''
                        }`}
                      >
                        {RESOURCE_LABELS[res.type?.toLowerCase()] || 'Link'}
                      </span>
                      <strong>{res.title}</strong>
                      <span className={styles.resourceUrl}>
                        ({res.url})
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.deleteResourceBtn}
                      onClick={() => handleRemoveResource(index)}
                      title="Delete this resource"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <div className={styles.addResourceForm}>
                  <span className={styles.addResourceLabel}>Thêm tài nguyên mới:</span>
                  <div className={styles.addResourceInputs}>
                    <select
                      value={newResType}
                      onChange={(e) => setNewResType(e.target.value)}
                    >
                      <option value="official">Docs / Official</option>
                      <option value="article">Article</option>
                      <option value="video">Video</option>
                      <option value="opensource">Open Source</option>
                      <option value="course">Course</option>
                      <option value="book">Book</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Tiêu đề tài liệu..."
                      value={newResTitle}
                      onChange={(e) => setNewResTitle(e.target.value)}
                      className={styles.addResourceInput}
                    />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newResUrl}
                      onChange={(e) => setNewResUrl(e.target.value)}
                      className={styles.addResourceInput}
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.addResourceBtn}
                    onClick={handleAddResource}
                  >
                    + Add Resource
                  </button>
                </div>
              </div>
            ) : (
              resources.length > 0 && (
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
              )
            )}

            {/* Child Topics (Subtopics / Branches) Section - Chỉ hiện trong Edit Mode */}
            {isEditMode && (
              <div className={styles.childTopicsSection}>
                <div className={styles.editLabelRow}>
                  <label className={styles.editLabel}>
                    Chủ đề con / Phân nhánh ({childTopics.length})
                  </label>
                </div>

                {childTopics.length > 0 ? (
                  <div className={styles.childTopicList}>
                    {childTopics.map((child) => {
                      const childId = child.nodeId || child.name || child.id;
                      const isRef = Boolean(child.ref?.isRef);
                      const sourceSlug = child.ref?.sourceRoadmapSlug;

                      return (
                        <div key={childId} className={styles.childTopicCard}>
                          <div className={styles.childTopicInfo}>
                            <span className={styles.childTopicTitle}>{child.title}</span>
                            {isRef && (
                              <span className={styles.refBadge}>
                                Tham chiếu từ [{sourceSlug}]
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            className={styles.unlinkBtn}
                            onClick={() => handleUnlinkChild(childId)}
                            title="Unlink this subtopic from parent topic"
                            disabled={saveStatus === 'saving'}
                          >
                            Unlink
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={styles.emptyChildNotice}>
                    Chưa có chủ đề con nào trực thuộc topic này.
                  </p>
                )}

                <button
                  type="button"
                  className={styles.addRefChildBtn}
                  onClick={() => setShowRefSearchModal(true)}
                  disabled={saveStatus === 'saving'}
                >
                  + Add Subtopic (From Ref)
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={styles.drawerFooter}>
            {isEditMode ? (
              <div className={styles.editActionFooter}>
                <button
                  type="button"
                  className={styles.deleteTopicBtn}
                  onClick={() => setShowDeleteModal(true)}
                  disabled={saveStatus === 'saving'}
                >
                  Delete Topic
                </button>
                <button
                  type="button"
                  className={styles.saveTopicBtn}
                  onClick={handleSaveTopic}
                  disabled={saveStatus === 'saving' || !title.trim()}
                >
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div className={styles.navButtons}>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={onPrevTopic}
                  disabled={!hasPrev}
                >
                  ← Previous Topic
                </button>
                <button
                  type="button"
                  className={`${styles.navButton} ${hasNext ? styles.navButtonPrimary : ''}`}
                  onClick={onNextTopic}
                  disabled={!hasNext}
                >
                  Next Topic →
                </button>
              </div>
            )}
            <div className={styles.footerCopyright}>Made by Anh Tu - Share to be share</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>

      {/* Modal xác nhận xoá topic */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        title={`Xoá chủ đề "${topic.title}"?`}
        message={`Bạn có chắc muốn xoá chủ đề này khỏi lộ trình? Dữ liệu sẽ được xoá vĩnh viễn khỏi MongoDB Atlas.`}
        onConfirm={handleDeleteTopic}
        onCancel={() => setShowDeleteModal(false)}
        isProcessing={isDeleting}
      />

      {/* Modal tìm kiếm và gán topic con tham chiếu */}
      <RefTopicSearchModal
        isOpen={showRefSearchModal}
        parentTopic={topic}
        onClose={() => setShowRefSearchModal(false)}
        onSelectTopic={handleSelectRefTopic}
        isProcessing={isAddingRef}
      />
    </>
  );
}
