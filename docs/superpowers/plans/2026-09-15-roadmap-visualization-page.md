# Developer Roadmaps Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng trang `/roadmap` trên website Docusaurus trực quan hóa các lộ trình học kỹ thuật từ `sources/roadmap-data/` theo mô hình Phased Metro-Map Timeline, kèm Drawer bài học chi tiết, theo dõi tiến độ qua `localStorage` và nút Reset State.

**Architecture:** 
- `src/pages/roadmap/index.jsx`: Entry point Docusaurus với routing client-side (`/roadmap` cho Hub và `/roadmap?slug=...` cho Detail).
- `src/components/RoadmapHub/`: Dashboard danh mục 4 nhóm, thanh tìm kiếm từ khóa, lưới Roadmap Cards với thanh % tiến độ học tập thực tế.
- `src/components/RoadmapDetail/`:
  - `dataLoader.js`: Lazy loading dữ liệu JSON của roadmap theo slug khi cần.
  - `useRoadmapProgress.js`: Hook quản lý tiến độ hoàn thành topic và Reset state qua `localStorage`.
  - `RoadmapTimeline.jsx`: Metro-line Timeline hiển thị các trạm dừng (Modules/Phases), danh sách topic có checkbox và nhãn hoàn thành.
  - `TopicDrawer.jsx`: Slide-over panel hiển thị mô tả khái niệm, markdown content, danh sách tài nguyên (docs, article, video) và điều hướng topic trước/sau.

**Tech Stack:** React 18, Docusaurus v3.7, CSS Modules, Infima theme variables (Dark/Light mode native), LocalStorage API.

---

### Task 1: Thêm Menu Navigation vào `docusaurus.config.js`

**Files:**
- Modify: `docusaurus.config.js:109-111`

- [ ] **Step 1: Cập nhật navbar items trong `docusaurus.config.js`**

Thêm mục `{ to: '/roadmap', label: 'Roadmap', position: 'left' }` ngay sau mục `Ontology`:
```javascript
          { to: '/blog', label: 'Blog', position: 'left' },
          { to: '/ontology', label: 'Ontology', position: 'left' },
          { to: '/roadmap', label: 'Roadmap', position: 'left' },
```

- [ ] **Step 2: Kiểm tra cú pháp file cấu hình**

Chạy: `node -c docusaurus.config.js`
Kỳ vọng: Lệnh chạy thành công, không có lỗi cú pháp syntax.

---

### Task 2: Xây dựng Module Tải Dữ liệu & Custom Hook Quản lý Tiến độ (`useRoadmapProgress` & `dataLoader`)

**Files:**
- Create: `src/components/RoadmapDetail/dataLoader.js`
- Create: `src/components/RoadmapDetail/useRoadmapProgress.js`

- [ ] **Step 1: Tạo `src/components/RoadmapDetail/dataLoader.js`**

```javascript
/**
 * Trình tải dữ liệu on-demand cho các roadmap
 * Giúp tối ưu hóa dung lượng bundle, chỉ tải file JSON khi người học mở lộ trình tương ứng.
 */

const ROADMAP_LOADERS = {
  'frontend': () => import('@site/sources/roadmap-data/role-based/frontend.json'),
  'javascript': () => import('@site/sources/roadmap-data/skill-based/javascript.json'),
  'nextjs': () => import('@site/sources/roadmap-data/skill-based/nextjs.json'),
  'nodejs': () => import('@site/sources/roadmap-data/skill-based/nodejs.json'),
  'react': () => import('@site/sources/roadmap-data/skill-based/react.json'),
  'typescript': () => import('@site/sources/roadmap-data/skill-based/typescript.json'),
  'docker': () => import('@site/sources/roadmap-data/tool-platform/docker.json'),
  'kubernetes': () => import('@site/sources/roadmap-data/tool-platform/kubernetes.json'),
  'api-design': () => import('@site/sources/roadmap-data/best-practice/api-design.json'),
  'system-design': () => import('@site/sources/roadmap-data/best-practice/system-design.json'),
};

export async function loadRoadmapData(slug) {
  const loader = ROADMAP_LOADERS[slug];
  if (!loader) {
    throw new Error(`Roadmap slug "${slug}" not found in registry.`);
  }
  const module = await loader();
  return module.default || module;
}
```

- [ ] **Step 2: Tạo `src/components/RoadmapDetail/useRoadmapProgress.js`**

