---
name: create-tech-lecture
description: "Skill chuyên tạo bài viết kỹ thuật IT **tiếng anh** chuyên sâu với văn phong sư phạm, gần gũi. Sử dụng khi cần giải thích concept khó (Docker, Kubernetes, Design Patterns...), so sánh công nghệ (React vs Vue, SQL vs NoSQL...), hoặc hướng dẫn thực hành (Tutorial). Tối ưu cho đối tượng Intern/Junior bằng phương pháp 4MAT System + Direct & Visual First."
---

# Create Tech Lecture Skill

Skill hỗ trợ giảng viên CNTT tạo bài viết kỹ thuật đi thẳng vào trọng tâm, tinh gọn và dễ hiểu, áp dụng hệ thống **4MAT** để phục vụ đủ 4 kiểu người học.

## Phần 1: Agenda & Learning Outcomes (BẮT BUỘC)

**Mỗi bài viết PHẢI bắt đầu bằng khối Agenda.** Đây là "hợp đồng học tập" giữa người viết và người đọc, giúp người học biết trước họ sẽ đạt được gì.

### Template Agenda

```markdown
## 📋 Agenda

**Thời gian đọc ước tính:** ~X phút

### Learning outcome:
- ✅ **Hiểu** được [khái niệm cốt lõi A] là gì và tại sao nó tồn tại
- ✅ **Giải thích** được [khái niệm B] bằng ngôn ngữ đơn giản cho người khác
- ✅ **Tự tay** làm được [task thực hành C] từ đầu
- ✅ **Phân biệt** được khi nào dùng [X] và khi nào không nên dùng [X]

```

