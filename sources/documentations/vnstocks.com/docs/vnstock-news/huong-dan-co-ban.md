---
title: "Hướng dẫn Cơ bản"
source_url: "https://vnstocks.com/docs/vnstock-news/huong-dan-co-ban"
crawled_at: "2026-07-09T08:05:37.710Z"
---

Phương pháp sử dụng

Do tính chất đặc thù của quy trình xây dựng công cụ phần mềm, bạn được khuyến khích áp dụng tư duy **Trí tuệ nhân tạo làm trung tâm (AI-first)**. Các tham số được ghi chú trong văn bản chỉ để hỗ trợ nhận diện các thành phần kỹ thuật; hãy sử dụng tài liệu Agent Guide để hỗ trợ công cụ giao tiếp AI Agent lập trình thay vì thực hiện theo phương thức cũ.

## `Crawler` - Theo dõi tin tức qua RSS Feeds

Thành phần `Crawler` đóng vai trò giao thức gốc phục vụ nhóm người dùng theo dõi và giám sát tin tức thời sự (theo thời gian thực). Lớp thiết lập này gọi đường truyền RSS của cấu trúc báo:

Python

```
from vnstock_news import Crawler

# Khởi tạo tiến trình đối với nhà xuất bản VnExpress
crawler = Crawler(site_name="vnexpress")

# Yêu cầu xuất 20 bài báo từ tuyến cung cấp dữ liệu mới nhất
articles = crawler.get_articles_from_feed(limit_per_feed=20) 

for a in articles:
    print(f"Dữ liệu tiêu đề: {a['title']}")
```

## `BatchCrawler` - Thu thập đồng bộ dữ liệu quá khứ

Đối chiếu với nhu cầu truy xuất lưu lượng lớn báo cáo lịch sử của một tổ chức thông tin thông qua sơ đồ `Sitemap`, việc quản lý khối lượng yêu cầu kết nối không thể bỏ sót. `BatchCrawler` xử lý tiến trình tuyến tính đồng bộ:

Python

```
from vnstock_news import BatchCrawler

# Tham số request_delay ấn định thời gian chờ giữa phân mảnh yêu cầu URL
crawler = BatchCrawler(site_name="cafef", request_delay=1.0)
articles_df = crawler.fetch_articles(limit=100)

print(f"Tổng số văn bản trích xuất: {len(articles_df)}")
```

## `AsyncBatchCrawler` - Thu thập bất đồng bộ dữ liệu khối lượng cao

Đối với dữ liệu dành cho môi trường đào tạo mô hình ngôn ngữ lớn liên quan đến hàng nghìn văn bản, mô hình chạy luồng đa quy trình `AsyncBatchCrawler` mang lại thời gian tiếp nhận dữ liệu rút ngắn nhưng phụ thuộc vào thông lượng (network bandwidth). Cần cẩn trọng tham số này để không vi phạm quy chuẩn thu thập.

Lưu ý: Yêu cầu định vị rõ sitemap URL cho hệ thống định dạng dữ liệu (Parser).

Python

```
import asyncio
from vnstock_news import AsyncBatchCrawler

async def data_pipeline_async():
    # Phân luồng tối đa với thông số độ trễ tự do
    crawler = AsyncBatchCrawler(site_name="cafef", max_concurrency=5)
    
    # Định dạng điểm cung cấp Sitemap XML
    target_sitemap_url = "https://cafef.vn/latest-news-sitemap.xml"
    articles_df = await crawler.fetch_articles_async(
        sources=[target_sitemap_url],
        top_n=1000
    )
    return articles_df

# Vận hành bất đồng bộ
df = asyncio.run(data_pipeline_async())
print(f"Văn bản được biên dịch thành công: {len(df)}")
```

## Cấu trúc từ điển văn bản

`vnstock_news` thiết chuẩn hóa cấu trúc báo cáo bằng dạng Pandas DataFrame với định nghĩa trường thống nhất trên toàn lưới web Việt Nam:

-   `url`: Liên kết nguồn
-   `title`: Tiểu dẫn tiêu đề
-   `short_description`: Tổng quan ban đầu
-   `content`: Chi tiết tài liệu sau thanh lọc HTML (bình dạng Markdown)
-   `publish_time`: Năm xuất bản thời điểm thực tế
-   `author`: Định danh tác giả
-   `category`: Phân mảng
-   `image_url`: Hình ảnh thu nhỏ

Tất cả báo cáo sau tải xuống sử dụng định dạng quy chuẩn để áp dụng tự động hóa lưu kho và trích lục phục vụ máy học.
