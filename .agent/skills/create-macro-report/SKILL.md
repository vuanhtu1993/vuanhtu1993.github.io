---
name: create-macro-report
description: "Skill chuyên biệt tạo Báo cáo Chiến lược Vĩ mô Việt Nam hàng tháng theo chuẩn Chief Economist. Bao gồm Executive Summary, Global Macro Context, Macro Dashboard (9 chỉ số), Deep-dive Analysis, và Forward-looking Scenarios. Sử dụng sau bước fact-check trong workflow /create-macro-report."
---

# Create Macro Report Skill

Skill hướng dẫn soạn thảo **Báo cáo Chiến lược Vĩ mô Việt Nam** hàng tháng với chuẩn mực của một Chief Economist: dữ liệu có nguồn, nhận định có căn cứ, dự báo có kịch bản.

---

## Vai trò (Persona)

Đóng vai **Giám đốc Khối Phân tích Vĩ mô (Chief Economist)** với:
- **Tư duy:** Top-down (Vĩ mô toàn cầu → Khu vực → Việt Nam → Ngành)
- **Phong cách:** Chuyên nghiệp, súc tích, không hoa mỹ, tránh dùng ngôn ngữ hô hào
- **Nguyên tắc sắt:** Mọi nhận định PHẢI có số liệu hỗ trợ; nếu thiếu data phải ghi rõ "Dữ liệu chưa có tại thời điểm báo cáo"

---

## Xử lý Dữ liệu từ Báo cáo Chiến lược CTCK (SSI / MBS / TCBS)

> **Bối cảnh:** Trước khi soạn báo cáo, dữ liệu đã được extract từ PDF CTCK (Bước 1A trong workflow). Skill này hướng dẫn cách **đọc, tích hợp và trích dẫn** đúng cách.

### Bản đồ chỉ số: Tên trong PDF → Dashboard

Các CTCK thường dùng tên viết tắt hoặc tiếng Việt thuần. Mapping chuẩn:

| Tên thường gặp trong PDF CTCK | Tên chuẩn trong Dashboard | Ghi chú |
|:---|:---|:---|
| `PMI sản xuất` / `Chỉ số PMI` | PMI Manufacturing | Lấy con số điểm (VD: 51.5) |
| `IIP` / `Sản xuất công nghiệp` / `%svck` | IIP (%YoY) | Chú ý: svck = so với cùng kỳ = YoY |
| `Tổng mức bán lẻ & DVTD` | Retail & Consumer Services (%YoY) | |
| `XK` / `Kim ngạch xuất khẩu` | Xuất khẩu (tỷ USD) | Lấy cả số tuyệt đối lẫn %YoY |
| `NK` / `Kim ngạch nhập khẩu` | Nhập khẩu (tỷ USD) | |
| `Thặng dư/thâm hụt thương mại` / `CCTM` | Cán cân thương mại (tỷ USD) | +: Thặng dư, -: Thâm hụt |
| `Vốn FDI giải ngân` / `FDI thực hiện` | FDI giải ngân (tỷ USD, YTD) | **KHÔNG** nhầm với FDI đăng ký |
| `CPI` | CPI chung (%YoY) | Kiểm tra: MoM hay YoY? |
| `Lạm phát lõi` / `CPI lõi` | Core CPI (%YoY) | |
| `Tăng trưởng tín dụng` / `Dư nợ tín dụng` | Tín dụng (%YTD) | Lũy kế từ đầu năm |
| `LS liên ngân hàng` / `LS qua đêm` | Lãi suất liên NH overnight (%) | |
| `Tỷ giá trung tâm` / `USD/VND` | Tỷ giá USD/VND | Dùng tỷ giá trung tâm SBV |
| `OMO bơm/hút` | OMO ròng (tỷ VND) | +: bơm tiền, -: hút tiền |

### Quy tắc Ưu tiên Nguồn (Source Hierarchy)

