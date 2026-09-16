import React, { useMemo } from 'react';
import styles from './RoadmapTimeline.module.css';

/**
 * Thuật toán phân nhóm các subtopics trong một trạm thành:
 * - Các bước tuần tự (Linear Steps)
 * - Các cụm ngã rẽ công nghệ (Branch Clusters) dựa trên parentTopic
 */
function organizeSubtopicsIntoBlocks(subtopics = []) {
  if (!subtopics || subtopics.length === 0) return [];

  // Tìm các nhóm có parentTopic
  const parentGroups = new Map();
  const childTopicIds = new Set();

  subtopics.forEach((topic) => {
    if (topic.parentTopic && topic.parentTopic.title) {
      const parentKey = topic.parentTopic.id || topic.parentTopic.title;
      if (!parentGroups.has(parentKey)) {
        parentGroups.set(parentKey, {
          parentInfo: topic.parentTopic,
          children: [],
        });
      }
      parentGroups.get(parentKey).children.push(topic);
      childTopicIds.add(topic.nodeId || topic.name || topic.id);
    }
  });

  // Xác định các nhóm thực sự phân nhánh (có từ 2 topic con trở lên hoặc parentTopic rõ rệt)
  const validBranchKeys = new Set();
  parentGroups.forEach((val, key) => {
    if (val.children.length >= 2 || val.parentInfo?.title) {
      validBranchKeys.add(key);
    }
  });

  // Tìm các topic đóng vai trò là "Parent Lead topic" (nếu có trong danh sách)
  const parentLeadTopicIds = new Set();
  const parentLeadMap = new Map(); // parentKey -> leadTopic

  subtopics.forEach((topic) => {
    const topicId = topic.nodeId || topic.name || topic.id;
    for (const [key, group] of parentGroups.entries()) {
      if (
        key === topicId ||
        group.parentInfo.id === topicId ||
        group.parentInfo.title?.toLowerCase() === topic.title?.toLowerCase()
      ) {
        parentLeadTopicIds.add(topicId);
        parentLeadMap.set(key, topic);
      }
    }
  });

  // Xây dựng danh sách các blocks theo đúng thứ tự xuất hiện ban đầu
  const blocks = [];
  const processedBranchKeys = new Set();

  subtopics.forEach((topic) => {
    const topicId = topic.nodeId || topic.name || topic.id;

    // Nếu topic này là parent lead topic của một nhánh
    for (const [key, group] of parentGroups.entries()) {
      if (
        validBranchKeys.has(key) &&
        !processedBranchKeys.has(key) &&
        (parentLeadMap.get(key) === topic ||
          topic.parentTopic?.id === key ||
          topic.parentTopic?.title === key)
      ) {
        processedBranchKeys.add(key);
        const leadTopic = parentLeadMap.get(key);

        const branchTitle = leadTopic?.title || group.parentInfo?.title || 'Phân nhánh';

        blocks.push({
          type: 'branch',
          key: `branch-${key}`,
          title: branchTitle,
          description: leadTopic?.description || '',
          leadTopic: leadTopic || null,
          topics: group.children,
        });
        return;
      }
    }

    // Nếu topic này là con của một nhánh đã xử lý thì bỏ qua
    if (childTopicIds.has(topicId)) {
      return;
    }

    // Nếu là parent lead đã được gộp vào nhánh thì bỏ qua
    if (parentLeadTopicIds.has(topicId)) {
      return;
    }

    // Ngược lại, là một bước tuần tự cốt lõi (Linear Step)
    blocks.push({
      type: 'linear',
      topic,
    });
  });

  return blocks;
}