### Quy tắc viết Learning Outcomes
- Dùng **động từ hành động** (theo Bloom's Taxonomy): *hiểu, giải thích, tự tay làm, phân biệt, áp dụng, thiết kế*
- **Tối đa 4-5 outcomes** — nhiều hơn sẽ gây choáng ngợp
- Outcomes phải **đo lường được** — tránh viết mơ hồ như "hiểu sâu về X"

### Template Thuật ngữ (Glossary)

**Bắt buộc nếu bài viết có >3 thuật ngữ chuyên ngành.** Đặt ngay sau Agenda để trang bị trước cho người học về từ vựng trong bài viết.

```markdown
## 📖 Giải nghĩa thuật ngữ

| Thuật ngữ | Giải thích nhanh |
| :--- | :--- |
| **Term A** | Nghĩa tiếng Việt + Giải thích chi tiết. |
| **Term B** | Nghĩa tiếng Việt + Giải thích chi tiết. |
```

---

## Phần 2: Quy trình 4MAT System

4MAT phục vụ 4 kiểu người học khác nhau trong cùng một bài viết.

```mermaid
flowchart LR
    A["❓ WHY<br>(Động lực)"] --> B["📖 WHAT<br>(Lý thuyết)"]
    B --> C["🔨 HOW<br>Thực hành)"]
    C --> D["🚀 WHAT IF<br>(Khám phá)"]
    style A fill:#ff6b6b,color:#fff
    style B fill:#4ecdc4,color:#fff
    style C fill:#45b7d1,color:#fff
    style D fill:#96ceb4,color:#fff
```

### 🔴 WHY — Vấn đề kỹ thuật
**Mục tiêu:** Nêu bật bài toán cốt lõi. Tài liệu chuyên nghiệp không dùng câu hỏi tu từ hay dẫn dắt cảm xúc.

**Quy tắc viết:**
- **Problem Statement:** Liệt kê các nỗi đau (pain points) kỹ thuật dưới dạng số thứ tự hoặc bullet points.
- **Solution:** Trình bày ngắn gọn cách công nghệ này giải quyết vấn đề.
- **CẤM:** Không dùng "Bạn đã bao giờ...", "Chắc hẳn bạn đang...". Đi thẳng vào: "Thực trạng kỹ thuật hiện nay..." hoặc "Vấn đề phát sinh khi..."

**Ví dụ:**
```markdown
## ❓ Vấn đề & Giải pháp của Docker

**Vấn đề (Problem Statement):**
- Môi trường phát triển không đồng nhất (chạy trên máy Dev nhưng lỗi khi release Production).
- Xung đột version thư viện khi chạy nhiều project trên cùng một server máy chủ.

**Giải pháp (Solution):**
Docker cung cấp nền tảng **containerization**, giúp định nghĩa và đóng gói ứng dụng cùng mọi dependencies vào một container độc lập. Nhanh gọn và đảm bảo môi trường nhất quán tuyệt đối ở mọi nơi cài đặt.
```

---

### 🟢 WHAT — Nó là cái gì?
**Mục tiêu:** Đưa ra định nghĩa kỹ thuật chính xác và trực quan hóa kiến trúc/luồng hoạt động.

Đi thẳng vào trọng tâm kỹ thuật kết hợp với minh họa sơ đồ. Dành cho người học muốn nắm bắt bản chất cốt lõi ngay lập tức thay vì đọc văn xuôi dài dòng.

**Phải bao gồm:**
1. **Định nghĩa kỹ thuật:** Đưa ra khái niệm chính xác, súc tích ngay từ đầu.
2. **Trực quan hóa (Visual First):** LUÔN sử dụng sơ đồ Mermaid (Architecture/Flow) để minh họa cơ chế hoạt động, thay cho lời văn thuyết minh.
3. **Definition Anatomy (Giải phẫu định nghĩa):** Sau khi đưa ra định nghĩa chính, hãy thực hiện "mổ xẻ" từng từ khóa quan trọng để người học hiểu rõ bản chất cấu thành thay vì chỉ dịch nghĩa đơn thuần.
*(Lưu ý: Hạn chế tối đa việc lạm dụng ẩn dụ. Chỉ dùng 1-2 câu "ví như" nếu concept thực sự quá trừu tượng).*

**Ví dụ:**
```markdown
## 📖 Docker hoạt động như thế nào?

**Định nghĩa:** Docker là một nền tảng tạo, chạy và quản lý ứng dụng bên trong các Container (môi trường cô lập) dựa trên nhân Linux.

**Kiến trúc cốt lõi:**
```mermaid
flowchart LR
    A[Dockerfile] -->|build| B(Docker Image)
    B -->|run| C[(Docker Container)]
```
- **Image:** Template hệ thống chứa ứng dụng và thư viện liên quan.
- **Container:** Một instance thực thể đang chạy được sinh ra từ Image.
```

---

### 🔵 HOW — Làm nó như thế nào?
**Mục tiêu:** Người đọc hình dung và thực hành được ngay lập tức với ví dụ tinh gọn.

Tập trung vào core logic kỹ thuật. Triển khai theo module.

**Phải bao gồm:**
- **Code ngắn gọn, trực diện (Concise Examples):** Tinh lược mọi boilerplate không liên quan (như import thừa, cấu hình không trọng tâm), chỉ lấy phần cốt lõi.
- **Code có chú thích WHY** (Tại sao viết thế này) thay vì WHAT (Đoạn này làm gì).
- **Tên file rõ ràng** ở đầu mỗi snippet.
- **Output mong đợi** để người đọc tự kiểm tra.

**Ví dụ:**
```markdown
## 🔨 Tạo Dockerfile đầu tiên

### Bước 1: Tạo file cấu hình

```dockerfile
# filename: Dockerfile

# Dùng Node 20 LTS vì đây là phiên bản ổn định nhất
FROM node:20-alpine

WORKDIR /app

# Copy package.json TRƯỚC khi copy source code
# → Tận dụng Docker cache layer, giúp rebuild siêu nhanh nếu chỉ thay đổi mã nguồn
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000

CMD ["node", "server.js"]
```

---

## Phần 3: Kết thúc bài — Câu hỏi thảo luận
** Thường là câu hỏi sâu sắc, được đúc rút và trả lời sau khi đã hiểu rõ các khái niệm trong bài
** Đưa các Pitfalls thành các câu hỏi thảo luận mở
** Dẫn chứng các usecase hoặc best practice đã thành công trên thực tế (có dẫn chứng nguồn)
---

## Phần 4: Quy tắc Code & Văn phong

### Quy tắc Code

**File Naming:**
```javascript
// ✅ filename: src/services/auth.service.ts
export class AuthService { ... }
```

**Comment WHY, not WHAT:**
```python
# ❌ Sai: Khai báo biến x
x = 10

# ✅ Đúng: Giới hạn retry để tránh vòng lặp vô tận khi API không phản hồi
MAX_RETRIES = 10
```

**Concise Examples (Tinh gọn tối đa code):**
```go
// ... (các import statements đã được rút gọn lại)
func main() {
    // 👇 Khởi tạo router bằng Gin framework (Trọng tâm)
    router := gin.Default()
    router.GET("/ping", pingHandler)
}
```

### Văn phong bắt buộc

- **Direct & Visual First:** Sử dụng tiếng anh đơn giản, dễ hiểu. Đi thẳng vào định nghĩa kỹ thuật, tận dụng tối đa sơ đồ (Mermaid) minh họa kiến trúc thay cho văn xuôi giải thích dài dòng.
- **Bullet Points:** Ưu tiên gạch đầu dòng ngắn gọn để trình bày ý tứ thay vì viết đoạn văn (paragraph) quá tràng giang đại hải.
- **Chiến lược thuật ngữ:** 
    1. **Mapping:** Liệt kê giải nghĩa nhanh ở đầu bài viết (sau Agenda).
    2. **Anatomy:** "Giải phẫu" bản chất kỹ thuật của từ khóa ở phần WHAT.
    3. **Consistency:** Giữ nguyên thuật ngữ tiếng Anh khi nhắc lại trong bài viết.
- **Ưu tiên hình ảnh và sơ đồ** để minh họa kiến trúc và luồng hoạt động thay vì văn xuôi giải thích dài dòng.
- **Quy tắc Heading & Emoji:**
    1. **Tuyệt đối KHÔNG dùng emoji** trong toàn bộ bài viết (kể cả trong heading, list hay callout).
    2. **Đánh số Heading:** Sử dụng hệ thống số thứ tự (1., 1.1., 1.2., 2., ...) cho các mục để tăng tính học thuật và dễ trích dẫn.
- **Xóa dấu vết AI (AI-free Signature):**
    1. **Cấm từ ngữ sáo rỗng:** "Tuyệt vời", "mạnh mẽ", "đáng kinh ngạc", "thú vị", "hãy cùng tìm hiểu", "trong bài viết này".
    2. **Cấm kiểu kết bài AI:** Không dùng "Tóm lại là...", "Hi vọng bài viết này giúp ích...", "Chúc bạn học tốt". Kết bài bằng bảng so sánh, Discussion Questions hoặc References.
    3. **Tư duy phản biện:** Luôn trình bày các giới hạn (limitations) và đánh đổi (trade-offs) thay vì chỉ khen ngợi công nghệ.

---

## Checklist trước khi xuất bài

- [ ] Bài viết đã loại bỏ hoàn toàn **Emoji** chưa?
- [ ] Các Heading đã được **đánh số thứ tự** (1., 1.1, ...) chưa?
- [ ] Có xuất hiện các **cụm từ sáo rỗng** của AI (ví dụ: "Trong bài viết này chúng ta sẽ...") không? (Nếu có -> Xóa).
- [ ] Phần **WHY** có đi thẳng vào thực trạng kỹ thuật, bỏ qua các câu hỏi tu từ dẫn dắt không?
- [ ] Đã có bảng **Giải nghĩa thuật ngữ** ngay sau Agenda chưa?
- [ ] Phần **WHAT** đã thực hiện **Definition Anatomy** và có sơ đồ Mermaid chưa?
- [ ] Phần kết bài có bị rơi vào kiểu "Tổng kết/Chào tạm biệt" của AI không?
- [ ] Mermaid syntax đã được kiểm duyệt bởi `mermaid-expert`?
