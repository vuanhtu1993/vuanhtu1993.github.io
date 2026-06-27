---
sidebar_position: 5
description: "Các phương thức xác thực cho MCP Server: Phân tích 4 lựa chọn bảo mật (Key-based, Entra ID, OAuth OBO, Anonymous) và cách thiết lập an toàn."
tags: [azure-ai, foundry, mcp, authentication, entra, oauth]
---

# Xác Thực (Authentication) Cho MCP Servers

## Agenda

**Thời gian đọc ước tính:** ~15 phút

### Learning outcome:
- **Phân biệt** được Shared Authentication và Individual Authentication trong ngữ cảnh Agent gọi tool.
- **Lựa chọn** được phương thức xác thực (Key-based, Microsoft Entra, OAuth OBO) dựa trên rủi ro bảo mật và yêu cầu ngữ cảnh người dùng.
- **Cấu hình** được OAuth Identity Passthrough để uỷ quyền danh tính người dùng (Per-user auth) cho Agent.
- **Hiểu** cơ chế Consent Request khi Agent yêu cầu quyền truy cập.

---

## Glossary & Vocabulary

**1. Technical Terms (Thuật ngữ kỹ thuật):**

| Term | Vietnamese Meaning & Quick Explain |
| :--- | :--- |
| **Shared Authentication** | Xác thực chia sẻ. Tất cả người dùng của Agent đều xài chung một danh tính (ví dụ: chung 1 API Key) để gọi MCP Server. |
| **Individual Authentication** | Xác thực cá nhân. Mỗi người dùng phải dùng tài khoản riêng của họ để truy cập tool, duy trì user context. |
| **Microsoft Entra** | Dịch vụ quản lý danh tính của Azure (trước đây là Azure AD). Cung cấp cơ chế Managed Identity an toàn không cần secret. |
| **OAuth Identity Passthrough** | Chuyển tiếp danh tính OAuth. Agent yêu cầu người dùng đăng nhập để lấy token, sau đó chuyển token đó cho MCP Server. |
| **Consent Request** | Yêu cầu sự cho phép. Màn hình hiện lên yêu cầu người dùng đồng ý cho Agent quyền truy cập tài khoản của họ. |

**2. Vocabulary Support (Từ vựng học thuật/B1+):**

| Word | Meaning in Context (Nghĩa trong ngữ cảnh) |
| :--- | :--- |
| **Persist (v)** | Duy trì, giữ lại. Ví dụ: *User context persists* — ngữ cảnh của người dùng được duy trì khi gọi API. |
| **Passthrough (n/v)** | Chuyển tiếp xuyên suốt. Token đi qua Agent nhưng Agent không can thiệp, chỉ chuyển thẳng đến server đích. |

---

## 1. WHY — Vấn Đề Bảo Mật Khi Agent Gọi Tool

Khi Agent của bạn kết nối đến một MCP Server (ví dụ: Server đọc email Outlook hoặc truy vấn cơ sở dữ liệu nhân sự), câu hỏi lớn nhất là: **Agent đang truy cập với tư cách là ai?**

Nếu bạn hardcode một Admin API Key vào Agent (Shared Authentication):
- Mọi người dùng chat với Agent đều có thể vô tình hoặc cố ý truy cập toàn bộ cơ sở dữ liệu.
- Rất khó audit xem *ai thực sự* đã yêu cầu Agent thực hiện hành động xóa data.

Đó là lý do Foundry Agent Service cung cấp nhiều cơ chế xác thực MCP, từ việc dùng danh tính của chính hệ thống (Managed Identity) cho đến việc mượn danh tính của người dùng (OAuth OBO).

---

## 2. WHAT — Bốn Phương Thức Xác Thực MCP

Tài liệu Microsoft chia bài toán thành hai nhóm chính: **User context persists** (duy trì danh tính người dùng) và **không**.

| Phương thức | Mô tả ngắn gọn | User context persists? | Use Case khuyên dùng |
| :--- | :--- | :--- | :--- |
| **Key-based** | Dùng API Key / PAT lưu trong Project Connection. | Không | API bên thứ 3 cần API Key chung. |
| **Microsoft Entra (Agent Identity)** | Agent tự lấy token của chính nó để gọi server. | Không | Cần bảo mật cao, không muốn lưu secret. Cấp quyền riêng rẽ cho từng Agent. |
| **Microsoft Entra (Project Identity)**| Agent dùng danh tính của toàn bộ Project. | Không | Mọi Agent trong Project cần quyền truy cập giống nhau. |
| **OAuth Identity Passthrough** | Bắt user phải login, Agent mượn token của user. | Có | Truy cập data cá nhân (Email, OneDrive) của người dùng đó. |
| **Unauthenticated** | Gọi trực tiếp không cần token. | Không | API Public hoặc Private Network (cách ly mạng). |

### 2.1. Key-based Authentication

Phương pháp truyền thống: Bạn có một API Key hoặc Personal Access Token (PAT).
**Nguyên tắc an toàn:**
- Không bao giờ hardcode key vào trong code khai báo tool.
- Phải lưu vào **Project Connection** trong Foundry portal. Agent Service sẽ tự động kéo key này ra và gửi cho MCP Server.
- Tất cả users có quyền truy cập Project đều có thể xài chung key này.

