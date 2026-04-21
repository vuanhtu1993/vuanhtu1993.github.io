# 📡 Aha! Mind — Data Sources Registry
> Domain: **Tech (JavaScript / AI / AI Agents)**
> Cập nhật: 2026-04-20
> Mục tiêu: Nguồn dữ liệu cho pipeline crawl tự động, ưu tiên RSS/Atom feed hoặc Public API, nội dung tiếng Anh chất lượng cao (C1+)

---

## 🏆 Tier 1 — Primary Sources (Must-have)
> Nội dung chất lượng cao, cập nhật thường xuyên, ổn định, có RSS feed

| # | Tên nguồn | URL | RSS Feed | Nội dung chính | Ghi chú |
|---|-----------|-----|----------|----------------|---------|
| 1 | **The Pragmatic Engineer** | https://blog.pragmaticengineer.com | `https://blog.pragmaticengineer.com/rss/` | Architecture, Engineering Culture, AI | Trả phí, nhưng nhiều bài free |
| 2 | **Hacker News (Top)** | https://news.ycombinator.com | `https://hnrss.org/frontpage` | Community-curated: JS, AI, Infra | Dùng HN Algolia API để filter |
| 3 | **Dev.to** | https://dev.to | `https://dev.to/feed/tag/javascript` | JavaScript, AI, Web Dev | Free RSS theo tag |
| 4 | **Medium - Towards Data Science** | https://towardsdatascience.com | `https://medium.com/feed/towards-data-science` | AI/ML, Data Engineering | Cần filter bài chất lượng |
| 5 | **InfoQ** | https://www.infoq.com | `https://feed.infoq.com/` | Architecture, AI, DevOps | Chuyên sâu, enterprise-level |
| 6 | **The Verge (Tech)** | https://www.theverge.com | `https://www.theverge.com/rss/index.xml` | Tech News, AI announcements | Breaking news, industry updates |

---

## 🥈 Tier 2 — Secondary Sources (Nice-to-have)
> Nội dung chuyên sâu hơn, cập nhật ít thường xuyên hơn hoặc cần API key

| # | Tên nguồn | URL | RSS/API | Nội dung chính | Ghi chú |
|---|-----------|-----|---------|----------------|---------|
| 7 | **JavaScript Weekly** | https://javascriptweekly.com | `https://cprss.s3.amazonaws.com/javascriptweekly.com.xml` | JS ecosystem, frameworks | Newsletter dạng curated digest |
| 8 | **Node Weekly** | https://nodeweekly.com | `https://cprss.s3.amazonaws.com/nodeweekly.com.xml` | Node.js ecosystem | Cùng nhóm với JS Weekly |
| 9 | **AI Weekly** | https://aiweekly.co | RSS (check site) | AI research, agents | Tổng hợp AI news |
| 10 | **Google Tech Blog** | https://developers.googleblog.com | `https://developers.googleblog.com/feeds/posts/default` | AI, Web, Chrome, Firebase | Official từ Google |
| 11 | **Smashing Magazine** | https://www.smashingmagazine.com | `https://www.smashingmagazine.com/feed/` | Frontend, UX, CSS, JS | Longform, chất lượng cao |
| 12 | **CSS-Tricks** | https://css-tricks.com | `https://css-tricks.com/feed/` | Frontend, CSS, JS | Chuyên sâu frontend |
| 13 | **LogRocket Blog** | https://blog.logrocket.com | `https://blog.logrocket.com/feed/` | React, Node, Performance | Tutorial-heavy, practical |

---

## 🤖 Tier 3 — AI / Agent Specialist Sources
> Focus đặc biệt vào AI Agents, LLMs, AI Engineering

| # | Tên nguồn | URL | RSS/API | Nội dung chính | Ghi chú |
|---|-----------|-----|---------|----------------|---------|
| 14 | **Anthropic Blog** | https://www.anthropic.com/blog | RSS (check site) | Claude, AI Safety, Agents | Official từ Anthropic |
| 15 | **OpenAI Blog** | https://openai.com/blog | `https://openai.com/blog/rss.xml` | GPT, AI research, API updates | Official từ OpenAI |
| 16 | **LangChain Blog** | https://blog.langchain.dev | `https://blog.langchain.dev/rss/` | LangGraph, RAG, Agents | Rất phù hợp với Aha! Mind |
| 17 | **Hugging Face Blog** | https://huggingface.co/blog | `https://huggingface.co/blog/feed.xml` | Open-source models, AI | Community + research |
| 18 | **AI Alignment Forum** | https://www.alignmentforum.org | `https://www.alignmentforum.org/feed.xml` | AI safety, deep theory | C2 vocabulary, very dense |
| 19 | **The AI Edge** (Newsletter) | https://newsletter.theaiedge.io | Check substack RSS | Practical AI engineering | Substack-based |
| 20 | **Interconnects** | https://www.interconnects.ai | `https://www.interconnects.ai/feed` | LLM internals, AI research | Highly technical |

