import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { loadRoadmapData, invalidateCache } from './dataLoader';
import { useRoadmapProgress } from './useRoadmapProgress';
import { EditModeProvider, useEditMode } from './EditModeContext';
import * as Dialog from '@radix-ui/react-dialog';
import RoadmapTimeline from './RoadmapTimeline';
import TopicDrawer from './TopicDrawer';
import styles from './RoadmapDetail.module.css';

/**
 * Giao diện chi tiết lộ trình kèm theo tương tác tiến độ và Edit Mode (dev-only)
 */
function RoadmapDetailView({ slug, onBack, data, setData }) {
  const { isEditMode, toggleEditMode, isDevMode } = useEditMode();

  // Bộ lọc tìm kiếm topic trong roadmap
  const [searchQuery, setSearchQuery] = useState('');

  // Quản lý các Module mở rộng (mặc định mở rộng toàn bộ các modules)
  const [expandedModules, setExpandedModules] = useState(() => {
    const initialExpanded = new Set();
    if (data?.modules && data.modules.length > 0) {
      data.modules.forEach((m, idx) => {
        initialExpanded.add(m.id || `mod-${idx}`);
      });
    } else if (data?.topics && data.topics.length > 0) {
      initialExpanded.add(`${data.slug || 'roadmap'}-main`);
    }
    return initialExpanded;
  });

  // Tự động mở rộng các module mới khi data được cập nhật
  useEffect(() => {
    if (data?.modules && data.modules.length > 0) {
      setExpandedModules((prev) => {
        const next = new Set(prev);
        data.modules.forEach((m, idx) => {
          next.add(m.id || `mod-${idx}`);
        });
        return next;
      });
    }
  }, [data]);

  // Quản lý Topic Drawer
  const [activeTopic, setActiveTopic] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modal xác nhận Reset State
  const [showResetModal, setShowResetModal] = useState(false);

  // Thu thập danh sách toàn bộ các topic (phẳng) theo thứ tự để phục vụ chuyển tiếp trước / sau
  const flattenedTopics = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data.modules) && data.modules.length > 0) {
      const list = [];
      data.modules.forEach((mod) => {
        if (Array.isArray(mod.subtopics)) {
          list.push(...mod.subtopics);
        }
      });
      return list;
    }
    if (Array.isArray(data.topics)) {
      return data.topics;
    }
    return [];
  }, [data]);

  const totalTopicsCount = flattenedTopics.length;

  // Custom hook theo dõi tiến độ
  const {
    isCompleted,
    toggleCompleted,
    resetProgress,
    completedCount,
    percentage,
  } = useRoadmapProgress(slug, totalTopicsCount);

  // Xử lý đóng / mở một module
  const handleToggleModule = useCallback((moduleId) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }, []);

  // Mở rộng tất cả các modules
  const handleExpandAll = useCallback(() => {
    const all = new Set();
    if (data?.modules && data.modules.length > 0) {
      data.modules.forEach((m, idx) => all.add(m.id || `mod-${idx}`));
    } else if (data?.topics) {
      all.add(`${data.slug || 'roadmap'}-main`);
    }
    setExpandedModules(all);
  }, [data]);

  // Thu gọn tất cả các modules
  const handleCollapseAll = useCallback(() => {
    setExpandedModules(new Set());
  }, []);

  // Mở Topic Drawer
  const handleSelectTopic = useCallback((topic) => {
    setActiveTopic(topic);
    setIsDrawerOpen(true);
  }, []);

  // Điều hướng Topic trước / sau trong Drawer
  const currentTopicIndex = useMemo(() => {
    if (!activeTopic || flattenedTopics.length === 0) return -1;
    const activeId = activeTopic.nodeId || activeTopic.name || activeTopic.id;
    return flattenedTopics.findIndex(
      (t) => (t.nodeId || t.name || t.id) === activeId
    );
  }, [activeTopic, flattenedTopics]);

  const hasPrev = currentTopicIndex > 0;
  const hasNext = currentTopicIndex >= 0 && currentTopicIndex < flattenedTopics.length - 1;

  const handlePrevTopic = useCallback(() => {
    if (hasPrev) {
      setActiveTopic(flattenedTopics[currentTopicIndex - 1]);
    }
  }, [hasPrev, currentTopicIndex, flattenedTopics]);

  const handleNextTopic = useCallback(() => {
    if (hasNext) {
      setActiveTopic(flattenedTopics[currentTopicIndex + 1]);
    }
  }, [hasNext, currentTopicIndex, flattenedTopics]);

  // Đồng bộ activeTopic khi data cập nhật từ server/MongoDB
  useEffect(() => {
    if (activeTopic && flattenedTopics.length > 0) {
      const activeId = activeTopic.nodeId || activeTopic.name || activeTopic.id;
      const updated = flattenedTopics.find((t) => (t.nodeId || t.name || t.id) === activeId);
      if (updated) {
        setActiveTopic(updated);
      }
    }
  }, [flattenedTopics]);

  // Xác nhận Reset Progress
  const handleConfirmReset = () => {
    resetProgress();
    setShowResetModal(false);
  };

  const isAllComplete = percentage === 100;

  return (
    <div className={styles.detailContainer}>
      {/* Sticky Header Bar */}
      <div className={styles.stickyHeader}>
        <div className={styles.headerContent}>
          {/* Top Row: Back, Title, Actions */}
          <div className={styles.headerTopRow}>
            <div className={styles.titleArea}>
              <button type="button" className={styles.backBtn} onClick={onBack}>
                <span className={styles.backIcon}>←</span>
                <span className={styles.backText}>Roadmaps</span>
              </button>
              <h1 className={styles.roadmapTitle}>{data.title}</h1>
            </div>

            <div className={styles.actionsArea}>
              {/* Nút Toggle Edit Mode (Chỉ hiển thị trên môi trường Dev) */}
              {isDevMode && (
                <button
                  type="button"
                  className={`${styles.actionBtn} ${
                    isEditMode ? styles.editToggleBtnActive : styles.editToggleBtn
                  }`}
                  onClick={toggleEditMode}
                  title={isEditMode ? 'Exit edit mode' : 'Enable edit mode (Dev only)'}
                >
                  <span className={styles.editModeDot} />
                  <span>{isEditMode ? 'Editing' : 'Edit (Dev)'}</span>
                </button>
              )}

              <button
                type="button"
                className={styles.actionBtn}
                onClick={expandedModules.size > 0 ? handleCollapseAll : handleExpandAll}
                title={expandedModules.size > 0 ? 'Thu gọn tất cả chặng' : 'Mở rộng tất cả chặng'}
              >
                {expandedModules.size > 0 ? 'Collapse' : 'Expand'}
              </button>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.resetBtn}`}
                onClick={() => setShowResetModal(true)}
                title="Reset all progress for this roadmap"
              >
                <span className={styles.resetBtnFullText}>Reset Progress</span>
                <span className={styles.resetBtnShortText}>Reset</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Progress Bar & In-page Search */}
          <div className={styles.headerBottomRow}>
            <div className={styles.progressSection}>
              <div className={styles.progressMeta}>
                <span>
                  Tiến độ: {completedCount}/{totalTopicsCount} topics
                </span>
                <span>{percentage}%</span>
              </div>
              <div className={styles.progressBarBg}>
                <div
                  className={`${styles.progressBarFill} ${
                    isAllComplete ? styles.progressBarComplete : ''
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <div className={styles.searchInputWrapper}>
              <svg
                className={styles.searchIconSvg}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Lọc chủ đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Metro-Map Timeline */}
      <RoadmapTimeline
        roadmapData={data}
        isCompleted={isCompleted}
        onToggleCompleted={toggleCompleted}
        onSelectTopic={handleSelectTopic}
        searchQuery={searchQuery}
        expandedModules={expandedModules}
        onToggleModule={handleToggleModule}
      />

      {/* Slide-over Topic Drawer */}
      <TopicDrawer
        topic={activeTopic}
        allTopics={flattenedTopics}
        onSelectTopic={handleSelectTopic}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isCompleted={
          activeTopic
            ? isCompleted(activeTopic.nodeId || activeTopic.name || activeTopic.id)
            : false
        }
        onToggleCompleted={toggleCompleted}
        onPrevTopic={handlePrevTopic}
        onNextTopic={handleNextTopic}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />

      {/* Reset Confirmation Modal (Radix UI Primitives) */}
      <Dialog.Root open={showResetModal} onOpenChange={setShowResetModal}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.modalOverlay} />
          <Dialog.Content className={styles.modalBox}>
            <Dialog.Title className={styles.modalTitle}>Xác nhận đặt lại tiến độ?</Dialog.Title>
            <Dialog.Description className={styles.modalText}>
              Toàn bộ các chủ đề bạn đã đánh dấu hoàn thành trong lộ trình <strong>{data.title}</strong>{' '}
              sẽ được đưa về trạng thái ban đầu (0%). Hành động này không thể hoàn tác.
            </Dialog.Description>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirmBtn}
                onClick={handleConfirmReset}
              >
                Confirm Reset
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Footer */}
      <div className={styles.footerCopyright}>Made by Anh Tu - Share to be share</div>
    </div>
  );
}

export default function RoadmapDetail({ slug, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tải lại dữ liệu mới nhất từ MongoDB Atlas sau khi người dùng sửa/xoá
  const refreshData = useCallback(async () => {
    invalidateCache(slug);
    try {
      const res = await loadRoadmapData(slug);
      setData(res);
    } catch (err) {
      console.error('Lỗi khi tải lại dữ liệu lộ trình:', err);
    }
  }, [slug]);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    loadRoadmapData(slug)
      .then((res) => {
        if (!isMounted) return;
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Không thể tải dữ liệu lộ trình.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.statusContainer}>
        <div className={styles.spinner} />
        <p>Đang tải dữ liệu lộ trình...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.statusContainer}>
        <h2 className={styles.errorTitle}>Không tìm thấy lộ trình</h2>
        <p>{error || 'Dữ liệu không tồn tại.'}</p>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← Back to Roadmaps
        </button>
      </div>
    );
  }

  return (
    <EditModeProvider slug={slug} onDataChanged={refreshData}>
      <RoadmapDetailView slug={slug} onBack={onBack} data={data} setData={setData} />
    </EditModeProvider>
  );
}
