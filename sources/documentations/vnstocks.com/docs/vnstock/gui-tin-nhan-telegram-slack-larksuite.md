---
title: "Gửi tin nhắn Telegram, Lark, Slack"
source_url: "https://vnstocks.com/docs/vnstock/gui-tin-nhan-telegram-slack-larksuite"
crawled_at: "2026-07-09T08:00:16.575Z"
---

Trong vnstock, bạn sẽ sử dụng Messenger class để thực hiện việc gửi các loại tin nhắn đến nền tảng được hỗ trợ. Cấu hình class này như sau:

Trong đó:

-   platform (str): tên của nền tảng nhắn tin bạn chọn, nhận các giá trị là `telegram`, `slack` và `lark`
-   channel (str): tên hoặc mã nhận dạng của kênh trong nền tảng nhắn tin. Ví dụ `#news_update` cho tên kênh Slack, `-1001439492355` cho mã của nhóm nhận tin nhắn trong Telegram, để None nếu bạn chọn nền tảng là Lark.
-   token\_key: là mã bảo mật của API sử dụng cho app nhắn tin bạn chọn theo từng nền tảng. Đối với Lark thì đây là mã id của webhook URL.

Tiếp theo, hàm `send_message` sẽ được sử dụng chung cho tất cả các nền tảng nhắn tin dù bạn gửi tin nhắn văn bản hay kèm hình ảnh.

Cụ thể, thông số thiết lập gồm: - message (str, bắt buộc): Nội dung tin nhắn bạn muốn gửi qua bot - file\_path (str, tuỳ chọn): Đường dẫn file trên máy tính. Nếu sử dụng trên máy tính Windows, lưu ý đặt chữ `r` phía trước, ví dụ `r'path/to_your_image_file.png'` - title (str, tuỳ chọn): tiêu đề ảnh/file nếu bạn gửi tin nhắn trong Slack khi có kèm file.

Kết quả trả về dưới dạng JSON từ server phản hồi. Cụ thể việc tạo và thiết lập bot cho từng nền tảng, bạn có thể tham khảo hướng dẫn bên dưới.

## Gửi tin nhắn Telegram

Tạo Telegram bot đầu tay là một quá trình tương đối đơn giản, bạn có thể thực hiện toàn bộ các công đoạn để có thể gửi được tin nhắn trong chưa đầy 15 phút.

### 1\. Tạo bot với BotFather

1.  Nếu bạn không muốn sử dụng bot chung với tài khoản Telegram hiện có vì lý do bảo mật thì cần bắt đầu tạo tài khoản mới với App Telegram trên Smartphone trước khi bắt đầu. Trong giao diện nhắn tin, tìm kiếm BotFather và thao tác như hình dưới.
2.  Đăng nhập [telgram web](https://web.telegram.org/) để tạo và thiết lập bot.
3.  Copy đoạn token và lưu giữ cẩn thận để bảo mật.

![Telegram botfather tạo bot](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783584014/aha-mind/docs-crawler/vnstocks.com/telegram_botfather_tao_bot_vnstock_wh3uo1.png)Telegram botfather tạo bot

### 2\. Thiết lập thông tin bot

Bước này chỉ đơn giản là cập nhật ảnh đại diện và mô tả của bot để dễ phân biệt với tài khoản thông thường.

![Thông tin Telegram bot và thiết lập](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783584014/aha-mind/docs-crawler/vnstocks.com/thong_tin_telegram_bot_va_thiet_lap_vnstock_bdwdpp.png)Thông tin Telegram bot và thiết lập

### 3\. Gửi tin nhắn

1.  Copy ID của nhóm chat để sử dụng cho hàm gửi tin nhắn.
2.  Sử dụng đoạn code do vnstock cung cấp để gửi tin nhắn
3.  Tận hưởng thành quả: tin nhắn gửi từ API thành công

![Code vnstock telegram bot](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783584014/aha-mind/docs-crawler/vnstocks.com/code_vnstock_telegram_bot_vnstock_b3kyms.png)Code vnstock telegram bot ![ID nhóm chat telegram](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783584014/aha-mind/docs-crawler/vnstocks.com/id_nhom_chat_telegram_vnstock_tin_nhan_thanh_cong_vnstock_nc6eqa.png)ID nhóm chat telegram

## Gửi tin nhắn Lark BotBuilder

[Lark BotBuilder](https://botbuilder.larksuite.com/home) là một công cụ cho phép xây dựng các luồng tự động hoá công việc (automated workflows) trong bộ ứng dụng văn phòng [LarkSuite](https://www.larksuite.com/). Bạn có thể gửi tin nhắn vào Webhook của 1 app bất kỳ tạo ra bởi BotBuilder một cách an toàn và bảo mật. Việc cài đặt 1 luồng công việc tự động với BotBuilder cũng tương đối đơn giản và linh hoạt theo hướng dẫn dưới đây. Ngoài việc dùng BotBuilder để gửi tin nhắn Lark, bạn còn có thể kích hoạt bot để gọi API và thực hiện nhiều luồng công việc khác nhau sử dụng các ứng dụng trong nền tảng Larksuite, bạn hãy khám phá thêm các ứng dụng thú vị cho riêng mình.

### 1\. Tạo App

Truy cập trang web [Botbuilder](https://botbuilder.larksuite.com/home) và tạo cho bạn 1 app đầu tay. Sau khi đặt tên Bot và bấm Create, bạn sẽ được đưa đến màn hình tiếp theo tại mục Flow Design, chọn Create để tiếp tục.

![Lark tạo app botbuilder](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783584015/aha-mind/docs-crawler/vnstocks.com/lark_tao_app_botbuilder_mclzvv.png)Lark tạo app botbuilder

### 2\. Chọn Trigger

Tại màn hình tiếp lập `flow`, chọn Webhook Trigger để kích hoạt luồng tác vụ tự động.

![Lark chọn webhook trigger](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783584014/aha-mind/docs-crawler/vnstocks.com/lark_chon_webhook_triggger_hg2hhx.png)Lark chọn webhook trigger

### 3\. Copy URL

Copy Webhook URL để sử dụng, tách riêng phần ID của url này để sử dụng với hàm nhắn tin từ Vnstock.

![Lark copy webhook url](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783584014/aha-mind/docs-crawler/vnstocks.com/lark_copy_webhook_url_io8nwz.png)Lark copy webhook url

### 4\. Thiết lập nhắn tin

Bạn cần thiết lập hành động gửi tin nhắn tới cá nhân hoặc nhóm cụ thể trong tổ chức sau khi bot nhận được thông tin dạng JSON từ Webhook.

![Lark chọn hành động gửi tin nhắn](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783584013/aha-mind/docs-crawler/vnstocks.com/lark_chon_hanh_dong_gui_tin_nhan_tu_webhook_vszoto.png)Lark chọn hành động gửi tin nhắn

### 5\. Định dạng

Cuối cùng, bạn thiết lập định dạng và cách thức hiển thị của tin nhắn sẽ được gửi đi khi bot được kích hoạt bằng Webhook. Sau khi hoàn tất thiết lập, bạn có thể chọn nút Enable sau đó đặt tên `flow` để kích hoạt bot.

![Lark gửi tin nhắn từ webhook](https://res.cloudinary.com/dv3vzmogk/image/upload/v1783584014/aha-mind/docs-crawler/vnstocks.com/lark_gui_tin_nhan_tu_webhook_opnd9m.png)Lark gửi tin nhắn từ webhook

## Gửi tin nhắn Slack

Tham khảo hướng dẫn gửi tin nhắn Slack từ tài liệu API chính thức [tại đây](https://api.slack.com/messaging/sending)