---

## 📦 Tier 4 — API-Based Sources (Cần API Key)
> Cần đăng ký API, nhưng cho phép search/filter mạnh hơn RSS

| # | Tên nguồn | API Endpoint | Cost | Nội dung chính | Ghi chú |
|---|-----------|-------------|------|----------------|---------|
| 21 | **NewsAPI** | `https://newsapi.org/v2/everything?q=AI+agent` | Free tier: 100 req/day | Tổng hợp từ 80,000+ nguồn | Dễ filter theo keyword |
| 22 | **HN Algolia API** | `https://hn.algolia.com/api/v1/search?tags=story&query=AI` | Free | Hacker News search | Best cho HN content |
| 23 | **GitHub Trending API** | `https://github.com/trending` (unofficial) | Free | Trending repos: JS, AI, Python | Dùng `github-trending-api` package |
| 24 | **Reddit API (r/programming)** | `https://www.reddit.com/r/programming.json` | Free (rate limited) | Community discussion, news | r/javascript, r/MachineLearning |

---

## 🔔 Community & Newsletter Sources (Manual Curation)
> Phù hợp cho giai đoạn "Human-assisted" MVP

| # | Tên nguồn | Link | Tần suất | Ghi chú |
|---|-----------|------|----------|---------|
| 25 | **TLDR Newsletter** | https://tldr.tech | Daily | AI, Tech digest cực ngắn gọn |
| 26 | **ByteByteGo Newsletter** | https://blog.bytebytego.com | Weekly | System Design, Architecture |
| 27 | **Software Lead Weekly** | https://softwareleadweekly.com | Weekly | Engineering leadership |
| 28 | **Import AI** | https://jack-clark.net | Weekly | AI research digest (kỹ thuật) |

---

## 📊 Prioritization Matrix (cho MVP)

```
               CHẤT LƯỢNG NỘI DUNG
               Thấp          Cao
              ┌─────────────┬─────────────┐
  KHÓ        │  Tier 4     │  Tier 3     │
  CRAWL      │  (API phức) │  (AI blogs) │
              ├─────────────┼─────────────┤
  DỄ         │  Tier 2     │  TIER 1 ⭐  │
  CRAWL      │  (Nice2have)│  (Start đây)│
              └─────────────┴─────────────┘
```

### 🎯 MVP Recommendation: Bắt đầu với 3 nguồn

1. **Hacker News** (via `hnrss.org/frontpage`) — Volume lớn, diverse topics
2. **Dev.to** (`/feed/tag/javascript` + `/feed/tag/ai`) — Structured, free, high quality
3. **LangChain Blog** RSS — Perfectly aligned với domain AI Agents

---

## 🔧 Cấu hình bộ lọc (Filter Config)

```yaml
# aha-mind-filter.yaml
content_filters:
  languages: ["en"]
  min_reading_time: 3    # minutes (loại bỏ bài quá ngắn)
  max_reading_time: 20   # minutes (loại bỏ bài quá dài)
  
  keywords_include:      # Ít nhất 1 trong số này phải xuất hiện
    - "JavaScript"
    - "TypeScript" 
    - "React"
    - "Next.js"
    - "AI agent"
    - "LLM"
    - "RAG"
    - "LangGraph"
    - "Node.js"
    
  keywords_exclude:      # Loại bỏ nếu có những từ này
    - "sponsored"
    - "advertisement"
    - "press release"
    
cefr_thresholds:
  min_c1_terms_per_article: 5   # Ít nhất 5 từ C1+ thì bài đó mới xứng đáng
  max_terms_to_annotate: 15     # Giới hạn annotation để không overwhelm người đọc
```

---

## 📅 Crawl Schedule Recommendation

| Nguồn | Tần suất crawl | Lý do |
|-------|---------------|-------|
| Hacker News | Mỗi 6h | Nội dung vote lên nhanh |
| Dev.to | 1 lần/ngày (7AM) | Bài mới published daily |
| LangChain Blog | 1 lần/ngày | Ít bài hơn nhưng chất lượng |
| NewsAPI | 1 lần/ngày | Rate limit free tier |

---

*Made by Anh Tu - Share to be share*