Khi có xung đột số liệu giữa các nguồn:

```
Tier 1 - Nguồn gốc (ĐỘ TIN CẬY CAO NHẤT):
  ① GSO → CPI, IIP, Bán lẻ, GDP
  ② SBV → Tỷ giá, Tín dụng, OMO, Lãi suất
  ③ Tổng cục Hải quan → Xuất/Nhập khẩu
  ④ MPI/Cục Đầu tư nước ngoài → FDI
  ⑤ S&P Global → PMI

Tier 2 - Báo cáo CTCK (Phân tích + Tổng hợp):
  ⑥ SSI Research → Ưu tiên nếu có bảng số liệu rõ ràng
  ⑦ MBS Research → Ưu tiên nếu số liệu khác SSI (ghi nhận cả hai)
  ⑧ TCBS Research → Tham chiếu thêm

Tier 3 - Báo chí / Truyền thông (Kiểm tra chéo):
  ⑨ CafeF, VnEconomy, Cafebiz → Chỉ dùng khi không có nguồn Tier 1/2
```

**Quy tắc xung đột:** Nếu SSI và MBS có số liệu khác nhau cho cùng chỉ số:
1. Kiểm tra nguồn gốc mà mỗi CTCK trích dẫn
2. Ưu tiên con số từ nguồn Tier 1
3. Nếu cả hai đều trích từ Tier 1 và vẫn lệch → ghi chú: *"số liệu chưa thống nhất, tham chiếu từ [nguồn A] và [nguồn B]"*

### Cách Trích Dẫn Chuẩn

```
# Nguồn từ CTCK:
Theo SSI Research (Báo cáo Chiến lược Tháng 02/2026, tr.4)

# Nguồn gốc sau khi verify:
Theo GSO (công bố ngày 29/02/2026), được SSI Research tổng hợp

# Khi số liệu chưa được verify:
PMI tháng 02/2026 đạt 51.5 điểm (nguồn: SSI Research - cần xác minh S&P Global)
```

### Checklist Trước Khi Dùng Dữ liệu PDF

Trước khi điền vào Bảng Macro Dashboard, kiểm tra:

- [ ] Số liệu là **tháng T** hay **tháng T-1**? (Báo cáo tháng 2 thường có số liệu tháng 1)
- [ ] Đơn vị có nhất quán? (%, tỷ USD, hay nghìn tỷ VND?)
- [ ] `svck` = YoY hay MoM? (Đọc kỹ chú thích trong bảng)
- [ ] FDI: đã phân biệt rõ **đăng ký** vs **giải ngân** chưa?
- [ ] CPI: là **%MoM** hay **%YoY**? (Các CTCK thường dùng cả hai)

---

## Cấu trúc Báo cáo (Report Blueprint)

### 🎯 0. MỤC TIÊU CHÍNH PHỦ NĂM [YYYY] *(Section bắt buộc — luôn đặt đầu báo cáo)*

**Mục đích:** Cung cấp "la bàn" để so sánh mọi con số thực tế với đích đến cả năm — giúp người đọc nhanh chóng đánh giá tiến độ và hành động.

**Template:**

