---
slug: Prompt engineering là gì ?
title: Prompt engineering là gì ?
# authors: [anhhtus]
tags: [chatGPT, documentation, hackathon, GPT-3, Prompt]
---

# Prompt engineering là gì ?

## 1. Prompt là gì ?

![Untitled](Prompt%20engineering%20la%CC%80%20gi%CC%80%202ccdf79c63644ae88ea08feae555addf/Untitled.png)

**Định nghĩa:** Prompt là một cấu trúc câu (có quy tắc) đóng vai trò là đầu vào của một mô hình ngôn ngữ (lang uage model)→ Nhằm sinh ra phản hồi (response) mong muốn.
<!--truncate-->
![Untitled](Prompt%20engineering%20la%CC%80%20gi%CC%80%202ccdf79c63644ae88ea08feae555addf/Untitled%201.png)

Màn hình chính của chatGPT đã chứa rất nhiều ví dụ về prompt

Phản hồi của mô hình **phụ thuộc rất lớn** vào cách bạn thiết kế prompts. Điều này có nghĩa là bạn cần đảm bảo cung cấp prompts có được thiết kế tốt, nếu không phản hồi nhận lại sẽ không như mong muốn

> Whole concept of garbage in, garbage out.
If your prompt is garbage, your response will be garbage, and the model won't really do that well.
> 

### Tối ưu hoá prompt (Prompt optimization)

Hãy nhận xét ví dụ bên dưới

**Câu hỏi:** Viết cho tôi một bài kiểm tra kỹ năng excel
**ChatGPT trả lời:**

![Untitled](Prompt%20engineering%20la%CC%80%20gi%CC%80%202ccdf79c63644ae88ea08feae555addf/Untitled%202.png)

Nhận xét: Kết quả tương đối tốt đúng không nào, đề bài rất chi tiết thậm chí trích nguồn và câu hỏi cũng rất rõ ràng. Tuy nhiên đề bài quá chung chung và không đáp ứng được nhu cầu thực tế → **Cần thiết là rõ các yêu cầu**: đối tượng hướng đến là ai , dạng câu hỏi là gì, đáp án ra sao ?  

Hãy cùng viết lại câu hỏi này theo prompt như sau: 

![Untitled](Prompt%20engineering%20la%CC%80%20gi%CC%80%202ccdf79c63644ae88ea08feae555addf/Untitled.svg)

Kết quả ổn hơn rồi đúng không, hãy tìm cách tối ưu hoá hơn nữa nhé.

### Quy tắc viết Prompt sao cho tốt:

1. Hãy thật chi tiết và rõ ràng ← Ngữ nghĩa phức tạp các bạn đưa vào model không thể tiếp thu được.
2. Cung cấp cho mô hình các ví dụ cụ thể thay vì giả định
3. Vì chatGPT khác với goolge, các mô hình học thường có độ trễ nên không nên đặt những câu hỏi mang tính thông tin đến thời điểm hiện tại

Với các mô hình xử lý ngôn ngữ tự nhiên như GPT-3, rất có thể một công việc mới được hình thành trong tương lai để tạo ra các prompts tốt cho mô hình có kết quả phản hồi tốt. 

Cuối cùng hãy nhớ rằng:

> The quality of the prompt is crucial to the quality of the response that the model generates. A well-crafted prompt will help the model understand what is expected of it and generate an appropriate response. On the other hand, a poorly crafted prompt can lead to a poor response or even an error.
> 

Peach.

Reference:

1. [https://docs.cohere.ai/docs/prompt-engineering](https://docs.cohere.ai/docs/prompt-engineering)
2. [https://en.wikipedia.org/wiki/Prompt_engineering](https://en.wikipedia.org/wiki/Prompt_engineering)