---
sidebar_position: 12
description: "Ôn tập toàn bộ AI-901: tổng hợp key concepts, bộ 30 câu practice questions, chiến thuật làm bài, và checklist trước ngày thi."
---

# Ôn Tập & Chiến Thuật Thi AI-901

## Agenda

**Thời gian đọc ước tính:** ~25 phút  
**Domain:** Tổng hợp tất cả domains

### Sau bài này, bạn sẽ:
- ✅ **Ôn lại** toàn bộ key concepts theo format thi
- ✅ **Luyện tập** 30 practice questions chuẩn format AI-901
- ✅ **Nắm** được chiến thuật làm bài và quản lý thời gian

---

## Tổng Hợp Key Concepts

### Domain 1: AI Concepts (40–45%)

#### 1A. Responsible AI — 6 Nguyên Tắc

| Nguyên Tắc | Câu hỏi cốt lõi | Từ khóa nhận dạng |
|---|---|---|
| **Fairness** | Có ai bị đối xử bất công? | bias, discrimination, demographic groups |
| **Reliability & Safety** | AI có hoạt động đúng và an toàn? | consistent, fail safe, unexpected conditions |
| **Privacy & Security** | Dữ liệu cá nhân có được bảo vệ? | personal data, consent, data minimization |
| **Inclusiveness** | Có ai bị loại trừ? | accessibility, diverse abilities, empower |
| **Transparency** | AI có giải thích được quyết định? | explainable, understandable, limitations |
| **Accountability** | Ai chịu trách nhiệm khi AI sai? | governance, human oversight, responsible |

#### 1B. AI Model Components

| Concept | Key Point |
|---|---|
| **Tokenization** | Token = đơn vị xử lý; billing tính theo token |
| **Context Window** | Giới hạn token model có thể "nhớ" trong 1 lần xử lý |
| **Temperature** | 0 = deterministic, 1+ = creative/random |
| **Deployment Types** | Standard (pay-per-token), PTU (reserved), Managed Compute (custom) |
| **Model Selection** | Language, Vision, Multimodal, Speech, Embedding |

#### 1C. AI Workloads

| Workload | Azure Service | Use Case |
|---|---|---|
| Text Analysis (NER, Sentiment, KPE, Summarization) | Azure AI Language | Phân tích văn bản |
| Speech-to-Text / TTS | Azure AI Speech | Voice apps |
| Computer Vision | Azure AI Vision / GPT-4o | Image analysis |
| Image Generation | DALL-E 3 | Content creation |
| Information Extraction | Azure Content Understanding | Forms, documents |
| Generative AI | Azure OpenAI / Foundry | Chat, code, content |
| Agentic AI | Azure AI Agent Service | Multi-step automation |

---

### Domain 2: Microsoft Foundry Implementation (55–60%)

#### 2A. Generative AI Apps & Agents

| Topic | Key Point |
|---|---|
| **Foundry Structure** | Hub (governance) → Project (workspace) |
| **Deploy Model** | Model Catalog → Select → Deploy → Standard/PTU |
| **Playground** | Test model, adjust system prompt, view code |
| **Chat App** | `azure-ai-inference` SDK, SystemMessage + UserMessage |
| **Multi-turn** | Gửi full message history mỗi request |
| **Streaming** | `stream=True` → nhận chunks, tốt cho UX |
| **Agent Anatomy** | Agent (config) + Thread (session) + Run (execution) + Tools |
| **Code Interpreter** | Chạy Python sandbox, chính xác 100% |
| **File Search** | Managed RAG, upload files → auto vector store |

#### 2B-2D. Workload Solutions

| Domain | Service | Python Package |
|---|---|---|
| Text Analysis | Azure AI Language | `azure-ai-textanalytics` |
| Speech STT/TTS | Azure AI Speech | `azure-cognitiveservices-speech` |
| Vision | GPT-4o multimodal / Azure AI Vision | `azure-ai-inference` |
| Image Generation | DALL-E 3 | `openai` (AzureOpenAI) |
| Information Extraction | Azure Content Understanding | REST API / `azure-ai-documentintelligence` |

---

## 30 Practice Questions

### Phần 1: Responsible AI (10 câu)