```javascript
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

// Hàm tiện ích lấy nhanh tiến độ cho từng roadmap trên Hub
export function getSavedProgressPercentage(slug, totalTopics) {
  if (typeof window === 'undefined' || !totalTopics) return 0;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${slug}`);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;
    return Math.round((parsed.length / totalTopics) * 100);
  } catch {
    return 0;
  }
}
```

- [ ] **Step 3: Kiểm tra tính toàn vẹn cú pháp**

Chạy: `node -c src/components/RoadmapDetail/dataLoader.js src/components/RoadmapDetail/useRoadmapProgress.js`
Kỳ vọng: Cả 2 file không có lỗi syntax.

---

### Task 3: Xây dựng Giao diện Trang Hub (`RoadmapHub`)

**Files:**
- Create: `src/components/RoadmapHub/RoadmapHub.module.css`
- Create: `src/components/RoadmapHub/RoadmapHub.jsx`

- [ ] **Step 1: Tạo `src/components/RoadmapHub/RoadmapHub.module.css`**

Tạo kiểu dáng thanh lịch, hiện đại với hiệu ứng Dark/Light theme, glassmorphism và CSS Grid responsive.

- [ ] **Step 2: Tạo `src/components/RoadmapHub/RoadmapHub.jsx`**

Render danh sách 10 lộ trình từ `sources/roadmap-data/index.json`, bao gồm:
- Bộ lọc theo 4 nhóm phân loại (*Role-based, Skill-based, Tool-platform, Best-practice*).
- Ô tìm kiếm roadmap.
- Card hiển thị icon công nghệ, tên, thống kê modules/topics, và thanh tiến độ thực tế người học đã đạt được.
- Sự kiện click vào thẻ gọi hàm `onSelectRoadmap(slug)`.

- [ ] **Step 3: Kiểm tra component với cú pháp Node**

Chạy: `node -c src/components/RoadmapHub/RoadmapHub.jsx`
Kỳ vọng: File hợp lệ.

---

### Task 4: Xây dựng Metro-Map Phased Timeline (`RoadmapTimeline`) & Slide-over Drawer (`TopicDrawer`)

**Files:**
- Create: `src/components/RoadmapDetail/RoadmapTimeline.module.css`
- Create: `src/components/RoadmapDetail/RoadmapTimeline.jsx`
- Create: `src/components/RoadmapDetail/TopicDrawer.module.css`
- Create: `src/components/RoadmapDetail/TopicDrawer.jsx`

- [ ] **Step 1: Tạo `RoadmapTimeline`**
  - Xử lý 2 kiểu dữ liệu trong roadmap:
    - Nếu roadmap có `modules`: render các trạm dừng (Station Nodes) tuần tự từ 1 đến N. Mỗi module chứa danh sách `subtopics`.
    - Nếu roadmap có danh sách `topics` phẳng (như React, Docker): tự động gom nhóm hoặc đánh số thứ tự tuần tự rõ ràng.
  - Hỗ trợ đóng mở từng module (Accordion toggle).
  - Mỗi topic item gồm:
    - Nút checkbox tròn đánh dấu nhanh đã học (toggle).
    - Tên topic + Icon hiển thị trạng thái hoàn thành.
    - Click vào tên mở `TopicDrawer`.

- [ ] **Step 2: Tạo `TopicDrawer`**
  - Khung trượt từ bên phải với Backdrop mờ.
  - Hiển thị mô tả khái niệm (Description).
  - Định dạng nội dung bài học Markdown với các đoạn giải thích trực quan.
  - Danh sách tài nguyên tham khảo (Official docs, Articles, Videos, GitHub) phân loại bằng badge trực quan.
  - Nút chuyển tiếp `← Chủ đề trước` và `Chủ đề sau →`.
  - Footer bản quyền: *"Made by Anh Tu - Share to be share"*.

---

### Task 5: Xây dựng Container Chi tiết Lộ trình (`RoadmapDetail`)

**Files:**
- Create: `src/components/RoadmapDetail/RoadmapDetail.module.css`
- Create: `src/components/RoadmapDetail/RoadmapDetail.jsx`

- [ ] **Step 1: Tạo `RoadmapDetail.jsx`**
  - Tải dữ liệu qua `loadRoadmapData(slug)` với trạng thái Loading và Error an toàn.
  - Sticky Header:
    - Nút `← Quay lại danh sách Lộ trình`.
    - Tiêu đề lộ trình, Badge nhóm.
    - Thanh Progress Bar hiển thị số topic đã học / tổng số topic (% hoàn thành).
    - Nút **"Mở rộng tất cả / Thu gọn tất cả"**.
    - Nút **"Reset tiến độ"** kèm Modal xác nhận trước khi thực hiện.
    - Ô tìm kiếm nhanh các chủ đề bên trong lộ trình để tự động cuộn đến.
  - Kết nối `RoadmapTimeline` và `TopicDrawer`.

---

### Task 6: Xây dựng Trang Entrypoint `/roadmap` (`src/pages/roadmap/index.jsx`)

**Files:**
- Create: `src/pages/roadmap/index.jsx`

- [ ] **Step 1: Tạo `src/pages/roadmap/index.jsx`**
  - Sử dụng `<Layout title="Developer Roadmaps" description="Lộ trình phát triển kỹ thuật phần mềm">`.
  - Bọc nội dung trong `<BrowserOnly>` để an toàn tuyệt đối với SSR Docusaurus.
  - Đọc query parameter `slug` từ URL qua `useLocation` của `@docusaurus/router`.
  - Nếu có `slug`, render `RoadmapDetail(slug)`.
  - Nếu không có `slug`, render `RoadmapHub()`.
  - Hỗ trợ chuyển đổi route bằng `history.push('/roadmap?slug=' + slug)` và `history.push('/roadmap')`.

---

### Task 7: Kiểm thử Tổng thể, Build và Nghiệm thu

- [ ] **Step 1: Chạy Docusaurus Build**
  Run: `npm run build`
  Kỳ vọng: Build thành công vào thư mục `build/`, không có lỗi SSR, không có broken links.
- [ ] **Step 2: Kiểm tra chức năng điều hướng & UI**
  Kiểm tra trang `/roadmap` hiển thị danh sách 10 lộ trình.
  Kiểm tra click lộ trình chuyển sang trang chi tiết với timeline.
  Kiểm tra click topic mở drawer đọc bài học và tài liệu.
  Kiểm tra đánh dấu hoàn thành lưu vào localStorage và hiển thị % trên progress bar.
  Kiểm tra nút Reset tiến độ xóa dữ liệu và đưa tiến độ về 0%.
- [ ] **Step 3: Kiểm tra giao diện Dark/Light mode**
  Đảm bảo màu sắc hiển thị hài hòa, tương phản tốt trên cả hai theme.

---

*Made by Anh Tu - Share to be share*
