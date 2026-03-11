---
description: Quy trình phân tích và tạo Báo cáo Chiến lược Vĩ mô Việt Nam hàng tháng, đóng vai Chief Economist với dữ liệu thời gian thực từ GSO, SBV, Hải quan, S&P Global, IMF/WB.
---

# Workflow: Create Vietnam Macro Report

Quy trình tạo Báo cáo Chiến lược Vĩ mô Việt Nam hàng tháng, kết hợp thu thập dữ liệu thời gian thực, phân tích chuyên sâu và xuất bản lên Docusaurus.

---

## Bước 0: Tiếp nhận yêu cầu

Xác định thông tin đầu vào bắt buộc:

```
Tháng báo cáo [T]:    [VD: 02/2026]
Tháng so sánh [T-1]:  [VD: 01/2026]
Cùng kỳ năm ngoái:    [VD: 02/2025]
Độ sâu nghiên cứu:    [Quick / Standard / Deep Dive]
```

---

## Bước 1: Thu thập dữ liệu thời gian thực (Research Skill - Deep Dive)

// turbo
1. Sử dụng `research` skill:
   - Đọc SKILL.md: `.agent/skills/research/SKILL.md`
   - Mức độ: **Deep Dive** (10+ nguồn)
   - Đóng vai: **Chief Economist**

2. Danh sách nguồn bắt buộc cần tìm kiếm theo thứ tự ưu tiên:

| Ưu tiên | Nguồn | Dữ liệu cần lấy |
|---------|-------|-----------------|
| 1 | Tổng cục Thống kê (gso.gov.vn) | CPI, IIP, Bán lẻ, GDP |
| 2 | Ngân hàng Nhà nước (sbv.gov.vn) | Tín dụng, OMO, Tỷ giá, Lãi suất |
| 3 | Tổng cục Hải quan (customs.gov.vn) | XK, NK, Cán cân thương mại |
| 4 | S&P Global / investingvn.com | PMI Manufacturing |
| 5 | MPI / GSO | FDI đăng ký & giải ngân |
| 6 | MOF / Bộ Tài chính | Giải ngân đầu tư công |
| 7 | Fed / ECB / BOJ websites | Động thái NHTW lớn |
| 8 | TradingEconomics / Bloomberg | DXY, US10Y yield |
| 9 | EIA / CME | Brent Oil, Gold |
| 10 | IMF / World Bank | Dự báo & báo cáo khu vực |

3. Các chỉ số **bắt buộc** cần thu thập:

```
NHÓM SẢN XUẤT:
- PMI Manufacturing (S&P Global): Tháng T-1, Tháng T
- Chỉ số Sản xuất Công nghiệp (IIP - %YoY): Tháng T-1, Tháng T

NHÓM TIÊU DÙNG:
- Tổng mức bán lẻ & Doanh thu dịch vụ (%YoY): Tháng T-1, Tháng T

NHÓM THƯƠNG MẠI:
- Xuất khẩu (tỷ USD): Tháng T-1, Tháng T
- Nhập khẩu (tỷ USD): Tháng T-1, Tháng T
- Cán cân thương mại (tỷ USD): Tháng T-1, Tháng T

NHÓM ĐẦU TƯ:
- FDI đăng ký mới (tỷ USD, YTD)
- FDI giải ngân (tỷ USD, YTD)
- Giải ngân Đầu tư công (% kế hoạch, YTD)

NHÓM LẠM PHÁT:
- CPI chung (%YoY): Tháng T-1, Tháng T
- CPI lõi/Core CPI (%YoY): Tháng T-1, Tháng T

NHÓM TÀI CHÍNH - TIỀN TỆ:
- Tăng trưởng tín dụng (%YTD tính từ đầu năm)
- Tỷ giá USD/VND trung tâm & thị trường
- Lãi suất liên ngân hàng qua đêm
- Động thái OMO SBV (hút/bơm ròng, tỷ VND)

NHÓM VĨ MÔ TOÀN CẦU:
- Fed rate decision & outlook (dot plot)
- ECB rate decision
- BOJ policy statement
- DXY index (điểm số)
- US 10Y Treasury Yield (%)
- Brent Crude Oil (USD/thùng)
- Gold (USD/oz)
```

