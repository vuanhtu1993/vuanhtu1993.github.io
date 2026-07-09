---
title: "Tùy biến Nâng cao"
source_url: "https://vnstocks.com/docs/vnstock-news/tuy-bien-nang-cao"
crawled_at: "2026-07-09T08:05:44.734Z"
---

Kỹ thuật chuyên sâu

Bộ công cụ nâng cao hỗ trợ truy xuất bộ đếm từ khóa và thiết lập cấu hình bộ đệm lưu trữ truy cập web trung gian. Bạn chỉ nên áp dụng khi có nhu cầu thu thập dữ liệu tự động - phù hợp cho các lập trình viên, chuyên viên khoa học máy tính hoặc nhà phân tích dữ liệu.

## Phân Tích Thông Tin Khái Quát (Trending Keywords)

Thư viện tích hợp mô-đun phân rã chuỗi (tokenizer) để xuất từ vựng định tính theo mức độ xuất hiện. Dưới đây là kiến trúc tham chiếu mô hình thực thi thuật toán thống kê:

Python

```
from vnstock_news.trending.analyzer import TrendingAnalyzer
from vnstock_news.api.enhanced import EnhancedNewsCrawler
import asyncio

async def analyze_trends():
    crawler = EnhancedNewsCrawler(cache_enabled=True)
    # Lấy dữ liệu qua Enhanced Crawler (tự động dọn dẹp HTML)
    articles_df = await crawler.fetch_articles_async(
        sources=["https://cafef.vn/latest-news-sitemap.xml"],
        top_n=50
    )
    
    # Phân tích xu hướng từ khóa
    analyzer = TrendingAnalyzer(min_token_length=3)
    trends = analyzer.extract_keywords(articles_df, top_n=10)
    
    print("Từ Khóa Đặc Trưng Trong Dữ Liệu Hiện Tại:")
    for keyword, count in trends.items():
        print(f"  {keyword:15s} - Tần suất: {count}")

asyncio.run(analyze_trends())
```

## Chế Độ Triển Khai Chuyên Sâu: `EnhancedNewsCrawler`

Các mô hình được sử dụng trong khối lượng công việc thực tế yêu cầu kiến trúc của `EnhancedNewsCrawler` nhằm bổ sung tính linh hoạt:

-   **Lưu trữ Cục Bộ (Cache)**: Khi chạy trong lu kỳ 2 giờ, chức năng bảo toàn phản hồi (HTTP caching) tái sử dụng khối dữ liệu của URL đã lấy trước đó mà không truy xuất API trên máy chủ nguồn, giúp ngăn lỗi từ chối dịch vụ do truy cập quá mức (Rate limits).
-   **Bộ Chuyển Hóa Markdown**: Có khả năng xóa mã nguồn HTML (tham số cấu hình `clean_content=True`) để dữ liệu đầu ra làm việc dễ dàng với các mô hình LLM hiện đại.

## Tùy Biến Lớp Tham Chiếu Hệ Thống CMS Bất Kỳ (Custom Profile)

Hướng dẫn cấu hình nâng cao

Việc tự định nghĩa XPath, Parser hoặc Sitemap Pattern phức tạp đòi hỏi kiến thức về kiến trúc web. Chúng tôi đã xây dựng sẵn **Tài liệu Agent Guide** với vô số cấu trúc mẫu (như `DynamicSitemapResolver`). Hãy cung cấp tài liệu này cho AI Agent của bạn để tự động sinh mã tương thích với trang web mục tiêu!

Python

```
from vnstock_news import Crawler

# Ví dụ cấu hình rút gọn cho một trang báo nội bộ
custom_website_profile = {
    "site_name": "example_tech_site",
    "sitemap": {
        "base_url": "https://example.com/sitemaps/news-",
        "pattern_type": "monthly", # Trợ lý AI có thể cấu hình chi tiết phần này
        "format": "{year}-{month}",
        "extension": "xml"
    },
    "config": {
        "title_selector": {"tag": "h1", "class": "title-detail"},
        "content_selector": {"tag": "article", "class": "fck_detail"},
    }
}

crawler = Crawler(custom_config=custom_website_profile)
```

Tham khảo chi tiết tại thư mục `docs/vnstock_news` trong kho lưu trữ **Agent Guide**.
