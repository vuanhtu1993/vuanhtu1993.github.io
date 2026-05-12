---
sidebar_position: 3
description: "Real-world case studies applying RAI principles across industries, plus a comprehensive AI-900 exam preparation guide covering all 8 workshops with key concepts and service selection patterns."
tags: [ai-900, responsible-ai, exam-prep, case-studies, ai-900-review]
---

# 3. Case Studies and AI-900 Exam Preparation

## 3.1 Agenda

**Estimated reading time:** ~15 minutes

### Learning Outcomes

- Analyze *(phân tích)* real-world case studies through the lens *(lăng kính)* of Responsible AI principles
- Identify which principle is most relevant to each scenario
- Review key concepts, service selection patterns, and exam traps *(bẫy)* across all 8 workshops
- Apply a structured *(có cấu trúc)* reasoning framework to AI-900 scenario questions

---

## 3.2 Quick Glossary

| Term | Quick Explanation |
| :--- | :--- |
| **Exam scenario question** | Dạng câu hỏi AI-900 phổ biến nhất — mô tả *(describe)* một tình huống kinh doanh *(business situation)* và hỏi service hoặc principle nào phù hợp. |
| **Distractor** *(Lựa chọn gây nhầm lẫn)* | Câu trả lời sai nhưng có vẻ hợp lý *(plausible)* — được thiết kế để thử thách *(test)* sự phân biệt chính xác *(precise distinction)* của bạn. |

---

## 4. Real-World Case Studies

### 4.1 Case Study 1 — Healthcare: Diagnostic AI with Privacy and Fairness Concerns

**Context:** A hospital in Vietnam deploys an AI model to assist *(hỗ trợ)* radiologists in detecting lung cancer from chest X-rays *(phim X-quang ngực)*. The model was trained on a US hospital's dataset.

**What happened:**
- Overall *(tổng thể)* accuracy: 91%
- Accuracy for Vietnamese patients (unseen *(chưa thấy)* demographic in training data): 74%
- Patient CT scans *(quét cắt lớp)* are sent to an Azure endpoint without PII stripping *(loại bỏ PII)*
- Radiologists trust the AI output without additional review *(xem xét thêm)*

**Responsible AI analysis:**

| Principle | Violation | Fix |
| :--- | :--- | :--- |
| **Fairness** | 74% accuracy for Vietnamese patients vs. 91% overall — representation bias | Evaluate on local demographic *(nhân khẩu học địa phương)* data; retrain or fine-tune on Vietnamese scans |
| **Privacy** | Patient scans sent without PII anonymization | Strip *(loại bỏ)* patient name, ID, and DOB before API call |
| **Reliability** | Radiologists over-rely *(phụ thuộc quá mức)* on AI without independent *(độc lập)* review | Implement mandatory *(bắt buộc)* human-in-the-loop *(con người trong vòng lặp)* for all positive flags *(cờ dương)* |
| **Transparency** | Model's 74% subgroup accuracy not disclosed *(tiết lộ)* to clinical *(lâm sàng)* staff | RAI Dashboard error analysis by demographic group; staff education *(giáo dục nhân viên)* |
| **Accountability** | No clear owner *(chủ sở hữu)* if model misdiagnoses *(chẩn đoán sai)* a patient | Assign clinical AI governance role; maintain audit logs per scan |

---

### 4.2 Case Study 2 — Finance: Credit Scoring Model

**Context:** A fintech *(công nghệ tài chính)* company uses Azure ML to build a loan approval model trained on 5 years of historical data. The model uses zip code *(mã bưu chính)* as a feature.

**What happened:**
- Model achieves 88% accuracy overall
- Rejection rate *(tỷ lệ từ chối)* is 40% higher for applicants in historically *(lịch sử)* low-income zip codes
- Customers who are rejected receive only: *"Application declined — does not meet criteria *(không đáp ứng tiêu chí)*."*
- Regulators flag the system as potentially violating *(vi phạm)* fair lending laws *(luật cho vay công bằng)*

**Responsible AI analysis:**

| Principle | Issue | Resolution |
| :--- | :--- | :--- |
| **Fairness** | Zip code proxies *(đại diện)* for race — disparate impact on minority *(thiểu số)* neighborhoods | Remove zip code as feature; test model for demographic parity |
| **Transparency** | Rejection reason not provided — violates *(vi phạm)* GDPR "right to explanation" | Implement Local Explainability (SHAP) — generate per-decision *(từng quyết định)* reasons |
| **Accountability** | No audit trail *(dấu vết kiểm toán)* of model versions or decisions | Azure ML Model Registry + Azure Monitor logging for all API calls |
| **Privacy** | No data minimization — unnecessary personal data collected | Review feature set; collect only what demonstrably *(có thể chứng minh)* improves accuracy |

---

### 4.3 Case Study 3 — Hiring Tool *(Công cụ tuyển dụng)*: NLP for CV Screening

