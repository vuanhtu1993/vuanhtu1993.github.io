---
sidebar_position: 2
description: "A detailed reference for all seven Azure AI prebuilt services covered in AI-900 — capabilities, use cases, and key distinctions between services."
tags: [ai-900, azure-ai-language, azure-ai-speech, azure-ai-vision, document-intelligence, content-safety, translator]
---

# 2. Azure AI Services

## 2.1 Agenda

**Estimated reading time:** ~15 minutes

### Learning Outcomes

- Describe the capabilities and use cases of each Azure AI prebuilt service
- Distinguish *(phân biệt)* between services that handle similar data types (e.g., Vision vs. Document Intelligence)
- Identify which service is deprecated *(đã ngừng hỗ trợ)* and its replacement
- Map a real-world capability to its specific Azure service

---

## 2.2 Glossary

| Term | Quick Explanation |
| :--- | :--- |
| **SDK** | Software Development Kit — bộ thư viện và công cụ lập trình để tích hợp dịch vụ Azure vào ứng dụng. |
| **REST API** | Giao thức giao tiếp qua HTTP — cách phổ biến nhất để gọi Azure AI services từ bất kỳ ngôn ngữ nào. |
| **Deprecated** | Dịch vụ chính thức ngừng hỗ trợ — không nhận update mới, sẽ bị tắt sau một thời gian. |
| **Neural Voice** | Giọng nói nhân tạo *(synthetic voice)* được tạo bằng deep learning — nghe tự nhiên gần giống người thật. |
| **Bounding Box** | Hộp hình chữ nhật đánh dấu vị trí của vật thể trong ảnh (tọa độ x, y, width, height). |
| **Grounding** | Kỹ thuật neo đậu LLM vào dữ liệu thực tế, có thể kiểm chứng — đối lập với hallucination *(bịa thông tin)*. |
| **Jailbreak** | Tấn công vào AI bằng cách craft *(thiết kế)* prompt để vượt qua giới hạn an toàn của model. |
| **Schema** | Cấu trúc *(structure)* định nghĩa các trường dữ liệu cần trích xuất từ tài liệu (ví dụ: invoice_number, total_amount, date). |

---

## 3. Service 1: Azure AI Language

> **Azure AI Language** is a unified NLP service that provides text analytics, language understanding, summarization, and question answering through a single API.

### 3.1 Capabilities

| Capability | What It Does |
| :--- | :--- |
| **Sentiment Analysis** *(Phân tích cảm xúc)* | Classifies text as Positive / Negative / Neutral with a confidence score |
| **Named Entity Recognition (NER)** | Extracts structured entities *(thực thể có cấu trúc)*: people, organizations, locations, dates, quantities |
| **Key Phrase Extraction** | Identifies the most informative *(có giá trị thông tin)* concepts in a document |
| **Language Detection** | Identifies the language of input text with confidence score |
| **PII Detection** *(Personally Identifiable Information)* | Detects and redacts *(che đi)* sensitive personal data (names, phone numbers, ID numbers) |
| **Text Classification** | Assigns predefined *(định sẵn)* labels to text — supports custom *(tùy chỉnh)* training |
| **Summarization** | Extractive *(trích xuất câu quan trọng)* and Abstractive *(tổng hợp nội dung mới)* summarization |
| **Question Answering** | Answers natural language questions from a knowledge base *(kho tri thức)* |
| **Conversational Language Understanding (CLU)** | Extracts *intent* *(ý định)* and *entities* from conversational input — **successor *(kế thừa)* to deprecated LUIS** |

### 3.2 Use Cases

- Customer feedback analysis (sentiment at scale *(quy mô lớn)*)
- Automated document tagging and routing *(phân loại và điều hướng)*
- Compliance monitoring *(giám sát tuân thủ)* — detect PII in documents
- Build FAQ bots using the Question Answering capability

---

## 4. Service 2: Azure AI Translator

> **Azure AI Translator** provides real-time and batch *(hàng loạt)* language translation for text and documents across 100+ languages.

### 4.1 Capabilities

| Capability | What It Does |
| :--- | :--- |
| **Text Translation** | Translates plain text between languages in real-time |
| **Document Translation** | Translates entire documents (Word, PDF, HTML) while preserving *(giữ nguyên)* formatting |
| **Transliteration** *(Phiên âm)* | Converts text to a different script — e.g., Arabic script → Latin characters |
| **Language Detection** | Auto-detects source language before translation |
| **Custom Translator** | Fine-tunes *(tinh chỉnh)* the model with domain-specific *(chuyên biệt)* terminology |

### 4.2 Use Cases