export default function RoadmapTimeline({
  roadmapData,
  isCompleted,
  onToggleCompleted,
  onSelectTopic,
  searchQuery,
  expandedModules,
  onToggleModule,
}) {
  // Chuẩn hóa cấu trúc dữ liệu thành danh sách các Station (Modules / Chặng)
  const stations = useMemo(() => {
    if (!roadmapData) return [];

    // Nếu roadmap có sẵn modules (Frontend, Javascript, NestJS, NextJS, NodeJS, System Design...)
    if (Array.isArray(roadmapData.modules) && roadmapData.modules.length > 0) {
      return roadmapData.modules.map((mod, idx) => ({
        id: mod.id || `mod-${idx}`,
        order: mod.order || idx + 1,
        title: mod.title || mod.name || `Chặng ${idx + 1}`,
        description: mod.description || '',
        subtopics: mod.subtopics || [],
        blocks: organizeSubtopicsIntoBlocks(mod.subtopics || []),
      }));
    }

    // Nếu roadmap chỉ có danh sách topics phẳng (React, Typescript, Docker, Kubernetes, Api Design...)
    if (Array.isArray(roadmapData.topics) && roadmapData.topics.length > 0) {
      return [
        {
          id: `${roadmapData.slug || 'roadmap'}-main`,
          order: 1,
          title: roadmapData.title || 'Chủ đề Lộ trình',
          description: roadmapData.description || '',
          subtopics: roadmapData.topics,
          blocks: organizeSubtopicsIntoBlocks(roadmapData.topics),
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
          const filteredSubtopics = matchStationTitle ? st.subtopics : matchedTopics;
          return {
            ...st,
            subtopics: filteredSubtopics,
            blocks: organizeSubtopicsIntoBlocks(filteredSubtopics),
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [stations, searchQuery]);

  return (
    <div className={styles.timelineWrapper}>
      <div className={styles.timelineTrack}>
        {filteredStations.map((station) => {
          const isExpanded = expandedModules.has(station.id);
          const totalInStation = station.subtopics.length;
          const completedInStation = station.subtopics.filter((t) =>
            isCompleted(t.nodeId || t.name || t.id)
          ).length;
          const isStationAllDone =
            totalInStation > 0 && completedInStation === totalInStation;

          return (
            <div key={station.id} className={styles.stationItem}>
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
                    </div>
                    {station.description && (
                      <p className={styles.stationDesc}>{station.description}</p>
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

                {/* Danh sách các blocks (Linear Steps + Branch Sections) */}
                {isExpanded && (
                  <div className={styles.subtopicsList}>
                    {station.blocks.map((block, bIdx) => {
                      // 1. Dòng tuần tự cốt lõi (Linear Step)
                      if (block.type === 'linear') {
                        const topic = block.topic;
                        const topicId = topic.nodeId || topic.name || topic.id;
                        const done = isCompleted(topicId);
                        const resCount = topic.resources?.length || 0;

                        return (
                          <div
                            key={topicId || `linear-${bIdx}`}
                            className={styles.topicRow}
                            onClick={() => onSelectTopic(topic)}
                          >
                            <div className={styles.topicLeft}>
                              <button
                                type="button"
                                className={`${styles.checkboxBtn} ${
                                  done ? styles.checkboxChecked : ''
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleCompleted(topicId);
                                }}
                                aria-label={`Đánh dấu ${topic.title}`}
                              >
                                {done ? '✓' : ''}
                              </button>

                              <span
                                className={`${styles.topicName} ${
                                  done ? styles.topicNameChecked : ''
                                }`}
                              >
                                {topic.title}
                              </span>
                            </div>

                            <div className={styles.topicRight}>
                              {resCount > 0 && (
                                <span className={styles.resourceCountBadge}>
                                  {resCount} tài liệu
                                </span>
                              )}
                              <span className={styles.openDrawerArrow}>→</span>
                            </div>
                          </div>
                        );
                      }

                      // 2. Cụm ngã rẽ công nghệ (Branch Section)
                      if (block.type === 'branch') {
                        return (
                          <div key={block.key || `branch-${bIdx}`} className={styles.branchSection}>
                            {/* Header Ngã rẽ */}
                            <div className={styles.branchForkHeader}>
                              <div className={styles.branchForkTitleRow}>
                                <div className={styles.branchDotMarker} />
                                <h4 className={styles.branchForkTitle}>{block.title}</h4>
                              </div>
                              {block.description && (
                                <p className={styles.branchForkDesc}>{block.description}</p>
                              )}
                              {block.leadTopic && (
                                <div
                                  className={styles.leadTopicLink}
                                  onClick={() => onSelectTopic(block.leadTopic)}
                                >
                                  <span>Xem tổng quan chủ đề này</span>
                                  <span>→</span>
                                </div>
                              )}
                            </div>

                            {/* Lưới các thẻ bài nhánh con (Branch Cards Grid) */}
                            <div className={styles.branchGrid}>
                              {block.topics.map((topic, cIdx) => {
                                const topicId = topic.nodeId || topic.name || topic.id;
                                const done = isCompleted(topicId);
                                const resCount = topic.resources?.length || 0;

                                return (
                                  <div
                                    key={topicId || `card-${cIdx}`}
                                    className={`${styles.branchCard} ${
                                      done ? styles.branchCardCompleted : ''
                                    }`}
                                    onClick={() => onSelectTopic(topic)}
                                  >
                                    <div className={styles.branchCardHeader}>
                                      <h5 className={styles.branchCardTitle}>{topic.title}</h5>
                                      <button
                                        type="button"
                                        className={`${styles.checkboxBtn} ${
                                          done ? styles.checkboxChecked : ''
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onToggleCompleted(topicId);
                                        }}
                                        aria-label={`Đánh dấu ${topic.title}`}
                                      >
                                        {done ? '✓' : ''}
                                      </button>
                                    </div>

                                    {topic.description && (
                                      <p className={styles.branchCardDesc}>
                                        {topic.description.slice(0, 110)}...
                                      </p>
                                    )}

                                    <div className={styles.branchCardFooter}>
                                      {resCount > 0 ? (
                                        <span className={styles.resourceCountBadge}>
                                          {resCount} tài liệu
                                        </span>
                                      ) : (
                                        <span />
                                      )}
                                      <span className={styles.branchCardAction}>Xem chi tiết →</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredStations.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              color: 'var(--ifm-color-emphasis-600)',
            }}
          >
            Không có chủ đề nào khớp với từ khóa "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  );
}
