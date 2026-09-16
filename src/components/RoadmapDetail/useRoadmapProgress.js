import { useState, useEffect, useCallback } from 'react';

const STORAGE_PREFIX = 'anhtus_roadmap_progress_';

export function useRoadmapProgress(slug, totalTopics = 0) {
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `${STORAGE_PREFIX}${slug}`;

  // Nạp trạng thái từ localStorage khi chạy trên trình duyệt (client-side)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCompletedTopics(new Set(parsed));
        }
      } else {
        setCompletedTopics(new Set());
      }
    } catch (err) {
      console.warn('Lỗi đọc tiến độ học tập từ localStorage:', err);
      setCompletedTopics(new Set());
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  // Bật/tắt trạng thái hoàn thành của một topic
  const toggleCompleted = useCallback((topicId) => {
    setCompletedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
        } catch (err) {
          console.warn('Lỗi lưu tiến độ học tập vào localStorage:', err);
        }
      }
      return next;
    });
  }, [storageKey]);

  // Đặt lại toàn bộ tiến độ của lộ trình về 0%
  const resetProgress = useCallback(() => {
    setCompletedTopics(new Set());
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
      } catch (err) {
        console.warn('Lỗi xóa tiến độ học tập trong localStorage:', err);
      }
    }
  }, [storageKey]);

  const isCompleted = useCallback((topicId) => completedTopics.has(topicId), [completedTopics]);

  const completedCount = completedTopics.size;
  const percentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  return {
    isLoaded,
    completedTopics,
    isCompleted,
    toggleCompleted,
    resetProgress,
    completedCount,
    percentage,
  };
}

// Hàm tiện ích lấy số lượng topic đã hoàn thành và % trên RoadmapHub
export function getSavedProgress(slug, totalTopics = 0) {
  if (typeof window === 'undefined' || !totalTopics) return { count: 0, percentage: 0 };
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${slug}`);
    if (!raw) return { count: 0, percentage: 0 };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { count: 0, percentage: 0 };
    const count = parsed.length;
    const percentage = Math.round((count / totalTopics) * 100);
    return { count, percentage };
  } catch {
    return { count: 0, percentage: 0 };
  }
}