- Multilingual *(đa ngôn ngữ)* customer support portals
- Global content publishing and localization *(bản địa hóa)*
- Real-time cross-language communication in collaboration tools

---

## 5. Service 3: Azure AI Speech

> **Azure AI Speech** enables bidirectional *(hai chiều)* conversion between spoken audio and text, plus speaker recognition and voice synthesis *(tổng hợp giọng nói)*.

### 5.1 Capabilities

| Capability | What It Does |
| :--- | :--- |
| **Speech-to-Text (STT)** | Transcribes *(phiên âm)* audio in real-time or from batch files |
| **Text-to-Speech (TTS)** | Synthesizes natural-sounding speech using Neural Voices |
| **Speech Translation** | Translates spoken audio to text or audio in another language, in real-time |
| **Speaker Recognition** | Verifies *(xác minh)* or identifies a speaker's identity from audio |
| **Pronunciation Assessment** | Evaluates *(đánh giá)* pronunciation accuracy — useful for language learning |
| **Custom Speech** | Fine-tunes STT for domain-specific vocabulary *(từ vựng chuyên ngành)* (medical, legal, technical) |
| **Custom Neural Voice** | Creates a brand-specific *(đặc trưng thương hiệu)* synthetic voice from recorded samples |

### 5.2 Use Cases

- Call center transcription and analytics *(phân tích cuộc gọi)*
- Accessibility features *(tính năng hỗ trợ tiếp cận)* — voice control, screen readers
- Real-time interpretation *(phiên dịch)* in multilingual meetings
- Language learning applications with pronunciation feedback

---

## 6. Service 4: Azure AI Vision

> **Azure AI Vision** analyzes images and video to generate tags, descriptions, text, and spatial insights *(thông tin không gian)*.

### 6.1 Capabilities

| Capability | What It Does |
| :--- | :--- |
| **Image Analysis** | Returns tags, captions *(chú thích)*, objects, colors, and metadata from images |
| **Object Detection** | Detects and localizes *(định vị)* multiple objects with bounding boxes |
| **OCR (Read API)** | Extracts printed and handwritten text from images |
| **Spatial Analysis** | Detects people, tracks movement, and measures occupancy *(mức độ chiếm dụng)* in video streams |
| **Smart Crop** | Automatically identifies the most important region *(vùng quan trọng nhất)* of an image for thumbnails |

### 6.2 Azure AI Vision vs. Azure AI Document Intelligence

This distinction *(sự phân biệt)* is frequently tested in AI-900:

| Dimension | Azure AI Vision | Azure AI Document Intelligence |
| :--- | :--- | :--- |
| **Primary input** | General images *(ảnh tổng quát)* | Document images *(ảnh tài liệu — hóa đơn, form, hợp đồng)* |
| **Output** | Tags, objects, captions, general text | Structured fields *(trường có cấu trúc)*: key-value pairs, tables, document structure |
| **Intelligence level** | "What is in this image?" | "What does this *document* say, field by field?" |
| **Example** | Photo of a park → tags: [grass, trees, dog] | Photo of an invoice → `{invoice_no: "INV-001", total: "$500"}` |

### 6.3 Use Cases

- Auto-tagging product photos in e-commerce *(thương mại điện tử)*
- Retail shelf monitoring *(giám sát kệ hàng)*
- Security and surveillance *(giám sát an ninh)* analytics

---

## 7. Service 5: Azure AI Document Intelligence

> **Azure AI Document Intelligence** (formerly *(trước đây là)* Form Recognizer) automates extraction *(trích xuất tự động)* of structured data from documents using AI-enhanced OCR and ML models.

### 7.1 Capabilities

| Capability | What It Does |
| :--- | :--- |
| **Prebuilt Models** *(Mô hình dựng sẵn)* | Ready-to-use extraction for invoices *(hóa đơn)*, receipts *(biên lai)*, ID cards, tax forms, business cards |
| **Layout Model** | Extracts text, tables, and structure from any document — without domain-specific training |
| **Custom Model** | Train on your own labeled *(được gán nhãn)* documents to extract domain-specific fields |
| **Composed Model** | Combines multiple custom models into one endpoint *(điểm cuối)* for mixed document types |
| **RAG Ingestion** | Pre-processes *(tiền xử lý)* documents for use in Azure AI Search and RAG pipelines |

### 7.2 Use Cases

- Automated invoice processing in accounts payable *(kế toán phải trả)*
- KYC *(Know Your Customer — Xác minh danh tính khách hàng)* document verification in banking
- Medical record digitization *(số hóa hồ sơ y tế)*
- Logistics: automated bill of lading *(vận đơn)* extraction