4. Output: Raw data notes với nguồn trích dẫn đầy đủ

---

## Bước 2: Kiểm tra và xác minh dữ liệu (Fact-Check Skill)

// turbo
1. Sử dụng `fact-check` skill:
   - Đọc SKILL.md: `.agent/skills/fact-check/SKILL.md`
   - Ưu tiên cross-check số liệu giữa ít nhất 2 nguồn cho mỗi chỉ số quan trọng
   - Đánh giá Tier: Tier 1 (Official Gov/CB) > Tier 2 (Bloomberg/Reuters) > Tier 3 (Community)

2. Các điểm cần fact-check kỹ:
   - PMI: Xác nhận từ nguồn S&P Global gốc (không phải bản tin thứ cấp)
   - CPI: Đối chiếu số liệu GSO với báo cáo phân tích của các ngân hàng
   - FDI: Phân biệt rõ "đăng ký" và "giải ngân" (thường bị nhầm lẫn)
   - Tỷ giá: Phân biệt tỷ giá trung tâm SBV vs. tỷ giá thị trường tự do

3. Output: Verified data set với confidence level cho mỗi chỉ số

---

## Bước 3: Soạn thảo Báo cáo (Macro Report Skill)

// turbo
1. Sử dụng `create-macro-report` skill:
   - Đọc SKILL.md: `.agent/skills/create-macro-report/SKILL.md`
   - Đóng vai: **Chief Economist / Giám đốc Khối Phân tích Vĩ mô**

2. Cấu trúc báo cáo bắt buộc theo thứ tự:

```
I.   Executive Summary (tối đa 3 câu)
II.  Bối cảnh Vĩ mô Toàn cầu
III. Bảng Macro Dashboard (bắt buộc dạng bảng)
IV.  Phân tích Chuyên sâu
V.   Dự báo & Rủi ro (2 kịch bản: Cơ sở + Rủi ro)
```

3. Quy tắc phân tích bắt buộc:
   - Mọi nhận định **phải** có số liệu hỗ trợ (không nhận định chay)
   - **Bảng Dashboard** phải đủ 9 chỉ số với đủ 5 cột (T-1, T, MoM, YoY, Nhận định)
   - **Kịch bản Rủi ro** phải nêu ít nhất 1 "thiên nga đen" (tail risk) tiềm tàng
   - Cuối báo cáo có **Mermaid diagram** tóm tắt rủi ro/cơ hội

4. Output: Bản nháp báo cáo hoàn chỉnh

---

## Bước 4: Review & QA (Review-Report Skill)

// turbo
1. Sử dụng `review-report` skill:
   - Đọc SKILL.md: `.agent/skills/review-report/SKILL.md`
   - Chạy Checklist đặc thù cho báo cáo vĩ mô:
     - [ ] Executive Summary ≤ 3 câu, nêu rõ xu hướng tổng thể
     - [ ] Bảng Dashboard có đủ 9 chỉ số và 5 cột
     - [ ] Số liệu có footnote/nguồn trích dẫn
     - [ ] 2 kịch bản được phân biệt rõ ràng
     - [ ] Mermaid diagram không lỗi syntax
     - [ ] Không có thuật ngữ không được giải thích
     - [ ] Có disclaimer "Báo cáo mang tính tham khảo"

2. Output: QA report + bản báo cáo đã chỉnh sửa

---

## Bước 5: Tạo file Markdown cho Docusaurus Docs

1. **Đường dẫn đích:** `docs/vietnam-macro-economic-monthly/data/`
2. **Tên file:** `YYYY-MM.md` (VD: `2026-02.md`)

3. **Frontmatter:**

```yaml
---
sidebar_position: [Số tháng, VD: 2]
description: "Báo cáo Chiến lược Vĩ mô Việt Nam tháng MM/YYYY - Phân tích PMI, CPI, Tỷ giá, FDI và dự báo rủi ro."
---
```

4. **Tiêu đề H1:**
```
# Báo cáo Vĩ mô Việt Nam Tháng MM/YYYY
```

