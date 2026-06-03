# 🤖 Aha! Mind Interpreter Agent

Pipeline tự động dịch sách kỹ thuật PDF sang bài blog MDX tiếng Việt cho Docusaurus.

---

## Cách dùng

```bash
# Cú pháp đầy đủ
npm run aha-mind:interpreter -- \
  --pdf paper/my-book.pdf \
  --title "Tên Sách Tiếng Anh" \
  --author "Tên Tác Giả"

# Ví dụ với whitepaper LLM
npm run aha-mind:interpreter -- \
  --pdf "paper/whitepaper_Foundational Large Language models & text generation_v2.pdf" \
  --title "Foundational Large Language Models and Text Generation" \
  --author "Google"
```

**Output:** `blog/aha-interpreter/<book-slug>/chapter-01.mdx`, `chapter-02.mdx`, ...

---

## Kiến trúc Pipeline

```
START → parse → mask → chunk → translate → unmask → export → [next chapter | END]
```

| Node | File | Chức năng |
|------|------|-----------|
| `parse` | `nodes/parser.ts` | Đọc PDF, tách thành chapters (TOC → Heading fallback) |
| `mask` | `nodes/masker.ts` | Che chắn code/image bằng placeholder `<ASSET_...>` |
| `chunk` | `nodes/chunker.ts` | Chia thành chunks 2000-3000 từ, cắt tại heading |
| `translate` | `nodes/translator.ts` | Gọi Gemini Flash dịch từng chunk |
| `unmask` | `nodes/unmasker.ts` | Khôi phục code/image từ placeholder |
| `export` | `nodes/mdx_exporter.ts` | Ghi file MDX với frontmatter Docusaurus |

---

## Cấu hình

### `glossary.json` — Từ điển bảo hộ

Chứa danh sách thuật ngữ **không được dịch**. Mặc định đã có ~70 terms về AI/LLM/Data Engineering.

Để thêm term mới:

```json
{
  "protected_terms": [
    "YourTerm",
    "AnotherTerm"
  ]
}
```

### `config.ts` — Tham số pipeline

| Constant | Mặc định | Ý nghĩa |
|----------|----------|---------|
| `CHUNKING.MAX_CHARS` | 8000 | Kích thước chunk tối đa (chars) |
| `LLM_CONFIG.MODEL` | `gemini-2.0-flash` | Model Gemini |
| `LLM_CONFIG.RATE_LIMIT_DELAY_MS` | 2000 | Delay giữa API calls (ms) |
| `OUTPUT_DIR` | `blog/aha-interpreter` | Thư mục output |

---

## Chapter Detection — Đánh giá Accuracy

| Phương pháp | Accuracy | Khi nào dùng |
|-------------|----------|--------------|
| **TOC-based** (Option A) | ~90% | PDF có Table of Contents rõ ràng |
| **Heading-based** (Option B) | ~75-85% | Fallback khi TOC không đủ tin cậy |

Pipeline tự động chọn TOC nếu tìm được ≥ 2 mục, fallback sang Heading nếu không.

**Dấu hiệu TOC hoạt động tốt:**
```
[Parser] TOC-based: Tìm thấy 8 mục ✅
```

**Dấu hiệu fallback sang Heading:**
```
[Parser] TOC không đủ tin cậy → fallback sang Heading-based detection
```

---

## Cấu trúc Output

```
blog/aha-interpreter/
└── foundational-large-language-models/
    ├── chapter-01.mdx  → "Chapter 1: Introduction to LLMs"
    ├── chapter-02.mdx  → "Chapter 2: Architecture"
    └── ...
```

Mỗi file MDX có:
- Frontmatter đầy đủ (slug, title, date, authors, tags)
- Attribution block với disclaimer bản dịch tự động
- Nội dung dịch tiếng Việt
- Breadcrumb navigation (← Chương trước | Chương sau →)

---

## Troubleshooting

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-------------|-----------|
| `Không tìm được chapter nào` | TOC và Heading đều không match | Xem log, thêm pattern vào `config.ts` |
| `ASSET tags bị mất trong bản dịch` | LLM xóa/thay đổi placeholder | Kiểm tra file MDX, sửa thủ công |
| `Rate limit error` | Quá nhiều API calls | Tăng `RATE_LIMIT_DELAY_MS` trong `config.ts` |
| `Thuật ngữ bị dịch sai` | Thiếu trong glossary | Thêm vào `glossary.json` |

---

*Made by Anh Tu - Share to be share*
