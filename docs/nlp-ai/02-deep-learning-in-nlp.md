---
sidebar_position: 2
description: "Tìm hiểu sự trỗi dậy của Deep Learning trong NLP, kiến trúc RNN, LSTM, GRU và thực hành PyTorch."
---

# Bài 2: Deep Learning trong NLP - Khi Máy Tính "Nhớ" Được Ngữ Cảnh

Chào mừng bạn đến với **Module 2**. Ở bài trước, chúng ta đã biết cách dùng các phương pháp thống kê (TF-IDF, Bag of Words) để đếm từ. Tuy nhiên, ngôn ngữ không chỉ là một "túi từ" lộn xộn. Trật tự của từ quyết định ý nghĩa của cả câu. 

Để giải quyết bài toán về thứ tự và ngữ cảnh, các nhà khoa học đã đưa **Deep Learning (Học sâu)** vào NLP. Trong bài này, chúng ta sẽ khám phá cách các mạng nơ-ron nhân tạo đọc văn bản như thế nào.

---

## 1. Deep Learning trong NLP là gì? (Definition Anatomy)

> **Định nghĩa:** 
> Deep Learning trong NLP là việc sử dụng các **Mạng nơ-ron nhân tạo nhiều lớp (Deep Neural Networks)** để tự động trích xuất các đặc trưng ngữ nghĩa phức tạp từ dữ liệu văn bản, thay vì phải định nghĩa luật (rules) thủ công hoặc thiết kế đặc trưng (feature engineering) bằng tay.

Hãy cùng **"giải phẫu"** định nghĩa này:
*   **Mạng nơ-ron nhân tạo nhiều lớp:** Cấu trúc toán học mô phỏng não bộ người. Thay vì đi qua một công thức cố định, dữ liệu đi qua nhiều "lớp màng lọc" (layers). Lớp đầu nhận diện từ vựng, lớp sau nhận diện cụm từ, lớp cuối cùng nhận diện cảm xúc cả câu.
*   **Tự động trích xuất:** Ở bài trước, dùng Machine Learning truyền thống, bạn phải tự "dọn dẹp" và "đếm từ". Với Deep Learning, bạn đưa thẳng văn bản vào (dưới dạng Embedding), mạng nơ-ron tự "học" xem từ nào quan trọng, từ nào đứng cạnh nhau thì mang ý nghĩa gì.

---

## 2. Các Kiến trúc Mạng Nơ-ron Dành Cho Văn Bản (Sequential Models)

Văn bản là một loại **Dữ liệu tuần tự (Sequential Data)**. Từ đứng sau phụ thuộc vào từ đứng trước. Ví dụ: *"Hôm nay trời mưa to nên tôi mang..."* $\rightarrow$ Bộ não bạn tự đoán được từ tiếp theo có thể là *"ô"* hoặc *"áo mưa"*.

Để xử lý dữ liệu tuần tự, Deep Learning ra mắt một "gia đình" các mô hình đặc biệt.

### 2.1. RNN (Recurrent Neural Network - Mạng nơ-ron hồi quy)

```mermaid
graph LR
    A(Từ 1: Tôi) --> RNN1[RNN Node]
    RNN1 --> B(Hidden State 1)
    B --> RNN2[RNN Node]
    C(Từ 2: yêu) --> RNN2
    RNN2 --> D(Hidden State 2)
    D --> RNN3[RNN Node]
    E(Từ 3: lập trình) --> RNN3
    
    style RNN1 fill:#f9f,stroke:#333
    style RNN2 fill:#f9f,stroke:#333
    style RNN3 fill:#f9f,stroke:#333
```

*   **Nguyên lý:** RNN đọc câu văn từng từ một, từ trái sang phải. Khi đọc một từ, nó tạo ra một **Hidden State** (Trạng thái ẩn - giống như "bộ nhớ ngắn hạn"). Bộ nhớ này được truyền sang bước tiếp theo để đọc từ thứ 2. Nhờ vậy, từ thứ 2 được hiểu dựa trên ngữ cảnh của từ thứ 1.
*   **Điểm yếu (Trade-off): Vấn đề Vanishing Gradient (Mất mát thông tin).** Nếu câu văn quá dài (vd: 50 từ), khi đọc đến từ thứ 50, RNN sẽ "quên" mất từ thứ 1. Nó giống như một người có trí nhớ ngắn hạn cực kém.

### 2.2. LSTM (Long Short-Term Memory) & GRU (Gated Recurrent Unit)

Để khắc phục chứng "hay quên" của RNN, LSTM ra đời.

*   **Nguyên lý:** LSTM thêm vào các "Cánh cổng" (Gates) bao gồm: Cổng quên (Forget Gate), Cổng nhớ (Input Gate), và Cổng xuất (Output Gate). 
*   **Cách hoạt động:** Khi đọc một câu dài, LSTM tự quyết định thông tin nào là "rác" thì mở Cổng Quên để xóa đi, thông tin nào quan trọng (VD: Chủ ngữ chính) thì nó giữ lại trong "bộ nhớ dài hạn" (Cell State).
*   **GRU:** Là phiên bản "rút gọn" của LSTM. GRU ít tham số hơn, chạy nhanh hơn, tốn ít RAM hơn nhưng hiệu năng gần tương đương LSTM trong hầu hết các bài toán.

