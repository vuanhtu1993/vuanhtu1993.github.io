---
name: create-project-base
description: "Skill thiết kế Progressive Project để học công nghệ mới thông qua project
  thực tế. Input bắt buộc: curriculum đã được user approve (từ create-curriculum skill).
  Skill chọn project mức medium phù hợp, rồi với MỖI Phase trong syllabus: (1) Research
  riêng concepts/features của phase đó, (2) Tạo Requirements mô tả UI/Logic, (3) Viết
  Acceptance Criteria, (4) Viết Pseudo Code best practice có chú thích WHY, (5) Gợi ý
  Docs Navigation. KHÔNG viết code hoàn chỉnh — chỉ pseudo code và gợi ý."
---

# Create Project Base Skill

Skill thiết kế dự án thực tế (Progressive Project) để học công nghệ mới. Dự án được chia thành 5 Phases tăng dần độ khó, mỗi Phase map trực tiếp vào Curriculum đã được approve.

**Vai trò:** Senior Tech Lead + Learning Architect.

## Prerequisite Check

TRƯỚC KHI BẮT ĐẦU, kiểm tra:

- [ ] Có file curriculum đã được user approve?
  → Nếu KHÔNG: Dừng lại. Yêu cầu chạy `create-curriculum` skill trước.
- [ ] Curriculum có đủ: Concept Map + Feature Inventory + Syllabus 5 Phases?
  → Nếu thiếu: Yêu cầu user bổ sung.

---

## Bước 1: Chọn Project

Chọn 1 dự án thực tế mức **medium** dựa trên criteria sau:

### Project Selection Criteria

| # | Tiêu chí | Bắt buộc |
|---|----------|----------|
| 1 | Cover ≥80% concepts trong curriculum | YES |
| 2 | Có cả Read + Write operations (CRUD nếu applicable) | YES |
| 3 | Mỗi Phase thêm tính năng mới, KHÔNG rewrite Phase trước | YES |
| 4 | Có edge cases buộc xử lý (error handling, async, validation...) | YES |
| 5 | Đủ phức tạp để demo portfolio nhưng không quá lớn | YES |
| 6 | Phù hợp lĩnh vực ứng dụng user đã chọn (nếu có) | Optional |

### Quy trình chọn:

1. Đề xuất 2-3 project candidates
2. Đánh giá mỗi candidate theo 6 criteria trên
3. Chọn project có điểm cao nhất
4. Ghi rõ: Tên project + tại sao chọn + concepts nào sẽ được cover

**Ví dụ project theo tech:**

| Tech | Project mức Medium |
|------|-------------------|
| React | Task Management App (Kanban board) |
| Docker | Multi-service Blog Platform (compose) |
| Go | REST API Server + CLI tool |
| Node.js | Real-time Chat Application |
| Rust | CLI File Processing Tool |

> Đây là gợi ý, KHÔNG bắt buộc. Chọn project phù hợp nhất với curriculum và goal của user.

---

## Bước 2: Per-Phase Generation Loop

```
FOR mỗi Phase (0 → 4) trong Syllabus của Curriculum:

  2a. RESEARCH phase-specific
      └── Dùng research skill, focus VÀO concepts + features của Phase này
      └── Tìm: best practices, common pitfalls, real-world patterns
      └── Tối thiểu 3 nguồn riêng cho mỗi Phase
      └── Ưu tiên: Official Docs section cụ thể > Tutorial > Blog kỹ thuật

  2b. GENERATE phase content
      └── Theo template trong references/phase-template.md
      └── Map ngược về Curriculum: mỗi concept/feature phải trace về ID trong Concept Map

  NEXT Phase
```

### Quy tắc cho mỗi Phase:

#### Requirements (Yêu cầu tính năng)
- Mô tả tính năng bằng ngôn ngữ tự nhiên (UI/Logic)
- TUYỆT ĐỐI KHÔNG VIẾT CODE hoàn chỉnh
- Mô tả cụ thể: "Khi user click button X → hiển thị Y" thay vì "Implement feature Z"
- Liệt kê từng requirement riêng, đánh số

#### Acceptance Criteria (Tiêu chí hoàn thành)
- Checklist cụ thể, có thể verify bằng mắt hoặc test
- Mỗi criterion là 1 hành động verify được: "App hiển thị list items khi load" thay vì "Feature hoạt động đúng"
- Tối thiểu 3, tối đa 7 criteria mỗi Phase

#### Pseudo Code (Best Practice)
- Pseudo code minh họa cách tiếp cận — KHÔNG phải code chạy được
- Mỗi dòng pseudo code CÓ chú thích WHY (tại sao làm thế này) thay vì WHAT (đoạn này làm gì)
- Thể hiện design decisions và patterns quan trọng
- Nếu có nhiều cách làm: nêu trade-off rồi chọn 1 cách recommend

#### Common Pitfalls (Bẫy thường gặp)
- PHẢI từ research, KHÔNG được generic
- Mỗi pitfall có 3 phần: tên lỗi + tại sao hay mắc + cách tránh
- Tối thiểu 2 pitfalls mỗi Phase

#### Docs Navigation Guide (Hướng dẫn đọc docs)
- Chỉ đến section CHÍNH XÁC trong official docs
- Format: Concept → Tên section → URL/path (nếu có)
- Gợi ý thứ tự đọc nếu docs phức tạp

---

## Bước 3: Tổng hợp Output

Tổng hợp toàn bộ 5 Phases vào 1 file Markdown:

**Tên file:** `project-roadmap-[tech-name].md` (VD: `project-roadmap-react.md`)

**Cấu trúc output:**

```markdown
# Progressive Project: [Tên Project]
## Học [Tech Name] qua thực hành

### Project Overview
[Mô tả ngắn project + tại sao chọn project này]

### Curriculum Mapping
[Bảng tóm tắt: Phase nào cover concepts nào từ curriculum]

### Phase 0: Foundation
[Theo phase-template.md]

### Phase 1: Core Basics
[Theo phase-template.md]

... (Phase 2, 3, 4)

### Summary
[Bảng tóm tắt toàn bộ: Phase | Concepts | Features | Key Takeaway]
```

---

## Quy tắc bắt buộc

1. **KHÔNG viết code hoàn chỉnh** — chỉ pseudo code có chú thích WHY
2. Mỗi Phase PHẢI reference ngược concepts trong curriculum (dùng Concept ID: F1, C2...)
3. Mỗi Phase PHẢI có per-phase research riêng (≥3 nguồn)
4. Common Pitfalls PHẢI cụ thể từ research — cấm viết generic
5. Docs Navigation PHẢI chỉ đến section chính xác — cấm chung chung
6. Pseudo code comment WHY, KHÔNG comment WHAT
7. Project phải scale tự nhiên: Phase sau thêm tính năng, KHÔNG rewrite Phase trước
8. Acceptance Criteria phải verify được — cấm mơ hồ

---

## Self-Evaluation Rubric

Trước khi xuất output, tự đối chiếu:

| Tiêu chí | Điểm tối đa |
|---|---|
| Project cover ≥80% concepts trong curriculum | 20 |
| Mỗi Phase có per-phase research (≥3 nguồn) | 15 |
| Acceptance Criteria cụ thể, có thể verify | 15 |
| Pseudo code có chú thích WHY chi tiết | 15 |
| Common Pitfalls cụ thể từ research, không generic | 10 |
| Docs Navigation chính xác (section name + URL) | 10 |
| Project scale tự nhiên qua các Phase | 10 |
| Không có code hoàn chỉnh (chỉ pseudo code) | 5 |
| **TỔNG** | **100** |

> Nếu tổng điểm < 80 → Chỉnh sửa trước khi xuất output.