---

## 8. Service 6: Azure AI Content Safety

> **Azure AI Content Safety** detects and filters harmful, inappropriate, or policy-violating *(vi phạm chính sách)* content in text, images, and multimodal inputs — for both user-generated and AI-generated content.

### 8.1 Capabilities

| Capability | What It Does |
| :--- | :--- |
| **Text Moderation** *(Kiểm duyệt)* | Detects hate speech *(ngôn ngữ thù địch)*, violence, sexual content, self-harm in text |
| **Image Moderation** | Detects harmful visual content in images |
| **Prompt Shields** | Protects against *jailbreak* attacks and *prompt injection* *(tiêm lệnh độc hại)* |
| **Groundedness Detection** | Verifies whether an LLM's response is supported *(có căn cứ)* by the provided source material |
| **Protected Material Detection** | Identifies copyrighted *(có bản quyền)* text or code in model outputs |
| **Custom Categories** | Define your own harmful content categories *(danh mục)* specific to your application |

### 8.2 Use Cases

- Social media platforms — moderation of user-generated content
- Customer-facing chatbots — prevent harmful AI responses
- Developer tools — detect copyrighted code snippets in AI code suggestions

---

## 9. Service 7: Azure AI Content Understanding

> **Azure AI Content Understanding** extracts structured insights *(thông tin có cấu trúc)* from unstructured, multimodal content — documents, images, audio, and video — using generative AI.

### 9.1 Capabilities

| Capability | What It Does |
| :--- | :--- |
| **Prebuilt Analyzer** | Extract key fields from common content types using ready-made schema *(cấu trúc dữ liệu định sẵn)* |
| **Custom Analyzer** | Define your own schema for domain-specific field extraction |
| **Multimodal Processing** | Analyze text, images, audio, and video in a single pipeline |
| **RAG Ingestion** | Structure content for use in AI Search and agent workflows *(luồng làm việc của agent)* |

### 9.2 Content Understanding vs. Document Intelligence

| Dimension | Document Intelligence | Content Understanding |
| :--- | :--- | :--- |
| **Data types** | Documents only *(PDF, images of documents)* | Multimodal *(text, image, audio, video)* |
| **Extraction approach** | OCR + ML field detection | Generative AI + schema mapping |
| **Best for** | Structured business documents | Unstructured mixed-media content |

### 9.3 Use Cases

- Call center recording analysis *(phân tích ghi âm)*: extract topics, outcomes, sentiment from audio
- Knowledge management *(quản lý tri thức)*: structure unstructured enterprise content for AI search
- Media intelligence: index and query video content by topic

---

## 10. Service Summary Reference

| Service | Primary Data | Core Capability | Common Use Case |
| :--- | :--- | :--- | :--- |
| **Azure AI Language** | Text | Sentiment, NER, Q&A, CLU | Customer feedback, FAQ bot |
| **Azure AI Translator** | Text | Cross-language translation | Multilingual support portal |
| **Azure AI Speech** | Audio | STT, TTS, Speaker ID | Call transcription, voice apps |
| **Azure AI Vision** | Images/Video | Analysis, OCR, Detection | Product tagging, surveillance |
| **Azure AI Document Intelligence** | Document images | Structured field extraction | Invoice processing, KYC |
| **Azure AI Content Safety** | Text/Images | Harmful content detection | Content moderation, chatbot safety |
| **Azure AI Content Understanding** | Multimodal | Schema-based insight extraction | Call center analytics, knowledge base |

---

## 11. Discussion Questions

**Q1 — Picking the Right Tool:**
A logistics *(hậu cần)* company wants to automatically extract the sender *(người gửi)*, recipient *(người nhận)*, weight, and tracking number *(số theo dõi)* from scanned bills of lading. They already tried Azure AI Vision's Read API but got raw text with no structure. What service should they use instead, and why?

**Q2 — Content Safety in Generative AI:**
A company deploys an Azure OpenAI-powered customer service chatbot. A user finds a way to make the chatbot respond with competitor product recommendations and offensive language. What Azure AI Content Safety capabilities would address each attack vector *(hướng tấn công)*, and at what point in the pipeline should they be applied?

**Q3 — Custom Speech Trade-off:**
A medical transcription *(phiên âm y tế)* service uses Azure AI Speech but notices 15% error rate on drug names and surgical terminology *(thuật ngữ phẫu thuật)*. They consider Custom Speech fine-tuning. What are the costs and risks of this approach vs. simply post-processing *(hậu xử lý)* the output with a medical terminology dictionary?

---

*Made by Anh Tu - Share to be share*
