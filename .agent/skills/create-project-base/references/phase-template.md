# Phase Template

Template chuẩn cho mỗi Phase trong project roadmap output. Agent PHẢI tuân theo cấu trúc này cho mỗi Phase.

---

## Phase X: [Tên Phase]

### Goal (Mục tiêu)

[Mô tả ngắn gọn: Phase này xây dựng tính năng gì và người học sẽ hiểu sâu concepts nào]

### Curriculum Mapping

| Concept ID | Concept Name | Feature/API liên quan |
|-----------|-------------|----------------------|
| [F1/C2/I1...] | [Tên concept từ curriculum] | [Feature/API sẽ dùng] |

### Research Sources (Phase-specific)

| # | Source | URL | Type | Credibility |
|---|--------|-----|------|-------------|
| 1 | [Tên nguồn] | [URL] | [Official Docs/Blog/Community] | [Tier 1/2/3] |
| 2 | [Tên nguồn] | [URL] | [Type] | [Tier] |
| 3 | [Tên nguồn] | [URL] | [Type] | [Tier] |

### Core Concepts

| Concept | Docs Keyword | Mô tả ngắn trong context project |
|---------|-------------|----------------------------------|
| [Tên] | [Từ khóa search trong docs] | [Concept này được dùng thế nào trong feature đang build] |

### API / Features to Use

- `feature/API/method name` — [Mục đích sử dụng trong Phase này + tại sao chọn cái này]

### Requirements (Yêu cầu tính năng)

*Mô tả tính năng bằng ngôn ngữ tự nhiên. KHÔNG có code.*

1. **[Requirement 1]:** [Mô tả cụ thể: "Khi user [hành động] → [kết quả mong đợi]"]
2. **[Requirement 2]:** [Mô tả cụ thể]
3. **[Requirement 3]:** [Mô tả cụ thể]

### Acceptance Criteria (Tiêu chí hoàn thành)

Phase hoàn thành khi:

- [ ] [Criteria 1 — hành động verify cụ thể]
- [ ] [Criteria 2 — hành động verify cụ thể]
- [ ] [Criteria 3 — hành động verify cụ thể]

### Conclusion

#### Pseudo Code (Best Practice)

```
// [Tên file gợi ý]

// WHY: [Giải thích tại sao chọn approach này thay vì alternatives]
DEFINE [structure/function/component]

  // WHY: [Lý do thiết kế]
  SETUP [resource/state/config]

  // WHY: [Tại sao cần bước này — liên hệ concept trong curriculum]
  HANDLE [logic chính]

  // WHY: [Tại sao xử lý edge case này quan trọng]
  IF [edge case] THEN
    HANDLE [error/fallback]
  END
```

#### Common Pitfalls (Bẫy thường gặp — từ Research)

| # | Pitfall | Tại sao hay mắc | Cách tránh |
|---|---------|-----------------|-----------|
| 1 | [Tên lỗi cụ thể] | [Giải thích root cause] | [Best practice để tránh] |
| 2 | [Tên lỗi cụ thể] | [Giải thích root cause] | [Best practice để tránh] |

#### Docs Navigation Guide (Hướng dẫn đọc docs)

Đọc theo thứ tự sau:

| # | Concept | Đọc Section | URL/Path trong docs |
|---|---------|------------|-------------------|
| 1 | [Concept ưu tiên đọc trước] | [Tên section chính xác] | [URL hoặc path] |
| 2 | [Concept tiếp theo] | [Tên section] | [URL] |

---

*Made by Anh Tu - Share to be share*
