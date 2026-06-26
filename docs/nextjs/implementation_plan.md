# Kế hoạch Xây dựng Khoá học Next.js (App Router) - Chất lượng cao

## Tổng quan & Quyết định đã xác nhận

| Câu hỏi | Quyết định |
|---------|------------|
| Tài liệu cũ | ✅ Thay thế hoàn toàn 8 bài .md cũ |
| Phạm vi | ✅ Chọn lọc nội dung cốt lõi, bỏ qua những thứ quá chuyên sâu |
| Đối tượng | ✅ Người học đã có kiến thức tốt ReactJS |
| Cấu trúc | ✅ Option B - Module-based (giống NestJS docs) |
| Router | ✅ Chỉ tập trung App Router, bỏ Pages Router |

---

## Cấu trúc Khoá học Mới

```
docs/nextjs/
├── _category_.json
├── 01-foundations/                     ← Nền tảng (MUST KNOW)
│   ├── 01-installation.mdx             ← getting-started/installation.md
│   ├── 02-project-structure.mdx        ← getting-started/project-structure.md
│   └── 03-rendering-philosophy.mdx     ← guides/rendering-philosophy.md
│
├── 02-routing/                         ← Hệ thống Routing (Core)
│   ├── 01-layouts-and-pages.mdx        ← getting-started/layouts-and-pages.md
│   ├── 02-linking-and-navigating.mdx   ← getting-started/linking-and-navigating.md
│   ├── 03-route-handlers.mdx           ← getting-started/route-handlers.md
│   ├── 04-error-handling.mdx           ← getting-started/error-handling.md
│   └── 05-redirecting.mdx              ← guides/redirecting.md
│
├── 03-rendering/                       ← Rendering Model (Core)
│   ├── 01-server-and-client-components.mdx ← getting-started/server-and-client-components.md
│   └── 02-streaming.mdx                ← guides/streaming.md
│
├── 04-data-layer/                      ← Quản lý dữ liệu (Core)
│   ├── 01-fetching-data.mdx            ← getting-started/fetching-data.md
│   ├── 02-mutating-data.mdx            ← getting-started/mutating-data.md
│   ├── 03-server-actions.mdx           ← guides/server-actions.md
│   ├── 04-caching.mdx                  ← getting-started/caching.md
│   └── 05-revalidating.mdx             ← getting-started/revalidating.md
│
├── 05-styling/                         ← Styling (Essential)
│   ├── 01-css-modules.mdx              ← getting-started/css.md
│   ├── 02-image-optimization.mdx       ← getting-started/images.md
│   └── 03-font-optimization.mdx        ← getting-started/fonts.md
│
├── 06-seo-and-metadata/                ← SEO (Essential)
│   └── 01-metadata-and-og.mdx         ← getting-started/metadata-and-og-images.md
│
├── 07-authentication/                  ← Auth (Advanced)
│   ├── 01-auth-concepts.mdx            ← guides/authentication.md
│   └── 02-data-security.mdx            ← guides/data-security.md
│
├── 08-deployment/                      ← Deployment (Advanced)
│   ├── 01-environment-variables.mdx    ← guides/environment-variables.md
│   ├── 02-deploying.mdx                ← getting-started/deploying.md
│   └── 03-self-hosting.mdx             ← guides/self-hosting.md
│
└── 09-testing/                         ← Testing (Bonus)
    └── 01-testing-overview.mdx         ← guides/testing.md
```

**Tổng cộng: 26 bài từ nguồn chính thức nextjs.org**

---

## Quy trình tạo từng bài (theo `create-tech-lecture`)

Mỗi bài viết **BẮT BUỘC** phải có:
1. **Frontmatter:** `title`, `description`, `source` (URL chính thức)
2. **Hook:** Tại sao topic này quan trọng với dev ReactJS chuyển sang Next.js?
3. **Definition Anatomy:** Giải thích từ khoá cốt lõi
4. **Mermaid Diagram:** Minh hoạ kiến trúc/flow
5. **Code thực tế:** Với comment giải thích *Why* (tại sao)
6. **Trade-off:** Ưu/nhược điểm, khi nào nên/không nên dùng
7. **MECE Mindmap:** Tóm tắt toàn bài
8. **Footer:** `Made by Anh Tu - Share to be share`

**Note về đối tượng:** Không cần giải thích cơ bản React (useState, useEffect, JSX). Tập trung vào *sự khác biệt* giữa Next.js và React thuần.

---

## Proposed Changes

### [DELETE] 8 file .md cũ trong `docs/nextjs/`
- `01-image-optimization.md`
- `02-font-optimization.md`
- `03-metadata-and-og-images.md`
- `04-routing.md`
- `05-linking-and-navigating.md`
- `06-React v19.md`
- `07-server-and-client-components.md`
- `08-rendering-methods.md`

### [MODIFY] `docs/nextjs/_category_.json`

### [NEW] 9 thư mục module + 26 file `.mdx`

---

## Kế hoạch Thực thi (5 Phase)

| Phase | Modules | Số bài | Status |
|-------|---------|--------|--------|
| **Phase 1** | `01-foundations` + `02-routing` | 8 bài | ⏳ Sẵn sàng |
| **Phase 2** | `03-rendering` + `04-data-layer` | 7 bài | ⏸️ Chờ Phase 1 |
| **Phase 3** | `05-styling` + `06-seo-and-metadata` | 4 bài | ⏸️ Chờ Phase 2 |
| **Phase 4** | `07-authentication` + `08-deployment` | 5 bài | ⏸️ Chờ Phase 3 |
| **Phase 5** | `09-testing` | 1 bài | ⏸️ Chờ Phase 4 |

---

## Verification Plan

```bash
# Sau mỗi phase - kiểm tra build không lỗi MDX
cd /Users/anhtus/Documents/Development/Documentary/vuanhtu1993.github.io
npm run build

# Deploy sau khi hoàn thành
# Dùng /push-content workflow
```

---

*Made by Anh Tu - Share to be share*
