---
name: research
description: "Skill nghiên cứu chủ đề chuyên sâu với quy trình thẩm định nguồn tin. Sử dụng khi cần thu thập thông tin từ nhiều nguồn, phân tích dữ liệu, hoặc chuẩn bị nội dung cho báo cáo. Hỗ trợ 3 mức độ Quick (3 nguồn), Standard (5-7 nguồn), Deep Dive (10+ nguồn)."
---

# Research Skill

Skill hướng dẫn quy trình nghiên cứu chủ đề một cách có hệ thống và đáng tin cậy.

## Quy trình nghiên cứu

### Bước 0: Làm rõ yêu cầu

Trước khi nghiên cứu, kiểm tra:
- Yêu cầu có đủ rõ ràng không?
- Đối tượng độc giả là ai? (Beginner/Intermediate/Expert)
- Mức độ nghiên cứu cần thiết? (Quick/Standard/Deep Dive)

**Nếu yêu cầu mơ hồ:** Đặt tối đa 3 câu hỏi làm rõ trước khi tiếp tục.

### Bước 1: Phân tích chiến lược

Xác định rõ:

```
Context: [Bối cảnh của yêu cầu]
Target Audience: [Beginner/Intermediate/Expert]
Research Type: [Quick/Standard/Deep Dive]
Key Questions: [3-5 câu hỏi cốt lõi cần trả lời]
Keywords: [Từ khóa tìm kiếm - cả tiếng Việt và tiếng Anh]
```

### Bước 2: Thu thập thông tin

Sử dụng `search_web` và `read_url_content` để:

| Loại thông tin | Mục đích |
|----------------|----------|
| Định nghĩa, khái niệm | Xây dựng nền tảng |
| Best Practices | Hướng dẫn thực hành |
| Anti-patterns | Điều cần tránh |
| Quan điểm trái chiều | Đảm bảo khách quan |
| Case studies | Ví dụ thực tế |

**Số lượng nguồn tối thiểu:**
- Quick: 3 nguồn
- Standard: 5-7 nguồn
- Deep Dive: 10+ nguồn

### Bước 3: Thẩm định nguồn (Reflection Loop)

PHẢI hoàn thành checklist này TRƯỚC KHI tổng hợp:

1. **Độ mới:** Nguồn cũ nhất bao nhiêu năm? Chấp nhận được không?
2. **Độ tin cậy:** Ưu tiên Official Docs > Verified Experts > Community
3. **Mâu thuẫn:** Có thông tin mâu thuẫn giữa các nguồn không?
   - Nếu có: Ghi nhận cả hai quan điểm, KHÔNG lờ đi
4. **Đủ thông tin:** Tất cả Key Questions đã được trả lời chưa?
   - Nếu chưa: Quay lại Bước 2

### Bước 4: Xử lý Edge Cases

| Tình huống | Hành động |
|------------|-----------|
| Không đủ nguồn uy tín | Ghi rõ "Thông tin hạn chế, cần xác minh thêm" |
| Chủ đề quá mới | Ưu tiên Official Docs + GitHub Discussions |
| Nhiều mâu thuẫn | Trình bày cả hai quan điểm với nguồn dẫn |
| Chủ đề gây tranh cãi | Giữ trung lập, trích dẫn đa chiều |

## Output Format

Tạo research notes theo template trong [templates/research_notes.md](templates/research_notes.md).

Output cần bao gồm:
- Metadata (topic, type, date)
- Key Questions với câu trả lời
- Sources đã đánh giá (với credibility tier)
- Findings theo từng category
- Conflicts/Gaps đã phát hiện