> **Critical Thinking:** 
> Dù LSTM/GRU rất mạnh, nhưng chúng có một **điểm yếu cốt tử**: Chúng bắt buộc phải đọc từ trái sang phải một cách **tuần tự**. Bạn không thể bắt chúng đọc từ thứ 10 nếu chưa đọc xong 9 từ trước đó. Điều này khiến chúng **không thể chạy song song (parallel computing)** trên GPU, làm cho việc huấn luyện cực kỳ mất thời gian. Đây chính là lý do Transformer (Module 3) sau này đánh bại LSTM.

---

## 3. Ứng dụng của Mô hình Tuần tự

Trước khi Transformer ra đời, kiến trúc Seq2Seq (Sequence to Sequence) sử dụng Encoder-Decoder dựa trên LSTM đã thống trị các bài toán:

1.  **Dịch máy (Machine Translation):** Input là 1 chuỗi tiếng Việt $\rightarrow$ Output là 1 chuỗi tiếng Anh.
2.  **Tóm tắt văn bản (Text Summarization):** Input là bài báo dài 1000 từ $\rightarrow$ Output là đoạn tóm tắt 50 từ.
3.  **Nhận dạng giọng nói (Speech Recognition):** Input là chuỗi âm thanh $\rightarrow$ Output là chuỗi văn bản.

---

## 4. Thực hành: Xây dựng Mô hình Text Classification cơ bản bằng PyTorch

Chúng ta sẽ sử dụng thư viện **PyTorch** để định nghĩa một mạng Neural Network đơn giản gồm 1 lớp Embedding (biến từ thành vector) và 1 lớp Tuyến tính (Linear) để phân loại câu.

```python
import torch
import torch.nn as nn

# 1. Định nghĩa Kiến trúc Mạng Nơ-ron
class SimpleTextClassifier(nn.Module):
    def __init__(self, vocab_size, embedding_dim, num_classes):
        super(SimpleTextClassifier, self).__init__()
        
        # Lớp Embedding: Biến số ID của từ thành Vector (vd: dim=16)
        self.embedding = nn.Embedding(num_embeddings=vocab_size, embedding_dim=embedding_dim)
        
        # Lớp Linear: Lớp phân loại cuối cùng
        self.fc = nn.Linear(embedding_dim, num_classes)
        
    def forward(self, text_indices):
        # text_indices có kích thước [batch_size, sequence_length]
        
        # Bước 1: Tra cứu Vector (Word Embeddings)
        # Kích thước: [batch_size, sequence_length, embedding_dim]
        embedded = self.embedding(text_indices)
        
        # Bước 2: Tính trung bình cộng của tất cả các từ trong câu (Global Average Pooling)
        # Kích thước sau pooling: [batch_size, embedding_dim]
        pooled = embedded.mean(dim=1)
        
        # Bước 3: Phân loại
        # Kích thước Output: [batch_size, num_classes]
        output = self.fc(pooled)
        return output

# 2. Khởi tạo mô hình
VOCAB_SIZE = 10000  # Giả sử từ điển có 10,000 từ
EMBEDDING_DIM = 16  # Kích thước vector của mỗi từ
NUM_CLASSES = 2     # Phân loại 2 lớp: Tích cực / Tiêu cực

model = SimpleTextClassifier(VOCAB_SIZE, EMBEDDING_DIM, NUM_CLASSES)
print(model)

# 3. Chạy thử mô hình (Feed forward)
# Giả lập 1 câu gồm 5 từ, các từ được mã hóa thành các con số (Index trong từ điển)
dummy_input = torch.tensor([[104, 55, 301, 8, 492]]) 
predictions = model(dummy_input)

print("\nĐầu ra dự đoán (Raw logits):", predictions)
```

**Output mong đợi:**
```text
SimpleTextClassifier(
  (embedding): Embedding(10000, 16)
  (fc): Linear(in_features=16, out_features=2, bias=True)
)

Đầu ra dự đoán (Raw logits): tensor([[-0.2045,  0.1132]], grad_fn=<AddmmBackward0>)
```
*(Lưu ý: Raw logits chưa qua hàm Softmax nên giá trị có thể âm. Đây là tín hiệu thô trước khi chuyển thành xác suất phần trăm).*

---

## 5. Tổng kết

Trong Module 2, chúng ta đã hiểu được:
1.  **Sức mạnh của Deep Learning**: Cho phép máy tự động học đặc trưng ngôn ngữ thông qua Embeddings.
2.  **Mô hình tuần tự (RNN/LSTM/GRU)**: Được thiết kế riêng cho ngôn ngữ vì khả năng lưu trữ ngữ cảnh từ trái sang phải.
3.  **Hạn chế cốt lõi**: LSTM/GRU học tuần tự nên chậm và khó song song hóa.

Để vượt qua giới hạn tính toán tuần tự này, các nhà khoa học của Google đã tạo ra một "vụ nổ Big Bang" trong thế giới NLP. Đó chính là kiến trúc **Transformer**. Chúng ta sẽ khám phá nó ở **Module 3**.

<br/>

---
*Made by Anh Tu - Share to be share*
