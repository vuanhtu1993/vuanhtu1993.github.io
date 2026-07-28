---
title: "Nhận diện khuôn mặt với OpenCV và Deep Learning"
source_url: "https://viblo.asia/p/nhan-dien-khuon-mat-voi-opencv-va-deep-learning-yMnKMzMNZ7P"
crawled_at: "2026-07-21T10:07:29.694Z"
---

[![Avatar](https://res.cloudinary.com/dv3vzmogk/image/upload/v1784628452/aha-mind/docs-crawler/viblo.asia/3745b087-fb00-4c29-9672-233e11638cf6_tp9svb.png)](https://viblo.asia/u/hammiu)

233 10 6

Đã đăng vào thg 6 30, 2021 12:12 CH

7 phút đọc

15.9K

Nhận diện khuôn mặt có rất nhiều ứng dụng hay như chấm công tự động, theo dõi hành vi... Trong bài này chúng ta sẽ đi nhận diện khuôn mặt trong ảnh và video với OpenCV, Python và Deep Learning (thư viện chính là `face_recognition`)

Thư viện `dlib` chứa implementation của "deep learning metric" được sử dụng để xây dựng facial embeddings (cái này sẽ dùng để thực hiện face recognition).

Thư viện `face_recognition` hỗ trợ tốt cho các hàm trong `dlib` giúp chúng ta làm việc dễ hơn. Cài đặt các thư viện như sau:

```
pip install dlib
pip install face_recognition
```

Nên nhớ ở đây chúng ta **sử dụng lại pre-trained model - tạo ra embedding 128 dimensions** chứ không training lại từ đầu (model này đã được train với rất nhiều ảnh rồi).

### Bố cục chung

Project sẽ có một số thư mục như sau:

-   `dataset`: chứa ảnh của mọi người (mỗi người chia vào 1 thư mục). Khi làm thực tế cần thêm **ID** cho mỗi người để kiểm soát trong trường hợp hai hay nhieeuff người trùng tên.
-   `test_images`: chứa ảnh để test (không trùng trong dataset)
-   `output`: lưu video đã đi qua face recognition
-   `videos`: input video
-   Và một số file như
    -   `build_dataset.py` - dùng để tạo dataset
    -   `encode_faces.py` - encoding (128-d vectors) for faces
    -   `recognizer_faces_image.py` - nhận diện khuôn mặt từ ảnh dựa vào encoding của dataset. Chú ý trong file này có phần kiểm tra match (khớp) với các khuôn mặt trong dataset `matches = face_recognition.compare_faces(data["encodings"], encoding, 0.4)` chúng ta có thể thay đổi tham số cuối nếu nhận diện sai (ảnh không có trong data set mà được nhận diện có trong đó).
    -   `recognizer_faces_video.py` - nhận diện khuôn mặt từ video webcam. Code này có thể edit lại một chút để nhận cả video từ file.
    -   `encoding.pickle` - encodings được tạo ra từ `encode_faces.py` sẽ được lưu vào disk thông qua file này

### Bước 1. Tạo dataset

Ở đây chúng ta sử dụng `build_dataset.py` để xây dựng dataset. Trong thư mục `dataset` có chứa các subdirctory cho từng người với tên (+ ID nếu cần), trong mỗi subdirectory lại chứa ảnh khuôn mặt của người đó.

> **Chú ý:** Mỗi ảnh nên chỉ chứa duy nhất 1 khuôn mặt của người đó (nếu có các khuôn mặt của nhiều người, phần implementation bên dưới sẽ phức tạp hơn vì đôi khi phải xác định thêm ai trong bức ảnh)

Ở đây dataset được tạo thông qua webcam. Đưa mặt người đến gần, xa webcam, với các tư thế, biểu cảm khác nhau. Chạy file `build_dataset.py` rồi nhấn phím `k` để lưu ảnh của từng người. Đối với mỗi người nên có ít nhất 10-20 ảnh để mô hình có độ chính xác cao. Trong file này mình không thêm bộ phát hiện khuôn mặt vào ví dụ **Haar cascades** hoặc kẻ khung để người dùng điều chỉnh mặt trong đó. Ở đây mình muốn mô hình nhận được ảnh chứa khuôn mặt với nhiều điều kiện khác nhau để mô hình có thể hoạt động tốt hơn trong thực tế (lưu thêm nhiều ảnh cho nhiều điều kiện).

Ngoài việc tạo dataset thông qua webcam, chúng ta có thể tạo dataset thủ công hoặc sử dụng Search API như Bing hay Google. Sau khi dataset được tạo với `build_dataset.py` chúng ta sẽ chạy `encode_faces.py` để tạo các embeddings.

### Bước 2. Tạo encodings cho các khuôn mặt trong dataset

Sau khi tạo xong dataset chúng ta sẽ đi tạo các encodings (hay embeddings) của các khuôn mặt trong dataset đó. Việc đầu tiên cần làm là đi trích xuất các face ROIs (tránh sử dụng hết cả ảnh vì sẽ có nhiều nhiễu background ảnh hưởng đến chất lượng mô hình). Để phát hiện và trích xuất khuôn mặt có thể sử dụng nhiều phương pháp như haar cascades, HOG + Linear SVM, Deep Learning-bases face detector... Khi có các face ROIs chúng ta sẽ đưa chúng qua mạng NN để lấy các encodings.

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1784628451/aha-mind/docs-crawler/viblo.asia/face_recognition_opencv_embedding_iflqwd.jpg)

_Tạo encoding từ ảnh khuôn mặt_

Ở đây chúng ta không training lại từ đầu mạng tạo encodings mà sử dụng lại pre-trained model (trong thư viện `dlib` và được tích hợp vào `face_recognition` để dễ sử dụng hơn) nhằm tạo ra các face embeddings.

Trong phần này file `encode_faces.py` được chạy để lưu các encodings và names (nếu cần ID thì bổ sung). Các bạn xem thêm file đó để hiểu hơn, mình có chú thích rất rõ từng phần. Các encodings và names được lưu ra file `encodings.pickle`.

### Bước 3. Nhận dạng khuôn mặt trong ảnh

![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1784628452/aha-mind/docs-crawler/viblo.asia/e8b8c4f9-8425-4e0b-aea2-85769dacfd9d_jndo4s.png)

_Ảnh đầu ra sau khi nhận diện_

Sau khi chúng ta đã có các encodings từ datasets (lấy được qua pre-trained model, thông qua dlib và face\_recognition) chúng ta có thể bắt đầu thực hiện face recognition được rồi.

Chạy file `recognize_faces_image.py` để nhận diện khuôn mặt trong ảnh, đối với video thì các bạn chạy file`recognize_faces_video.py`.

Chú ý nếu muốn chạy face recognition trên **CPU** hay các thiết bị nhúng như **Raspberry** thì chọn detection method là `hog` ở file `recognize_faces_image.py`, còn ban đầu khi lấy encodings từ dataset chúng ta vẫn có thể để `cnn` (chạy lâu hơn nhưng chính xác hơn để phát hiện khuôn mặt).

Phần implementaion khá dài, các bạn có thể xem thêm tại [Github-huytranvan2010](https://github.com/huytranvan2010/Face-Recognition-with-OpenCV-Python-DL). Nếu thấy hữu ích hãy nhấn \* cho github của mình và upvote bài viết này.

### Kết luận

Như vậy chúng ta đã thực hiện nhận diện khuôn mặt với OpenCV và Deep Learning. Đây là những phần cơ bản để xây dựng hệ thống chấm công dựa trên nhận diện khuôn mặt. Kết hợp với một số kỹ thuật và công cụ khác như phát hiện người thật (so với ảnh)... chúng ta hoàn toàn có thể xây dựng hệ thống chấm công đơn giản cho riêng mình được.

### Tài liệu tham khảo

1.  [https://github.com/ageitgey/face\_recognition/blob/master/face\_recognition/api.py#L213](https://github.com/ageitgey/face_recognition/blob/master/face_recognition/api.py#L213)
2.  [https://www.pyimagesearch.com/2018/06/18/face-recognition-with-opencv-python-and-deep-learning/](https://www.pyimagesearch.com/2018/06/18/face-recognition-with-opencv-python-and-deep-learning/)

All rights reserved
