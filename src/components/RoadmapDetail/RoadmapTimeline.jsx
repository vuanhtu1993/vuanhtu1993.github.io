import React, { useMemo, useState } from 'react';
import MarkdownRenderer from '../shared/MarkdownRenderer';
import { useEditMode } from './EditModeContext';
import EditModuleModal from './EditModuleModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import AddTopicModal from './AddTopicModal';
import AddModuleModal from './AddModuleModal';
import styles from './RoadmapTimeline.module.css';

const EditIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export default function RoadmapTimeline({
  roadmapData,
  isCompleted,
  onToggleCompleted,
  onSelectTopic,
  searchQuery,
  expandedModules,
  onToggleModule,
}) {
  const { isEditMode, updateModule, deleteModule, addModule, deleteTopic, addTopic } = useEditMode();

  // Modals state
  const [editingModule, setEditingModule] = useState(null);
  const [isSavingModule, setIsSavingModule] = useState(false);
  const [deletingModule, setDeletingModule] = useState(null);
  const [isDeletingModule, setIsDeletingModule] = useState(false);
  const [deletingTopic, setDeletingTopic] = useState(null);
  const [isDeletingTopic, setIsDeletingTopic] = useState(false);

  // Modal thêm topic mới vào chặng
  const [addingTopicStation, setAddingTopicStation] = useState(null);
  const [initialInsertPosition, setInitialInsertPosition] = useState(null);
  const [initialTopicTab, setInitialTopicTab] = useState('ref');
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  // Modal thêm chặng mới (Module)
  const [addingModulePosition, setAddingModulePosition] = useState(null);
  const [isAddingModule, setIsAddingModule] = useState(false);

  // Chuẩn hóa cấu trúc dữ liệu: Mô hình 2 tầng chuẩn mực (Module -> Topics)
  const stations = useMemo(() => {
    if (!roadmapData) return [];

    // Nếu roadmap có sẵn modules (Frontend, Javascript, NestJS, NextJS, NodeJS, System Design...)
    if (Array.isArray(roadmapData.modules) && roadmapData.modules.length > 0) {
      return roadmapData.modules.map((mod, idx) => {
        const sortedSubtopics = [...(mod.subtopics || [])].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );
        return {
          id: mod.id || `mod-${idx}`,
          order: mod.order || idx + 1,
          title: mod.title || mod.name || `Chặng ${idx + 1}`,
          description: mod.description || '',
          subtopics: sortedSubtopics,
        };
      });
    }

    // Nếu roadmap chỉ có danh sách topics phẳng (React, Typescript, Docker, Kubernetes, Api Design...)
    if (Array.isArray(roadmapData.topics) && roadmapData.topics.length > 0) {
      const sortedTopics = [...roadmapData.topics].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );
      return [
        {
          id: `${roadmapData.slug || 'roadmap'}-main`,
          order: 1,
          title: roadmapData.title || 'Chủ đề Lộ trình',
          description: roadmapData.description || '',
          subtopics: sortedTopics,
        },
      ];
    }

    return [];
  }, [roadmapData]);

  // Lọc theo searchQuery nếu người dùng tìm kiếm topic trong roadmap
  const filteredStations = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return stations;

    return stations
      .map((st) => {
        const matchStationTitle = st.title.toLowerCase().includes(q);
        const matchedTopics = st.subtopics.filter((t) => {
          return (
            t.title?.toLowerCase().includes(q) ||
            t.name?.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q)
          );
        });

        if (matchStationTitle || matchedTopics.length > 0) {
          return {
            ...st,
            subtopics: matchStationTitle ? st.subtopics : matchedTopics,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [stations, searchQuery]);

  // Cập nhật module
  const handleSaveModule = async (updates) => {
    if (!editingModule) return;
    setIsSavingModule(true);
    try {
      await updateModule(editingModule.id, updates);
      setEditingModule(null);
    } catch (err) {
      alert(`Lỗi khi cập nhật module: ${err.message}`);
    } finally {
      setIsSavingModule(false);
    }
  };

  // Xác nhận xoá module
  const handleConfirmDeleteModule = async () => {
    if (!deletingModule) return;
    setIsDeletingModule(true);
    try {
      await deleteModule(deletingModule.id);
      setDeletingModule(null);
    } catch (err) {
      alert(`Lỗi khi xoá module: ${err.message}`);
    } finally {
      setIsDeletingModule(false);
    }
  };

  // Xác nhận xoá topic
  const handleConfirmDeleteTopic = async () => {
    if (!deletingTopic) return;
    setIsDeletingTopic(true);
    try {
      const topicId = deletingTopic.nodeId || deletingTopic.name || deletingTopic.id;
      await deleteTopic(topicId);
      setDeletingTopic(null);
    } catch (err) {
      alert(`Lỗi khi xoá topic: ${err.message}`);
    } finally {
      setIsDeletingTopic(false);
    }
  };

  // Mở modal thêm Topic vào chặng (có thể chỉ định vị trí chèn và tab)
  const handleOpenAddTopic = (station, insertPosition = null, tab = 'ref') => {
    setAddingTopicStation(station);
    setInitialInsertPosition(insertPosition);
    setInitialTopicTab(tab);
  };

  // Xử lý lưu Topic mới
  const handleSaveTopic = async (topicData) => {
    setIsAddingTopic(true);
    try {
      await addTopic(topicData);
      setAddingTopicStation(null);
      setInitialInsertPosition(null);
    } catch (err) {
      alert(`Lỗi khi thêm chủ đề: ${err.message}`);
    } finally {
      setIsAddingTopic(false);
    }
  };

  // Mở modal thêm Chặng mới
  const handleOpenAddModule = (insertPosition = null) => {
    setAddingModulePosition(insertPosition);
  };

  // Xử lý lưu Chặng mới
  const handleSaveNewModule = async ({ title, description, insertPosition }) => {
    setIsAddingModule(true);
    try {
      await addModule({ title, description, insertPosition });
      setAddingModulePosition(null);
    } catch (err) {
      alert(`Lỗi khi tạo chặng mới: ${err.message}`);
    } finally {
      setIsAddingModule(false);
    }
  };

  return (
    <>
      <div className={styles.timelineWrapper}>
        <div className={styles.timelineTrack}>
          {filteredStations.map((station, sIdx) => {
            const isExpanded = expandedModules.has(station.id);
            const totalInStation = station.subtopics.length;
            const completedInStation = station.subtopics.filter((t) =>
              isCompleted(t.nodeId || t.name || t.id)
            ).length;
            const isStationAllDone =
              totalInStation > 0 && completedInStation === totalInStation;

            return (
              <React.Fragment key={station.id}>
                {/* Nút chèn chặng mới lên đầu trước chặng số 0 */}
                {isEditMode && sIdx === 0 && (
                  <div className={styles.stationInsertDivider}>
                    <button
                      type="button"
                      className={styles.stationInsertBtn}
                      onClick={() => handleOpenAddModule({ type: 'start' })}
                      title="Insert module at the top"
                    >
                      <span className={styles.stationInsertPlus}>+</span>
                      <span className={styles.stationInsertText}>Insert Module at Top</span>
                    </button>
                  </div>
                )}

                <div className={styles.stationItem}>
                  {/* Trạm dừng Metro số thứ tự */}
                  <div
                    className={`${styles.stationStop} ${
                      isStationAllDone ? styles.stationStopCompleted : ''
                    }`}
                  >
                    {isStationAllDone ? '✓' : station.order}
                  </div>

                  {/* Station Card */}
                  <div className={styles.stationCard}>
                    <div
                      className={styles.stationHeader}
                      onClick={() => onToggleModule(station.id)}
                    >
                      <div className={styles.stationInfo}>
                        <div className={styles.stationTitleRow}>
                          <h3 className={styles.stationTitle}>{station.title}</h3>
                          <span
                            className={`${styles.stationBadge} ${
                              isStationAllDone ? styles.stationBadgeCompleted : ''
                            }`}
                          >
                            {completedInStation}/{totalInStation} hoàn thành
                          </span>

                          {/* Edit Mode Buttons cho Module */}
                          {isEditMode && (
                            <div
                              className={styles.moduleActionGroup}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className={styles.moduleEditBtn}
                                onClick={() => setEditingModule(station)}
                                title="Edit Module"
                              >
                                <EditIcon />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className={styles.moduleDeleteBtn}
                                onClick={() => setDeletingModule(station)}
                                title="Delete this Module"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Station text snippet khi thu gọn (loại bỏ code blocks để không vỡ header) */}
                        {!isExpanded && station.description && (
                          <p className={styles.stationHeaderSnippet}>
                            {(() => {
                              const clean = station.description
                                .replace(/```[\s\S]*?```/g, '')
                                .replace(/[#*`_\[\]()]/g, '')
                                .trim();
                              return clean.length > 140 ? clean.slice(0, 140) + '...' : clean;
                            })()}
                          </p>
                        )}
                      </div>

                      <span
                        className={`${styles.chevronIcon} ${
                          isExpanded ? styles.chevronOpen : ''
                        }`}
                      >
                        ▼
                      </span>
                    </div>

                    {/* Danh sách các chủ đề (Topics) trực tiếp bên trong Chặng */}
                    {isExpanded && (
                      <div className={styles.subtopicsList}>
                        {/* Mô tả chi tiết và sơ đồ của Chặng khi mở rộng */}
                        {station.description && (
                          <div className={styles.stationOverview}>
                            <MarkdownRenderer content={station.description} />
                          </div>
                        )}

                        {/* Trạng thái chặng rỗng khi không ở Edit Mode */}
                        {station.subtopics.length === 0 && !isEditMode && (
                          <div className={styles.emptyModuleNotice}>
                            <p>Chặng này chưa có chủ đề nào.</p>
                          </div>
                        )}

                        {/* Danh sách các chủ đề dạng Card Grid */}
                        {(station.subtopics.length > 0 || isEditMode) && (
                          <div className={styles.topicsContainer}>
                            <div className={styles.topicGrid}>
                              {station.subtopics.map((topic, tIdx) => {
                                const topicId = topic.nodeId || topic.name || topic.id;
                                const done = isCompleted(topicId);
                                const resCount = topic.resources?.length || 0;

                                // Xử lý mô tả rút gọn
                                const cleanDesc = topic.description
                                  ? topic.description
                                      .replace(/```[\s\S]*?```/g, '')
                                      .replace(/[#*`_\[\]()]/g, '')
                                      .trim()
                                  : '';

                                return (
                                  <div
                                    key={topicId || `topic-${tIdx}`}
                                    className={`${styles.topicCard} ${
                                      done ? styles.topicCardCompleted : ''
                                    }`}
                                    onClick={() => onSelectTopic(topic)}
                                  >
                                    {/* Header Card: Tiêu đề + Actions */}
                                    <div className={styles.topicCardHeader}>
                                      <h4
                                        className={`${styles.topicCardTitle} ${
                                          done ? styles.topicCardTitleChecked : ''
                                        }`}
                                      >
                                        {topic.title}
                                      </h4>

                                      <div
                                        className={styles.topicCardActions}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {isEditMode && (
                                          <button
                                            type="button"
                                            className={styles.quickDeleteTopicBtn}
                                            onClick={() => setDeletingTopic(topic)}
                                            title="Delete this topic"
                                          >
                                            <TrashIcon />
                                          </button>
                                        )}

                                        <button
                                          type="button"
                                          className={`${styles.checkboxBtn} ${
                                            done ? styles.checkboxChecked : ''
                                          }`}
                                          onClick={() => onToggleCompleted(topicId)}
                                          aria-label={`Mark ${topic.title} as completed`}
                                        >
                                          {done ? '✓' : ''}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Body Card: Tóm tắt mô tả */}
                                    {cleanDesc && (
                                      <p className={styles.topicCardDesc}>{cleanDesc}</p>
                                    )}

                                    {/* Footer Card: Badge tài liệu + REF + nút Khám phá */}
                                    <div className={styles.topicCardFooter}>
                                      <div className={styles.topicCardBadgeGroup}>
                                        {topic.ref && (
                                          <span
                                            className={styles.refBadge}
                                            title={`Tham chiếu từ ${topic.ref.sourceRoadmapSlug}`}
                                          >
                                            REF
                                          </span>
                                        )}

                                        {resCount > 0 ? (
                                          <span className={styles.resourceCountBadge}>
                                            {resCount} tài liệu
                                          </span>
                                        ) : (
                                          <span />
                                        )}
                                      </div>

                                      <span className={styles.topicCardAction}>Explore →</span>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Card thêm mới ở cuối trong chế độ Edit Mode */}
                              {isEditMode && (
                                <div
                                  className={styles.addTopicCard}
                                  onClick={() => handleOpenAddTopic(station, { type: 'end' }, 'ref')}
                                  role="button"
                                  tabIndex={0}
                                  title="Add topic to this module (Search Ref or create new)"
                                >
                                  <div className={styles.addTopicCardMain}>
                                    <div className={styles.addTopicCardPlus}>+</div>
                                    <h5 className={styles.addTopicCardTitle}>Add New Topic</h5>
                                    <p className={styles.addTopicCardSub}>
                                      Search topic to reference or create new
                                    </p>
                                  </div>

                                  <div
                                    className={styles.addTopicCardBtnGroup}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      className={styles.addTopicCardRefBtn}
                                      onClick={() => handleOpenAddTopic(station, { type: 'end' }, 'ref')}
                                      title="Search topics from knowledge base to reference"
                                    >
                                      🔍 Search Ref
                                    </button>
                                    <button
                                      type="button"
                                      className={styles.addTopicCardNewBtn}
                                      onClick={() => handleOpenAddTopic(station, { type: 'end' }, 'new')}
                                      title="Create new topic"
                                    >
                                      ✏️ Create New
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Nút chèn chặng mới ngay sau chặng này */}
                {isEditMode && (
                  <div className={styles.stationInsertDivider}>
                    <button
                      type="button"
                      className={styles.stationInsertBtn}
                      onClick={() =>
                        handleOpenAddModule({
                          type: 'after',
                          targetModuleId: station.id,
                          targetTitle: station.title,
                        })
                      }
                      title={
                        sIdx === filteredStations.length - 1
                          ? 'Add new module at the end'
                          : `Insert module after "${station.title}"`
                      }
                    >
                      <span className={styles.stationInsertPlus}>+</span>
                      <span className={styles.stationInsertText}>
                        {sIdx === filteredStations.length - 1
                          ? 'Add New Module'
                          : `Insert Module after "${station.title}"`}
                      </span>
                    </button>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Modal chỉnh sửa Module */}
      <EditModuleModal
        isOpen={Boolean(editingModule)}
        module={editingModule}
        onSave={handleSaveModule}
        onCancel={() => setEditingModule(null)}
        isSaving={isSavingModule}
      />

      {/* Modal xác nhận xoá Module */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingModule)}
        title={`Xoá Module "${deletingModule?.title}"?`}
        message="Hành động này sẽ xoá toàn bộ các chủ đề (topics) thuộc module này khỏi MongoDB Atlas."
        onConfirm={handleConfirmDeleteModule}
        onCancel={() => setDeletingModule(null)}
        isProcessing={isDeletingModule}
      />

      {/* Modal xác nhận xoá Topic */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingTopic)}
        title={`Xoá chủ đề "${deletingTopic?.title}"?`}
        message="Bạn có chắc chắn muốn xoá chủ đề này khỏi lộ trình? Dữ liệu sẽ được xoá vĩnh viễn khỏi MongoDB Atlas."
        onConfirm={handleConfirmDeleteTopic}
        onCancel={() => setDeletingTopic(null)}
        isProcessing={isDeletingTopic}
      />

      {/* Modal thêm Topic vào chặng với hỗ trợ chèn vị trí bất kỳ */}
      <AddTopicModal
        isOpen={Boolean(addingTopicStation)}
        station={addingTopicStation}
        initialInsertPosition={initialInsertPosition}
        initialTab={initialTopicTab}
        onClose={() => {
          setAddingTopicStation(null);
          setInitialInsertPosition(null);
        }}
        onSave={handleSaveTopic}
        isProcessing={isAddingTopic}
      />

      {/* Modal thêm Chặng mới (Module) với hỗ trợ vị trí bất kỳ */}
      <AddModuleModal
        isOpen={Boolean(addingModulePosition)}
        insertPosition={addingModulePosition}
        stations={stations}
        onSave={handleSaveNewModule}
        onCancel={() => setAddingModulePosition(null)}
        isSaving={isAddingModule}
      />
    </>
  );
}