**Context:** An HR department uses Azure AI Language to extract keywords from CVs and rank candidates. The system is used without human review for the initial screening *(sàng lọc)* stage.

**What happened:**
- Model learned that top-performing past hires *(nhân viên tốt)* had keywords like "led," "managed," "architected" — all historically more common in male candidate language
- Female candidates using "collaborated *(hợp tác)*," "supported *(hỗ trợ)*," "contributed *(đóng góp)*" were systematically *(có hệ thống)* ranked lower
- No human reviewed the ranking logic

**Responsible AI analysis:**

| Principle | Issue |
| :--- | :--- |
| **Fairness** | Gender-coded language *(ngôn ngữ liên quan đến giới tính)* bias in training data → disparate impact |
| **Accountability** | No human in the loop — AI made hiring decisions autonomously *(tự chủ)* |
| **Transparency** | Candidates had no visibility *(khả năng thấy được)* into why they were screened out |
| **Inclusiveness** | System disadvantaged *(gây bất lợi)* candidates whose language reflected cultural or gender norms *(chuẩn mực)* |

**Fix:** Human-in-the-loop for all screening; blind *(ẩn danh)* CV processing; fairness audit *(kiểm toán)* against gender; regular bias testing.

---

## 5. AI-900 Exam Preparation

### 5.1 How AI-900 Scenario Questions Work

AI-900 scenario questions follow a predictable *(có thể dự đoán)* pattern:

1. **Describe a business problem** — usually 2–4 sentences
2. **Ask which Azure AI service / principle / tool** applies
3. **Include 2–3 distractors** — services that *almost* fit but miss a key detail

**The winning framework *(khung chiến thắng)*:**
1. Identify the **data type** *(text / image / audio / document / multimodal)*
2. Identify the **task type** *(classify / extract / generate / detect / translate / transcribe)*
3. Identify any **special constraints** *(custom domain / regulated industry / privacy / real-time)*
4. Match to the correct service using the decision tables from each workshop

---

### 5.2 Master Service Selection Reference

| Workload | Task | Correct Azure Service |
| :--- | :--- | :--- |
| **Language** | Sentiment, NER, key phrases, language detection | Azure AI Language (prebuilt) |
| **Language** | Custom intent + entity recognition | Azure AI Language — CLU |
| **Language** | FAQ chatbot from documents | Azure AI Language — Question Answering |
| **Language** | Custom text categories | Azure AI Language — Custom Classification |
| **Language** | Real-time text translation | Azure AI Translator |
| **Speech** | Audio → Text (general) | Azure AI Speech — STT |
| **Speech** | Audio → Text (domain-specific *(chuyên biệt)* vocabulary) | Azure AI Speech — Custom Speech |
| **Speech** | Identify WHO is speaking in a recording | Azure AI Speech — Speaker Diarization |
| **Speech** | Verify if a voice matches a registered user | Azure AI Speech — Speaker Verification |
| **Vision** | Describe, tag, detect objects in general images | Azure AI Vision — Image Analysis |
| **Vision** | Extract raw text from any image | Azure AI Vision — Read API (OCR) |
| **Vision** | Extract structured fields *(trường có cấu trúc)* from invoices/forms | Azure AI Document Intelligence |
| **Vision** | Train your own image classifier | Azure AI Custom Vision |
| **Vision** | Count people in a video stream *(luồng video)* | Azure AI Vision — Spatial Analysis |
| **Vision** | Verify two face photos are the same person | Azure AI Face — Face Verification |
| **GenAI** | Generate new text, summarize, answer conversationally | Azure OpenAI — GPT-4o |
| **GenAI** | Generate images from text prompt | Azure OpenAI — DALL-E 3 |
| **GenAI** | Transcribe audio with high multilingual accuracy | Azure OpenAI — Whisper |
| **GenAI** | Q&A grounded *(có cơ sở)* in private documents | Azure OpenAI + RAG (AI Search) |
| **Safety** | Detect harmful text/image content | Azure AI Content Safety |
| **Custom ML** | Domain-specific model, full data control | Azure Machine Learning |

---

### 5.3 Key Distinctions That AI-900 Tests Most

| Question Type | The Trap | The Answer |
| :--- | :--- | :--- |
| Vision Read API vs. Document Intelligence | Both do OCR | Read API = raw text; Document Intelligence = structured fields |
| Azure AI Language vs. Azure OpenAI | Both process text | Language = deterministic *(tất định)*, structured; OpenAI = generative *(tạo sinh)*, flexible |
| CLU vs. Question Answering | Both are conversational | CLU = intent/entity for action; QA = retrieves answers from documents |
| Speaker Diarization vs. Speaker Verification | Both involve identifying speakers | Diarization = separate *(phân biệt)* unknown speakers in a recording; Verification = match against a known *(đã biết)* voice |
| Azure AI Vision vs. Custom Vision | Both analyze images | Azure AI Vision = general tasks; Custom Vision = domain-specific model you train |
| Supervised vs. Unsupervised | Problem type | Supervised = labeled data; Unsupervised = no labels → clustering / anomaly detection |
| Overfitting vs. Underfitting | Model behavior | Overfitting = great training, poor test; Underfitting = poor both |
| RAG vs. Fine-tuning | Customization approach | RAG = external knowledge at query time; Fine-tuning = knowledge baked *(mã hóa)* into model weights |
| Hallucination source | Why it happens | Next-token prediction, NOT a retrieval failure — structural, not a bug |
| Content Safety vs. Prompt Shields | Two different defenses | Content Safety = filters output; Prompt Shields = blocks jailbreak/injection attempts at input |