```markdown
## 🎯 MỤC TIÊU CHÍNH PHỦ VIỆT NAM NĂM [YYYY]

> **Nguồn:** Nghị quyết [số]/[năm]/QH (Quốc hội) & Nghị quyết 01/NQ-CP (Chính phủ)

| # | Chỉ tiêu | Mục tiêu [YYYY] | Thực tế T[N]/[YYYY] | Trạng thái |
|:---:|:---|:---:|:---:|:---:|
| 1 | **Tăng trưởng GDP** | **[mục tiêu]%** | [số thực tế hoặc "Chờ Q[n]"] | [emoji] |
| 2 | **CPI bình quân** | **≤ [%]** | [YoY tháng T] | [emoji] |
| 3 | **Tổng kim ngạch XK** | **[tỷ USD]** (+[%] YoY) | [tỷ/tháng] | [emoji] |
| 4 | **Cán cân thương mại** | XS > [tỷ USD] | [+/-] tỷ | [emoji] |
| 5 | **FDI giải ngân** | **~[tỷ] USD** | [tỷ/tháng] | [emoji] |
| 6 | **GDP bình quân đầu người** | **[USD]** | — | 🕐 CNA |
| 7 | **Tỷ lệ thất nghiệp đô thị** | **< [%]** | — | 🕐 CNA |
| 8 | **Tăng trưởng tín dụng** | **~[%]** | [% YTD] | [emoji] |

> **Cách đọc:** 🟢 Đúng hướng | 🟡 Cần theo dõi | 🔴 Lệch mục tiêu | 🕐 Chưa đánh giá được
```

**Quy tắc cập nhật cột "Thực tế":**
- Annualize số tháng cho các chỉ tiêu cả năm (VD: XK tháng 1 × 12 ≈ pace cả năm)
- GDP Q1: điền khi GSO công bố (thường cuối tháng 3)
- Trạng thái 🟡 khi thực tế đang ở 80-95% tốc độ cần để đạt mục tiêu

---

### I. EXECUTIVE SUMMARY

**Quy tắc:** Tối đa 3 câu. Mỗi câu = 1 trụ cột kinh tế.

**Template:**
```
[Câu 1 - Sản xuất & Tăng trưởng]: PMI/IIP/XK → Động lực sản xuất đang [phục hồi/suy yếu/đi ngang].
[Câu 2 - Tiêu dùng & Lạm phát]: Bán lẻ + CPI → Cầu nội địa và áp lực giá [mô tả tổng thể].
[Câu 3 - Rủi ro tổng thể]: Tỷ giá/Lãi suất/FDI → Điểm rủi ro/cơ hội cốt lõi cần theo dõi.
```

**Ví dụ:**
> Động lực sản xuất tiếp tục phục hồi khi PMI giữ trên ngưỡng 50 tháng thứ ba liên tiếp và XK tăng tốt. Cầu nội địa chắc chắn hơn với bán lẻ tăng 8,5% YoY, trong khi CPI lõi duy trì ổn định dưới 3%. Áp lực tỷ giá USD/VND là rủi ro trọng yếu cần theo dõi khi SBV phải bán can thiệp và FDI giải ngân chậm lại.

---

### II. BỐI CẢNH VĨ MÔ TOÀN CẦU (Global Macro Context)

Phân tích theo 3 nhóm:

#### A. Động thái các NHTW lớn

| Ngân hàng TW | Quyết định lãi suất | Forward Guidance | Tác động đến VN |
|:---|:---|:---|:---|
| Fed (Mỹ) | [Tăng / Giữ / Giảm] X bps → [mức hiện tại] | [Nội dung dot plot / statement] | [Tác động đến tỷ giá USD/VND, dòng vốn] |
| ECB (Eurozone) | [Quyết định] | [Guidance] | [Tác động EUR/USD → XK VN sang EU] |
| BOJ (Nhật) | [Quyết định] | [Guidance] | [Tác động JPY, carry trade, YCC] |

#### B. DXY & Lợi suất trái phiếu Mỹ

```
DXY: [Điểm số] → [Tăng/Giảm X% so với tháng trước]
  → Ý nghĩa: DXY [mạnh/yếu] gây áp lực [tăng/giảm] tỷ giá VND và các EM currencies

US 10Y Treasury: [%] → [Tăng/Giảm X bps]
  → Ý nghĩa: Yield cao làm tăng chi phí vay vốn, hút vốn khỏi EM, áp lực VND
```

#### C. Hàng hóa chiến lược & Tác động đến Việt Nam

