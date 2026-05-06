---
sidebar_position: 0
description: "Lộ trình ôn thi AI-901 (Azure AI Fundamentals) bằng tiếng Việt. Tổng quan cấu trúc kỳ thi, so sánh AI-900 vs AI-901, hướng dẫn học khi hết free tier."
---

# Lộ Trình Ôn Thi AI-901

## Agenda

**Thời gian đọc ước tính:** ~8 phút

### Sau bài này, bạn sẽ:
- ✅ **Hiểu** được AI-901 khác gì AI-900 và tại sao Microsoft làm lại từ đầu
- ✅ **Nắm** được cấu trúc 2 domain và tỉ trọng điểm thi
- ✅ **Biết** cách ôn thi khi hết Azure free tier

### Yêu cầu đầu vào:
- 🔹 Python cơ bản (biết viết function, đọc được code)
- 🔹 Hiểu sơ về Cloud (biết khái niệm server, API)

---

## Vấn đề & Giải pháp

**Vấn đề:**
- AI-900 (kỳ thi cũ) chỉ hỏi lý thuyết "describe AI concepts" — không thực chiến
- Microsoft nhận ra thị trường cần developer biết *làm được*, không chỉ *nói được*
- Tài liệu ôn AI-901 tiếng Việt gần như chưa có

**Giải pháp (chuỗi tài liệu này):** Học song song lý thuyết + thực hành với Microsoft Foundry, có **2 track**: Azure subscription và Free tier.

---

## AI-901 là gì?

**Định nghĩa:** AI-901 (Microsoft Azure AI Fundamentals) là kỳ thi chứng chỉ nền tảng, đánh giá khả năng **hiểu khái niệm AI và triển khai giải pháp AI thực tế** trên nền tảng Microsoft Foundry bằng Python.

:::info Lịch sử ra đời
AI-901 thay thế AI-900, beta từ tháng 4/2026 và GA tháng 6/2026. AI-900 sẽ retire **30/6/2026**. Lý do: thị trường cần developer biết *build*, không chỉ *describe*.
:::

```mermaid
flowchart LR
    subgraph OLD ["AI-900 — Describe only"]
        A1["Describe AI concepts"]
        A2["Không cần code"]
    end
    subgraph NEW ["AI-901 — Build & Implement"]
        B1["Identify + Implement"]
        B2["Python bắt buộc"]
        B3["Microsoft Foundry"]
    end
    OLD -->|"Retire 30/6/2026"| NEW
    style OLD fill:#fee2e2
    style NEW fill:#dcfce7
```

---

## Cấu Trúc Kỳ Thi

| Domain | Tỉ Trọng | Nội Dung |
|---|---|---|
| **Domain 1:** Identify AI concepts & responsibilities | **40–45%** | Responsible AI, AI models, AI workloads |
| **Domain 2:** Implement with Microsoft Foundry | **55–60%** | GenAI apps, Agents, Text/Speech/Vision/Extraction |

:::tip Chiến lược
Domain 2 chiếm hơn 55% → ưu tiên thực hành Foundry. Nhưng đừng bỏ Domain 1 — 40% là đủ để rớt nếu học qua loa.
:::

### Chi tiết Domain 1 — AI Concepts (40–45%)

```
1A. Responsible AI (6 nguyên tắc)
    → Fairness, Reliability & Safety, Privacy & Security
    → Inclusiveness, Transparency, Accountability

1B. AI Model Components & Configurations
    → Generative AI hoạt động thế nào?
    → Chọn model phù hợp theo use case
    → Deployment options (serverless, PTU, dedicated)

1C. AI Workloads
    → Text Analysis: NER, Sentiment, Key Phrase, Summarization
    → Speech: STT, TTS
    → Computer Vision & Image Generation
    → Information Extraction
    → Generative AI & Agentic AI
```

### Chi tiết Domain 2 — Microsoft Foundry (55–60%)

