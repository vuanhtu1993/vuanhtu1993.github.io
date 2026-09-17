import React, { useState, useMemo, useEffect } from 'react';
import roadmapIndexData from '@site/sources/roadmap-data/index.json';
import { getSavedProgress } from '../RoadmapDetail/useRoadmapProgress';
import { isRoadmapAvailable } from '../RoadmapDetail/dataLoader';
import styles from './RoadmapHub.module.css';

const TECH_BADGES = {
  'frontend': 'FE',
  'javascript': 'JS',
  'typescript': 'TS',
  'react': 'REACT',
  'nextjs': 'NEXT',
  'nestjs': 'NEST',
  'nodejs': 'NODE',
  'docker': 'DOCKER',
  'kubernetes': 'K8S',
  'api-design': 'API',
  'system-design': 'ARCH',
};

const CATEGORIES = [
  { key: 'all', label: 'Tất cả Lộ trình' },
  { key: 'role-based', label: 'Vị trí Công việc (Role-based)' },
  { key: 'skill-based', label: 'Kỹ năng & Ngôn ngữ (Skill-based)' },
  { key: 'tool-platform', label: 'Công cụ & Nền tảng (Tool & Platform)' },
  { key: 'best-practice', label: 'Quy chuẩn & Kiến trúc (Best Practices)' },
];

export default function RoadmapHub({ onSelectRoadmap }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [indexData, setIndexData] = useState(roadmapIndexData);

  // Ở môi trường dev, fetch live từ MongoDB để cập nhật thống kê và lộ trình mới tức thì
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      fetch('/api/roadmap/list')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.categories) {
            setIndexData(data);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Thu thập danh sách các roadmaps thực tế đang có sẵn
  const allRoadmaps = useMemo(() => {
    const list = [];
    if (indexData?.categories) {
      indexData.categories.forEach((cat) => {
        cat.roadmaps.forEach((rm) => {
          list.push({
            ...rm,
            categoryKey: cat.key,
            categoryNameVi: cat.nameVi,
          });
        });
      });
    }
    return list;
  }, [indexData]);

  // Lọc theo danh mục và từ khóa tìm kiếm
  const filteredRoadmaps = useMemo(() => {
    return allRoadmaps.filter((rm) => {
      const matchCat = selectedCategory === 'all' || rm.categoryKey === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        rm.title.toLowerCase().includes(query) ||
        rm.slug.toLowerCase().includes(query) ||
        (rm.categoryNameVi && rm.categoryNameVi.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });
  }, [allRoadmaps, selectedCategory, searchQuery]);

  // Thống kê tổng số
  const stats = useMemo(() => {
    const totalRoadmaps = allRoadmaps.length;
    const totalModules = allRoadmaps.reduce((acc, curr) => acc + (curr.moduleCount || 1), 0);
    const totalTopics = allRoadmaps.reduce((acc, curr) => acc + (curr.topicCount || 0), 0);
    return { totalRoadmaps, totalModules, totalTopics };
  }, [allRoadmaps]);

  return (
    <div className={styles.hubContainer}>
      {/* Hero Header */}
      <div className={styles.heroHeader}>
        <div className={styles.heroBadge}>
          <span>HỆ THỐNG LỘ TRÌNH KỸ THUẬT</span>
        </div>
        <h1 className={styles.heroTitle}>Developer Learning Roadmaps</h1>
        <p className={styles.heroSubtitle}>
          Hệ thống hóa lộ trình phát triển kỹ thuật phần mềm từ căn bản đến chuyên sâu theo từng chặng
          (Phased Milestones). Theo dõi tiến độ học tập và nắm bắt kiến thức một cách bài bản.
        </p>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.totalRoadmaps}</span>
            <span className={styles.statLabel}>Lộ trình chuẩn</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.totalModules}</span>
            <span className={styles.statLabel}>Chặng Modules</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.totalTopics}+</span>
            <span className={styles.statLabel}>Chủ đề Kiến thức</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className={styles.filterControls}>
        <div className={styles.categoryPills}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                className={`${styles.categoryPill} ${isActive ? styles.categoryPillActive : ''}`}
                onClick={() => setSelectedCategory(cat.key)}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className={styles.searchWrapper}>
          <svg
            className={styles.searchIconSvg}
            width="15"
            height="15"
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
            placeholder="Tìm kiếm lộ trình (Frontend, React, Docker, NestJS...)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Roadmaps Grid */}
      <div className={styles.cardsGrid}>
        {filteredRoadmaps.length > 0 ? (
          filteredRoadmaps.map((rm) => {
            const badgeText = TECH_BADGES[rm.slug] || 'DEV';
            const progress = getSavedProgress(rm.slug, rm.topicCount);
            const isCompleted = progress.percentage === 100;

            return (
              <div
                key={rm.slug}
                className={styles.roadmapCard}
                onClick={() => onSelectRoadmap(rm.slug)}
              >
                <div>
                  <div className={styles.cardHeader}>
                    <div className={styles.techBadge}>{badgeText}</div>
                    <span className={styles.categoryBadge}>{rm.categoryNameVi?.split(' ')[0] || 'Kỹ năng'}</span>
                  </div>

                  <h3 className={styles.cardTitle}>{rm.title}</h3>

                  <div className={styles.cardMeta}>
                    <span>{rm.moduleCount || 1} modules</span>
                    <span className={styles.metaDot}>•</span>
                    <span>{rm.topicCount} topics</span>
                  </div>
                </div>

                <div className={styles.progressContainer}>
                  <div className={styles.progressHeader}>
                    <span>Tiến độ học tập</span>
                    <span>
                      {progress.count}/{rm.topicCount} ({progress.percentage}%)
                    </span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div
                      className={`${styles.progressBarFill} ${
                        isCompleted ? styles.progressBarComplete : ''
                      }`}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>

                  <div className={styles.cardAction}>
                    <span>{progress.count > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.noResults}>
            Không tìm thấy lộ trình phù hợp với từ khóa "<strong>{searchQuery}</strong>".
          </div>
        )}
      </div>

      {/* Footer Copyright */}
      <div className={styles.footerCopyright}>Made by Anh Tu - Share to be share</div>
    </div>
  );
}