---

### 5.4 Responsible AI Quick Reference

| Principle | One-Line Definition | Azure Tool |
| :--- | :--- | :--- |
| **Fairness** | Equal outcomes across demographic groups | Fairlearn, RAI Dashboard — Fairness Analysis |
| **Reliability & Safety** | Performs correctly under all conditions | Error Analysis, Model Monitoring, Content Safety |
| **Privacy & Security** | Protects personal data throughout lifecycle | PII Detection, Private Endpoints, Encryption |
| **Inclusiveness** | Works for all people, languages, and abilities | Multilingual testing, Custom Speech for accents |
| **Transparency** | Understandable decisions and disclosed limitations | InterpretML, Counterfactual Analysis, Transparency Notes |
| **Accountability** | Clear human ownership and audit trails | Model Registry, Audit Logs, RBAC, Human-in-the-loop |

---

### 5.5 The Five AI-900 Exam Domain Weights

| Domain | Weight | Key Topics |
| :--- | :--- | :--- |
| **AI workloads and considerations** | ~15% | ML types, AI workloads, Responsible AI principles |
| **Fundamental principles of ML on Azure** | ~20% | ML concepts, Azure ML, AutoML, Designer |
| **Computer Vision on Azure** | ~15% | CV tasks, Azure AI Vision, Custom Vision, Document Intelligence |
| **NLP on Azure** | ~15% | NLP pipeline, Azure AI Language, Azure AI Speech |
| **Generative AI on Azure** | ~35% | LLMs, Azure OpenAI, RAG, Responsible GenAI |

> **Note:** Generative AI is now the *highest-weighted *(trọng số cao nhất)* domain* in AI-900 (updated 2024). Master Workshop 7 content thoroughly *(kỹ lưỡng)*.

---

### 5.6 Common Exam Mistakes to Avoid

1. **Confusing Azure AI Vision and Azure AI Document Intelligence** — always ask: "Does the output need to be raw text OR structured fields?"
2. **Applying Azure OpenAI when Azure AI Language suffices** — if the task is deterministic (classify, extract, detect), prefer the specialized *(chuyên biệt)* Language service
3. **Thinking hallucination can be "fixed" by better prompting** — it's structural; mitigation *(giảm thiểu)* requires RAG + human review
4. **Confusing Precision and Recall** — always tie *(kết nối)* to the business cost: "Which is worse: False Positive or False Negative?"
5. **Treating Responsible AI as only about bias** — it covers all 6 principles; security, privacy, reliability, transparency, and accountability are equally *(bình đẳng)* important

---

## 6. Course Capstone Discussion

**Q1 — Cross-Workshop Integration:**
A hospital deploys a system that: (1) transcribes doctor-patient conversations with Azure AI Speech, (2) extracts symptoms and medications from transcripts with Azure AI Language, (3) uses GPT-4o to generate a patient care summary, (4) flags the summary for a doctor's review before sending to the patient. Identify which Responsible AI principle applies most critically *(quan trọng nhất)* to each of the four steps, and which Azure safety tool mitigates *(giảm thiểu)* the primary risk at each step.

**Q2 — Build vs. Buy — Full Analysis:**
A Vietnamese e-commerce company wants to implement all of the following: (a) detect fake product reviews *(đánh giá sản phẩm giả)* in Vietnamese, (b) classify products into 200 custom categories from photos, (c) answer customer questions about return policies conversationally, (d) generate personalized product descriptions. For each, recommend *(đề xuất)* the appropriate Azure service — and explicitly *(rõ ràng)* state whether it requires training *(cần training)* or not.

**Q3 — Responsible AI as Competitive Advantage *(Lợi thế cạnh tranh)*:**
Many students view Responsible AI as a compliance *(tuân thủ)* cost — something required *(bắt buộc)* by regulation rather than desired *(mong muốn)*. Construct *(xây dựng)* a business argument *(lập luận kinh doanh)* for why an organization that invests proactively *(chủ động)* in Responsible AI — beyond *(vượt ra ngoài)* minimum compliance — gains measurable *(có thể đo lường)* competitive advantage *(lợi thế cạnh tranh)* in three specific dimensions *(chiều)*.

---

*Made by Anh Tu - Share to be share*