| Hàng hóa | Giá tháng T-1 | Giá tháng T | MoM | Tác động đến VN |
|:---|:---:|:---:|:---:|:---|
| Dầu Brent (USD/thùng) | | | | Chi phí SX, lạm phát nhập khẩu, chi tiêu NS |
| Vàng (USD/oz) | | | | Kênh trú ẩn, tâm lý thị trường |
| Gạo (USD/tấn) - nếu có biến động | | | | Ảnh hưởng XK nông sản, CPI |

---

### III. BẢNG MACRO DASHBOARD

> **Bắt buộc:** Đủ 9 chỉ số, đủ 5 cột. Nếu thiếu data, ghi "N/A - chưa công bố".

| Chỉ số | Tháng [T-1] | Tháng [T] | MoM | YoY | Nhận định tóm tắt |
|:---|:---:|:---:|:---:|:---:|:---|
| **PMI Manufacturing** (điểm) | | | | N/A* | >50: Mở rộng / <50: Thu hẹp |
| **IIP - Chỉ số SX Công nghiệp** (%YoY) | | | | | Động lực ngành SX |
| **Tổng mức bán lẻ & DVTD** (%YoY) | | | | | Sức mua nội địa |
| **Xuất khẩu** (tỷ USD) | | | | | Đơn hàng, cầu nước ngoài |
| **Nhập khẩu** (tỷ USD) | | | | | Nguyên liệu SX vs. tiêu dùng |
| **Cán cân thương mại** (tỷ USD) | | | | | Thặng dư/Thâm hụt |
| **FDI giải ngân** (tỷ USD, YTD) | | | | | Vốn thực bơm vào nền kinh tế |
| **CPI chung** (%YoY) | | | | | Áp lực lạm phát tổng thể |
| **CPI lõi/Core CPI** (%YoY) | | | | | Lạm phát nội sinh, xu hướng thực |
| **Tăng trưởng tín dụng** (%YTD) | | | | | Điều kiện tài chính |
| **Đầu tư công** (% kế hoạch, YTD) | | | | | Hiệu quả chi tiêu chính phủ |

*PMI không có YoY do là chỉ số cấp độ, không phải tốc độ tăng trưởng.

---

### IV. PHÂN TÍCH CHUYÊN SÂU (Deep-Dive Analysis)

#### A. Khu vực Sản xuất & Cầu Tiêu dùng

Trả lời 4 câu hỏi cốt lõi:
1. **Đơn hàng xuất khẩu có đang phục hồi không?** → PMI sub-index (New Export Orders), XK theo nhóm hàng
2. **Ngành nào đang dẫn dắt / kéo lùi IIP?** → Phân tích theo cơ cấu (Điện tử, Dệt may, Thép...)
3. **Sức mua nội địa có thực sự cải thiện?** → Bán lẻ thực (loại lạm phát), doanh thu dịch vụ lưu trú & ăn uống
4. **FDI giải ngân có đang hiện thực hóa?** → Gap giữa FDI đăng ký và giải ngân

**Format:** 3-4 đoạn văn, mỗi đoạn ≤ 5 dòng. Dùng bullet khi liệt kê ngành.

#### B. Áp lực Tỷ giá & Lãi suất

Trả lời 4 câu hỏi cốt lõi:
1. **Tỷ giá USD/VND biến động theo hướng nào?** → So sánh tỷ giá trung tâm SBV và tỷ giá thương mại
2. **SBV đang hút hay bơm tiền qua OMO?** → Khối lượng ròng OMO (tỷ VND), kỳ hạn chủ đạo
3. **Lãi suất liên ngân hàng đang ở đâu?** → So sánh với lãi suất điều hành của SBV
4. **Xu hướng lãi suất huy động thực của NHTM?** → Là chỉ báo cho thấy áp lực thanh khoản ngân hàng

**Format:** 3-4 đoạn văn + 1 bảng nhỏ tóm tắt các thước đo lãi suất quan trọng.

---

### V. DỰ BÁO & RỦI RO (Forward-Looking & Tail Risks)