```
2A. Generative AI Apps & Agents
    → Prompt engineering (system/user prompts)
    → Deploy model trong Foundry portal
    → Build chat app bằng Foundry SDK (Python)
    → Create single-agent + build agent client app

2B. Text & Speech
    → Text analysis app với Azure AI Language
    → Spoken prompts với multimodal model
    → Azure Speech trong Foundry Tools

2C. Computer Vision & Image Generation
    → Visual input với multimodal model
    → Generate images với DALL-E

2D. Information Extraction
    → Azure Content Understanding (docs, forms, images, audio, video)
```

---

## Roadmap Bài Học

```mermaid
flowchart TD
    A["Bài 00 — Lộ Trình (Bài này)"] --> P1

    subgraph P1 ["PHẦN 1 — AI Concepts"]
        B["Bài 01\nResponsible AI"] --> C["Bài 02\nAI Models"] --> D["Bài 03\nAI Workloads"]
    end

    subgraph P2 ["PHẦN 2 — Foundry"]
        E["Bài 04\nFoundry Portal"] --> F["Bài 05\nChat App"]
    end

    subgraph P3 ["PHẦN 3 — Agents"]
        G["Bài 06\nSingle Agent"] --> H["Bài 07\nAgent Tools"]
    end

    subgraph P4 ["PHẦN 4 — Workloads"]
        I["Bài 08\nText"] --> J["Bài 09\nSpeech"]
        J --> K["Bài 10\nVision"] --> L["Bài 11\nExtraction"]
    end

    subgraph P5 ["PHẦN 5 — Ôn Tập"]
        M["Bài 12\nExam Prep"]
    end

    P1 --> P2 --> P3 --> P4 --> P5

    style P1 fill:#e0f2fe
    style P2 fill:#dcfce7
    style P3 fill:#fef9c3
    style P4 fill:#fce7f3
    style P5 fill:#f3f4f6
```

---

## Lịch Học 4 Tuần

| Tuần | Bài | Nội Dung | Lab Environment |
|---|---|---|---|
| **Tuần 1** | 00, 01, 02 | Overview, Responsible AI, AI Models | Không cần Azure |
| **Tuần 2** | 03, 04, 05 | Workloads, Foundry Portal, Chat App | Azure (tiết kiệm credit) |
| **Tuần 3** | 06, 07, 08 | Agent, Agent Tools, Text Analysis | **Dùng hết credit tại đây** |
| **Tuần 4** | 09, 10, 11, 12 | Speech, Vision, Extraction, Exam Prep | Microsoft Learn Sandbox |

---

## Học Khi Hết Azure Free Tier

| Môi Trường | Free | Dùng Để Học |
|---|---|---|
| **Microsoft Learn Sandbox** | ✅ | Lab chính thức, Azure thật ~60 phút/session |
| **Azure for Students** | ✅ Không cần credit card | $100 credit/năm nếu có email trường |
| **GitHub Codespaces** | ✅ 60h/tháng | Chạy Python code |
| **Google Colab** | ✅ | Python notebooks |
| **Groq API** | ✅ Free tier rộng | Thay GPT-4o test chat app |
| **ai.azure.com Foundry** | ✅ Một số model | Học Foundry Portal UI |

:::tip Microsoft Learn Sandbox — lựa chọn số 1
Vào bất kỳ module học trên `learn.microsoft.com`, bấm **"Activate sandbox"** → có Azure resource group thật, miễn phí, không cần thẻ credit.
:::

:::warning Đăng ký thi
Dùng **personal MSA account** (Outlook/Hotmail), không dùng work/school account. Record thi có thể bị mất khi rời tổ chức.
:::

---

## Thông Tin Thi

| Thông Tin | Chi Tiết |
|---|---|
| Tên kỳ thi | AI-901: Microsoft Azure AI Fundamentals |
| Điểm đạt | 700/1000 |
| Thời gian | ~65 phút |
| Đăng ký | Pearson VUE |
| Chứng chỉ | Microsoft Certified: Azure AI Fundamentals |

---

## Resources

- [AI-901 Exam Page](https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-901/)
- [AI-901 Study Guide](https://aka.ms/AI901-StudyGuide) — Cập nhật 15/4/2026
- [Intro to AI in Azure Course](https://learn.microsoft.com/en-us/training/courses/ai-901t00)
- [Microsoft Foundry Portal](https://ai.azure.com)

---

*Made by Anh Tu - Share to be shared*
