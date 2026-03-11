---
name: pdf-extractor
description: "Skill hướng dẫn gọi PDF Extractor Sub-Agent để extract dữ liệu vĩ mô từ báo cáo chiến lược SSI/MBS/TCBS. Sử dụng ở Bước 1A trong workflow /create-macro-report. Output là file JSON và Markdown sẵn dùng."
---

# PDF Extractor Skill

Skill hướng dẫn sử dụng sub-agent `pdf_macro_extractor.py` để extract tự động dữ liệu vĩ mô từ báo cáo PDF của CTCK.

---

## Cách gọi Sub-Agent

```bash
# Cú pháp cơ bản
python3 scripts/pdf_macro_extractor.py --month YYYY-MM

# Ví dụ thực tế
python3 scripts/pdf_macro_extractor.py --month 2026-02

# Verbose mode (xem text từng trang)
python3 scripts/pdf_macro_extractor.py --month 2026-02 --verbose
```

**Điều kiện tiên quyết:**
- PDF báo cáo đã được đặt vào `docs/vietnam-macro-economic-monthly/data/YYYY-MM/`
- Thư viện đã cài: `pip3 install pdfplumber`

---

## Đọc Output

Sub-agent tạo ra **2 file** trong cùng folder tháng:

### 1. `extracted_YYYY-MM.json` — Dataset có cấu trúc

```json
{
  "month": "2026-02",
  "sources": [
    {
      "file": "..._SSIResearch.pdf",
      "source": "SSI Research",
      "indicators": {
        "PMI": {"value": 51.5, "unit": "điểm", "confidence": "high"},
        "CPI_YoY": {"value": 3.2, "unit": "%YoY", "confidence": "medium"}
      }
    }
  ],
  "merged": {
    "PMI": {
      "final_value": 51.5,
      "conflict": false,
      "values": {"SSI Research": 51.5}
    },
    "CPI_YoY": {
      "final_value": 3.2,
      "conflict": true,
      "values": {"SSI Research": 3.2, "MBS Research": 3.1}
    }
  },
  "conflicts": ["CPI_YoY"]
}
```

### 2. `extracted_YYYY-MM.md` — Bảng Markdown sẵn dùng

File này chứa **Bảng Macro Dashboard** có thể paste trực tiếp vào báo cáo. Các chỉ số bị conflict được đánh dấu `⚠️`.

---

## Xử lý Conflict

Khi `"conflict": true` xuất hiện trong JSON:

| Bước | Hành động |
|------|-----------|
| 1 | Xem `"values"` để biết giá trị từ từng nguồn |
| 2 | Ưu tiên nguồn Tier 1: GSO/SBV/Hải quan (nếu CTCK trích dẫn khác nhau từ nguồn gốc) |
| 3 | Nếu không rõ: ghi chú "Cần xác minh" và chuyển sang Bước 1B (research online) |
| 4 | Ghi nhận trong báo cáo: *"Số liệu tham chiếu từ [nguồn A]; [nguồn B] ghi nhận [giá trị B]"* |

---

## Giới hạn cần biết (Trade-offs)

> ⚠️ Sub-agent dùng regex để parse text PDF — không phải AI. Có thể xảy ra:

| Tình huống | Nguy cơ | Cách phòng |
|-----------|---------|------------|
| Số nằm trong biểu đồ (hình ảnh) | Không extract được | Kiểm tra `confidence: "medium"` |
| PDF scan (không phải text) | Toàn bộ sẽ trống | Xem `page_count = 0` → extract thủ công |
| Số bị nhầm đơn vị (%, tỷ USD) | Giá trị sai | Fact-check Bước 1B bắt buộc |
| Tên chỉ số CTCK khác template | Không match | Xem log "Extract được 0 chỉ số" |

**Quy tắc an toàn:** Output của sub-agent là **dữ liệu thô chưa verify**. Bước 2 (Fact-check) trong workflow là bắt buộc.

---

## Nhận biết nguồn qua tên file

Sub-agent tự động nhận diện nguồn theo tên file:

| Từ khóa trong tên file | Nguồn được gán |
|-----------------------|----------------|
| `SSI` | SSI Research |
| `MBS` | MBS Research |
| `TCBS` | TCBS Research |
| `VietnamOutlook`, `Vietnam` + `Outlook` | TCBS Research |
| Còn lại | Không xác định |