:::note Câu 1
AI tuyển dụng từ chối 90% CV của phụ nữ. Principle nào bị vi phạm?

**A.** Transparency  
**B.** Fairness ✅  
**C.** Accountability  
**D.** Reliability

*Giải thích: Phân biệt đối xử theo giới tính = Fairness.*
:::

:::note Câu 2
Chatbot y tế thu thập toàn bộ hội thoại để training mà không xin phép. Principle nào bị vi phạm?

**A.** Fairness  
**B.** Transparency  
**C.** Privacy & Security ✅  
**D.** Inclusiveness

*Giải thích: Thu thập data cá nhân không có consent = Privacy.*
:::

:::note Câu 3
AI từ chối khoản vay nhưng không giải thích lý do. Principle nào bị vi phạm NHẤT?

**A.** Accountability  
**B.** Fairness  
**C.** Transparency ✅  
**D.** Reliability

*Giải thích: Không thể giải thích quyết định = Transparency.*
:::

:::note Câu 4
App nhận diện giọng nói độ chính xác 95% với giọng chuẩn nhưng chỉ 60% với accent vùng miền. Principle nào?

**A.** Reliability & Safety  
**B.** Fairness ✅  
**C.** Inclusiveness  
**D.** Transparency

*Giải thích: Có thể là cả Fairness (phân biệt accent) và Inclusiveness (không phục vụ đủ mọi người) — nhưng Fairness cụ thể hơn.*
:::

:::note Câu 5
Xe tự lái dừng khẩn cấp và bật hazard light khi sensor mất tín hiệu thay vì tiếp tục chạy. Principle nào được áp dụng?

**A.** Transparency  
**B.** Fairness  
**C.** Reliability & Safety ✅  
**D.** Accountability

*Giải thích: Fail safe = dừng an toàn khi có sự cố = Reliability & Safety.*
:::

:::note Câu 6
Company dùng AI cho hiring nhưng không có ai kiểm soát kết quả. Principle nào bị vi phạm?

**A.** Fairness  
**B.** Transparency  
**C.** Inclusiveness  
**D.** Accountability ✅

*Giải thích: Không có human oversight = Accountability.*
:::

:::note Câu 7
Microsoft Transparency Notes là công cụ hỗ trợ principle nào?

**A.** Fairness  
**B.** Accountability  
**C.** Transparency ✅  
**D.** Privacy

*Giải thích: Transparency Notes mô tả khả năng/giới hạn của AI = Transparency.*
:::

:::note Câu 8
Screen reader và AI mô tả ảnh hỗ trợ người khiếm thị. Principle nào nhất?

**A.** Fairness  
**B.** Inclusiveness ✅  
**C.** Reliability  
**D.** Transparency

*Giải thích: Hỗ trợ người khuyết tật, mọi người đều có thể dùng = Inclusiveness.*
:::

:::note Câu 9
AI cần hoạt động đúng kể cả khi bị tấn công adversarial. Principle nào?

**A.** Privacy & Security  
**B.** Reliability & Safety ✅  
**C.** Fairness  
**D.** Accountability

*Giải thích: Resilient với adversarial attacks = Reliability & Safety.*
:::

:::note Câu 10
Team AI không lưu lại log, không ai biết model quyết định thế nào. Hai principles nào bị vi phạm?

**A.** Fairness và Inclusiveness  
**B.** Transparency và Accountability ✅  
**C.** Privacy và Reliability  
**D.** Fairness và Transparency

*Giải thích: Không giải thích được (Transparency) + không ai chịu trách nhiệm (Accountability).*
:::

---

### Phần 2: AI Models & Workloads (10 câu)

:::note Câu 11
Model cần xử lý cả text prompt và ảnh. Loại model nào?

**A.** Language Model  
**B.** Embedding Model  
**C.** Multimodal Model ✅  
**D.** Speech Model
:::

:::note Câu 12
Deploy model cho startup với traffic không đều, muốn tối ưu chi phí. Deployment type nào?

**A.** Provisioned (PTU)  
**B.** Managed Compute  
**C.** Standard (Pay-per-token) ✅  
**D.** Developer Tier
:::

:::note Câu 13
`temperature = 0` phù hợp nhất khi nào?