#### Kịch bản Cơ sở (Base Case - xác suất ~60-70%)

```
Điều kiện: [Giả định nền: Fed không làm gì bất ngờ, XK tiếp tục phục hồi...]
Dự báo tháng [T+1]:
  - PMI: [dự báo vùng]
  - Tỷ giá: [dự báo vùng]
  - CPI: [dự báo vùng]
  - Tín dụng: [dự báo xu hướng]
Hành động SBV dự kiến: [...]
```

#### Kịch bản Rủi ro (Risk Case - xác suất ~30-40%)

```
Trigger: [Điều gì có thể xảy ra để kịch bản có hại hơn]
Diễn biến:
  - [Chuỗi nhân quả: A → B → C → Tác động đến VN]
Chỉ báo cần theo dõi (Early Warning):
  - [KPI 1]: Nếu vượt ngưỡng [...] thì kịch bản rủi ro đang hiện thực hóa
  - [KPI 2]: [...]
```

#### Thiên Nga Đen Cần Phòng Thủ (Tail Risks)

Liệt kê 2-3 rủi ro với xác suất thấp nhưng tác động cực lớn:

```
🦢 [Tên rủi ro]: [Mô tả 1-2 câu về cơ chế tác động đến VN]
```

---

## Mermaid Diagram Bắt buộc

Cuối báo cáo, tạo **1 diagram tóm tắt** loại `flowchart` hoặc `quadrantChart`:

### Option 1: Flowchart Rủi ro-Cơ hội

```mermaid
flowchart LR
    A["🌍 Vĩ mô Toàn cầu"] --> B{"Tác động\nđến VN"}
    B --> C["✅ Cơ hội\n(XK, FDI...)"]
    B --> D["⚠️ Rủi ro\n(Tỷ giá, CPI...)"]
    C --> E["📈 Kịch bản\nCơ sở"]
    D --> F["📉 Kịch bản\nRủi ro"]
```

### Option 2: Macro Compass (Quadrant)

```mermaid
quadrantChart
    title Macro Compass - Tháng [T]/[YYYY]
    x-axis "Tăng trưởng Yếu" --> "Tăng trưởng Mạnh"
    y-axis "Lạm phát Thấp" --> "Lạm phát Cao"
    quadrant-1 "Quá nóng (Overheating)"
    quadrant-2 "Đình lạm (Stagflation)"
    quadrant-3 "Giảm phát (Deflation)"
    quadrant-4 "Goldilocks Zone"
    "Việt Nam T-1": [0.45, 0.35]
    "Việt Nam T": [0.55, 0.40]
```

---

## Quy tắc Văn phong Báo cáo

| Quy tắc | Đúng | Sai |
|:---|:---|:---|
| Phải có số liệu | "PMI tăng từ 50,2 lên 51,5" | "PMI cải thiện đáng kể" |
| Phải có nguồn | "Theo GSO, CPI tháng 2..." | "CPI tháng 2..." |
| Không hô hào | "Rủi ro tỷ giá cần theo dõi" | "Tỷ giá cực kỳ nguy hiểm!" |
| Giải thích thuật ngữ | "OMO (nghiệp vụ thị trường mở)" | "OMO tăng mạnh" (không giải thích) |
| Kịch bản phải có trigger | "Nếu Fed tăng lãi suất bất ngờ..." | "Rủi ro lãi suất Mỹ tăng" |

---

## Disclaimer Bắt buộc

Thêm vào cuối mỗi báo cáo:

```
---
> **Miễn trừ trách nhiệm:** Báo cáo này được lập dựa trên các nguồn thông tin công khai và
> mang tính tham khảo nghiên cứu. Đây **không phải** là khuyến nghị đầu tư.
> Số liệu có thể được điều chỉnh khi cơ quan nhà nước cập nhật.
>
> *Made by Anh Tu - Share to be share*
```