5. **Đảm bảo:**
   - Bảng markdown render được (dùng pipe `|` chuẩn)
   - Mermaid blocks có đúng syntax (kiểm tra bằng mermaid-expert skill nếu cần)
   - Không dùng ký tự đặc biệt trong heading (ảnh hưởng anchor link)
   - Footer: `Made by Anh Tu - Share to be share`

---

## Bước 6: Build và kiểm tra local

// turbo
1. Chạy build:
```bash
cd /Users/anhtus/Documents/Development/Documentary/vuanhtu1993.github.io
npm run build
```

2. Nếu lỗi MDX/Mermaid: Xem lỗi, sửa, build lại

// turbo
3. Serve để preview:
```bash
npm run serve
```

4. Kiểm tra:
   - URL: `http://localhost:3000/docs/vietnam-macro-economic-monthly/data/YYYY-MM`
   - Bảng Dashboard render đúng
   - Mermaid render đúng

---

## Bước 7: Xác nhận và Push lên GitHub (GitHub MCP)

1. **Hỏi người dùng xác nhận:**
   - "Bạn đã xem preview chưa? Số liệu và nhận định OK chưa?"
   - "Xác nhận để push lên `main`."

2. Nếu **CONFIRM** → sử dụng **GitHub MCP** để push:
   - Files: `docs/vietnam-macro-economic-monthly/data/YYYY-MM.md`
   - Commit message: `docs: Báo cáo Vĩ mô Việt Nam tháng MM/YYYY`
   - Branch: `main`

3. Nếu cần sửa → sửa → quay Bước 6

---

## Bước 8: Verify trên Production

1. Chờ GitHub Actions deploy (thường 2-3 phút)
2. Kiểm tra: `https://vuanhtu1993.github.io/docs/vietnam-macro-economic-monthly/data/YYYY-MM`
3. Verify:
   - [ ] Sidebar hiển thị đúng vị trí
   - [ ] Bảng Dashboard render đúng
   - [ ] Mermaid diagram render OK
   - [ ] Tất cả số liệu có nguồn trích dẫn

---

## Quick Reference

| Bước | Skill/Action | Output |
|------|-------------|--------|
| 0 | Input | Tháng T, T-1, cùng kỳ |
| 1 | research (Deep Dive) | Raw data từ 10+ nguồn |
| 2 | fact-check | Verified dataset |
| 3 | create-macro-report | Bản nháp báo cáo hoàn chỉnh |
| 4 | review-report | QA report + bản cuối |
| 5 | Manual | `YYYY-MM.md` |
| 6 | npm run build | Build check |
| 7 | GitHub MCP | Commit lên main |
| 8 | Browser | Live docs |

---

## Cấu trúc Báo cáo Mẫu (Prompt Master)

Khi gọi skill `create-macro-report`, sử dụng prompt sau làm hệ thống:

> Đóng vai **Giám đốc Khối Phân tích Vĩ mô (Chief Economist)**. Dựa trên dataset đã được fact-check, lập Báo cáo Chiến lược Vĩ mô Việt Nam tháng **[T]**, đối chiếu với **[T-1]** và cùng kỳ năm ngoái.
>
> **I. Executive Summary:** Tối đa 3 câu tóm gọn toàn cảnh (Tốt lên/Xấu đi/Đi ngang về những điểm cốt lõi).
>
> **II. Bối cảnh Vĩ mô Toàn cầu:** Động thái Fed/ECB/BOJ, DXY, US10Y yield, Brent/Gold/Nông sản và tác động đến Việt Nam.
>
> **III. Bảng Macro Dashboard:** Bảng 9 chỉ số × 5 cột (T-1 | T | MoM | YoY | Nhận định).
>
> **IV. Phân tích Chuyên sâu:** Khu vực Sản xuất & Cầu tiêu dùng; Áp lực Tỷ giá & Lãi suất (OMO SBV, liên ngân hàng, huy động).
>
> **V. Dự báo & Rủi ro:** Kịch bản Cơ sở + Kịch bản Rủi ro cho tháng tiếp theo. Chỉ rõ "thiên nga đen" tiềm tàng.