**A.** Creative writing  
**B.** Brainstorming  
**C.** Code generation và fact Q&A ✅  
**D.** Storytelling
:::

:::note Câu 14
Cần tự động tag bài báo theo người/công ty/địa điểm được đề cập. Workload nào?

**A.** Sentiment Analysis  
**B.** Named Entity Recognition ✅  
**C.** Key Phrase Extraction  
**D.** Summarization
:::

:::note Câu 15
Rút gọn báo cáo 100 trang thành 1 trang, giữ nguyên từ ngữ gốc. Kỹ thuật nào?

**A.** Abstractive Summarization  
**B.** Extractive Summarization ✅  
**C.** Key Phrase Extraction  
**D.** Sentiment Analysis
:::

:::note Câu 16
Chatbot đặt lịch, gửi email, và search web tự động. Loại AI nào?

**A.** Generative AI  
**B.** Computer Vision  
**C.** Agentic AI ✅  
**D.** Speech AI
:::

:::note Câu 17
App đọc hóa đơn PDF và điền vào ERP. Service nào?

**A.** Azure AI Language  
**B.** Azure Content Understanding ✅  
**C.** Azure AI Speech  
**D.** DALL-E 3
:::

:::note Câu 18
Tạo ảnh marketing từ mô tả văn bản. Service nào?

**A.** Azure AI Vision  
**B.** Azure AI Language  
**C.** DALL-E 3 ✅  
**D.** Azure Content Understanding
:::

:::note Câu 19
Phụ đề tự động cho video hội nghị. Workload nào?

**A.** Text Analysis  
**B.** Computer Vision  
**C.** Speech-to-Text ✅  
**D.** Information Extraction
:::

:::note Câu 20
Tìm kiếm ngữ nghĩa trong 10,000 tài liệu. Loại model nào cần thiết?

**A.** Language Model  
**B.** Embedding Model ✅  
**C.** Vision Model  
**D.** Speech Model
:::

---

### Phần 3: Microsoft Foundry Implementation (10 câu)

:::note Câu 21
Trong Foundry, nơi nào quản lý RBAC, shared connections, và billing?

**A.** Project  
**B.** Playground  
**C.** Hub ✅  
**D.** Model Catalog
:::

:::note Câu 22
Chatbot "quên" context sau mỗi message. Nguyên nhân là gì?

**A.** Temperature quá cao  
**B.** Message history không được gửi kèm mỗi request ✅  
**C.** Model bị lỗi  
**D.** Max tokens quá thấp
:::

:::note Câu 23
System message nên chứa gì?

**A.** Câu hỏi của user  
**B.** Role, behavior, format, và giới hạn của model ✅  
**C.** Token count  
**D.** API key
:::

:::note Câu 24
Agent cần tính toán số học phức tạp chính xác 100%. Tool nào?

**A.** File Search  
**B.** Function Calling  
**C.** Code Interpreter ✅  
**D.** Không cần tool
:::

:::note Câu 25
Agent cần trả lời Q&A từ 500 trang tài liệu nội bộ. Tool nào?

**A.** Code Interpreter  
**B.** File Search ✅  
**C.** Function Calling  
**D.** System Prompt đủ rồi
:::

:::note Câu 26
Trong Agent Service, Thread là gì?

**A.** Một lần thực thi agent  
**B.** Định nghĩa model và tools  
**C.** Conversation session có lịch sử ✅  
**D.** Tool call kết quả
:::

:::note Câu 27
Enterprise cần predictable latency và guaranteed throughput cho 10M requests/ngày. Deployment type nào?

**A.** Standard Global  
**B.** Provisioned (PTU) ✅  
**C.** Standard Regional  
**D.** Developer Tier
:::

:::note Câu 28
Gửi audio WAV trực tiếp tới model để nhận câu trả lời. Cần model loại gì?

**A.** Language Model  
**B.** Embedding Model  
**C.** Multimodal Model (với audio support) ✅  
**D.** Speech Model riêng lẻ
:::

:::note Câu 29
Azure Content Understanding "prebuilt-invoice" analyzer trả về gì?

**A.** Audio transcript  
**B.** Image description  
**C.** Structured key-value pairs từ invoice (vendor, date, amount...) ✅  
**D.** Sentiment score
:::