### 2.2. Microsoft Entra (Managed Identity)

Lựa chọn ưu tiên (*"When in doubt, start with Microsoft Entra"*).
Bạn không cần quản lý secret hay lo việc xoay vòng (rotate) token. Azure tự lo.
- **Agent Identity**: Phù hợp khi bạn có nhiều Agent nhưng muốn cấp quyền khác nhau (Agent A chỉ được đọc, Agent B được ghi).
- **Project Managed Identity**: Phù hợp khi mọi Agent trong Project đều cần chung một mức quyền.

### 2.3. OAuth Identity Passthrough (OAuth OBO)

Cơ chế tiên tiến nhất để bảo vệ quyền riêng tư.
Khi người dùng A chat với Agent và yêu cầu "Đọc email mới nhất của tôi", Agent không có quyền. Nó sẽ trả về một `oauth_consent_request` chứa một đường link.

1. Người dùng click vào link, màn hình Microsoft Login hiện ra.
2. Người dùng chọn "Allow" (Đồng ý).
3. OAuth token được tạo và gửi lại cho Agent.
4. Agent dùng token này gọi MCP Server (Outlook). Server biết chính xác đây là người dùng A.

---

## 3. HOW — Cấu hình OAuth Identity Passthrough

Nếu MCP Server của bạn dùng Microsoft Entra ID làm hệ thống xác thực (ví dụ truy cập Outlook, SharePoint), bạn phải setup **Custom OAuth**:

**Các tham số bắt buộc theo chuẩn OAuth 2.0:**
- **Client ID**: ID của ứng dụng Microsoft Entra bạn đã tạo.
- **Auth URL**: `https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/authorize`
- **Token URL**: `https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token`
- **Refresh URL**: Trùng với Token URL.
- **Scopes**: Cách nhau bởi khoảng trắng (single space, không dùng dấu phẩy). Ví dụ: `McpServers.Mail.All offline_access`.

> **[!IMPORTANT] Bắt buộc dùng `offline_access`**
> Luôn thêm scope `offline_access` để Agent tự động làm mới (auto refresh) token khi hết hạn, tránh việc người dùng bị hỏi lại liên tục.

**Xử lý trong Code (Flow xin quyền):**

Khi gọi `openai.responses.create()`, nếu tool yêu cầu auth, Agent sẽ không trả lời ngay mà ném ra một Output Item đặc biệt.

```json
{
    "type": "oauth_consent_request",
    "id": "oauthreq_123abc...",
    "consent_link": "https://logic-swedencentral-001.consent.azure-apihub.net/login?data=xxxx"
}
```

Ứng dụng của bạn (Frontend) phải hiển thị `consent_link` này cho User.
Ví dụ màn hình hiển thị yêu cầu cấp quyền:

![Consent Dialog](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782559635/aha-mind/docs-crawler/learn.microsoft.com/foundry-open-consent_zuv7ck.png)

Sau khi User click và cấp quyền xong, một màn hình xác nhận sẽ hiện ra:

![Confirmation Dialog](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782559635/aha-mind/docs-crawler/learn.microsoft.com/foundry-close-me_rzhh9i.png)

Sau đó, ứng dụng của bạn phải **gọi lại Agent** với `previous_response_id` để Agent tiếp tục công việc đang dang dở.

---

## 4. WHAT IF — Troubleshoot Lỗi Xác Thực

| Triệu chứng Lỗi | Nguyên nhân có thể | Cách xử lý |
| :--- | :--- | :--- |
| **Không sinh ra `oauth_consent_request`** | Cấu hình sai Connection hoặc Agent chưa thực sự gọi MCP Tool. | Kiểm tra Project Connection xem đã chọn OAuth chưa. Thử ép Agent gọi tool bằng `tool_choice="required"`. |
| **Consent xong nhưng Tool vẫn lỗi** | Người dùng (user) bị thiếu quyền ở underlying service. | Đảm bảo user thực sự có quyền truy cập data đó ở hệ thống gốc, và user đó có role ít nhất là *Foundry User* trong project. |
| **"Your session has expired. Please reauthenticate..."** | Token hết hạn và không thể tự refresh. | Thiếu scope `offline_access` trong cấu hình OAuth, hoặc Refresh URL bị sai cấu hình. |
| **"Cannot pass Microsoft token to untrusted MCP endpoint"** | Tính năng Managed OAuth chặn việc gửi token nội bộ của Microsoft ra ngoài server bên thứ ba. | Phải dùng **Custom OAuth** (tự tạo App Registration riêng) để tự quản lý audience. |

---

## Discussion Questions

1. Bạn triển khai một Agent tra cứu chính sách công ty (HR Policy). CSDL HR cung cấp API không cần xác thực nhưng nằm trong mạng nội bộ (Virtual Network). Bạn nên cấu hình Authentication method nào cho MCP Server này?
2. Tại sao Microsoft cảnh báo lỗi khi dùng **Managed OAuth** để gửi token cho một Custom MCP Server không thuộc Microsoft? Quy tắc bảo mật nào đang được áp dụng ở đây?

---

## References

- **Set Up MCP Server Authentication:** [Microsoft Learn](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/mcp-authentication)

---
*Made by Anh Tu - Share to be share*