:::note Câu 30
Khi nào dùng Microsoft Learn Sandbox thay Azure subscription?

**A.** Khi cần production deployment  
**B.** Khi hết Azure free credit, cần môi trường Azure thật để học/test ✅  
**C.** Khi cần custom model training  
**D.** Khi cần store data lâu dài
:::

---

## Chiến Thuật Làm Bài

### Phân Bổ Thời Gian (65 phút)

| Giai Đoạn | Thời Gian | Hành Động |
|---|---|---|
| Đọc nhanh toàn bài | 5 phút | Flag câu khó, skip câu không chắc |
| Làm câu dễ (60–70%) | 25 phút | Câu chắc chắn → làm ngay |
| Làm câu trung bình | 20 phút | Loại trừ 2 đáp án sai → chọn |
| Review câu đã flag | 10 phút | Quay lại câu khó |
| Final check | 5 phút | Không để trống |

### Tips Làm Câu Scenario

```
1. Đọc câu hỏi cuối cùng TRƯỚC → biết cần tìm gì
2. Tìm "keyword" trong scenario → match với principle/service
3. Loại trừ: phương pháp "loại trừ 2" (eliminate obviously wrong)
4. Nếu có "MOST relevant" → chọn cái trực tiếp nhất
5. Không bao giờ để trống — 25% cơ hội nếu đoán random
```

### Keyword Cheat Sheet

| Keyword trong câu | Likely Answer |
|---|---|
| "bias", "discrimination", "demographic" | Fairness |
| "fail safe", "consistent", "unexpected" | Reliability & Safety |
| "personal data", "consent", "collect" | Privacy & Security |
| "accessibility", "disability", "all users" | Inclusiveness |
| "explain", "why decided", "understand" | Transparency |
| "responsibility", "oversight", "govern" | Accountability |
| "invoice", "form", "extract fields" | Content Understanding |
| "generate image", "create visual" | DALL-E 3 |
| "transcribe", "speech to text" | Azure AI Speech |
| "multi-step", "tools", "autonomous" | Agentic AI |
| "create text", "Q&A", "chat" | Generative AI |
| "semantic search", "RAG" | Embedding + File Search |

---

## Checklist Trước Ngày Thi

### 1 Tuần Trước
- [ ] Đọc lại AI-901 Study Guide chính thức: [aka.ms/AI901-StudyGuide](https://aka.ms/AI901-StudyGuide)
- [ ] Làm hết 30 câu practice trong bài này
- [ ] Ôn lại bảng keyword cheat sheet
- [ ] Thực hành 1 lab từ đầu (end-to-end: deploy model → build chat app)

### Ngày Trước Thi
- [ ] Ngủ đủ giấc — não cần nghỉ để consolidate memory
- [ ] Review bảng tổng hợp Key Concepts (không học thêm gì mới)
- [ ] Chuẩn bị: ID, confirmation email, stable internet

### Ngày Thi
- [ ] Đăng nhập Pearson VUE sớm 15 phút
- [ ] Dùng personal MSA account (không dùng work/school account)
- [ ] Đọc câu hỏi cuối TRƯỚC khi đọc scenario
- [ ] Làm câu dễ trước, flag câu khó
- [ ] Không để trống câu nào

---

## Sau Khi Đạt Chứng Chỉ

Chứng chỉ AI-901 = **Microsoft Certified: Azure AI Fundamentals**

**Bước tiếp theo:**
- **AI-102** — Azure AI Engineer Associate (role-based, sâu hơn)
- **DP-100** — Azure Data Scientist Associate
- **AI Applied Skills** — Scenario-based credentials không cần thi (free practice assessments)

---

## Resources

- [AI-901 Exam Page](https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-901/)
- [AI-901 Study Guide](https://aka.ms/AI901-StudyGuide)
- [Microsoft Learn — Intro to AI in Azure](https://learn.microsoft.com/en-us/training/courses/ai-901t00)
- [Practice Assessment (khi available)](https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-901/#two-ways-to-prepare)
- [Exam Sandbox](https://go.microsoft.com/fwlink/?linkid=2226877) — Xem trước giao diện thi

---

*Made by Anh Tu - Share to be shared*
