---
sidebar_position: 6
description: "Hướng dẫn thực hành tích hợp Remote MCP Server vào Azure AI Agent bằng Python SDK, đi sâu vào cấu hình Approval Policy và xử lý Approval Request."
tags: [azure-ai, foundry, mcp, mcp-tool, python-sdk, approval-policy]
---

# Tích Hợp MCP Vào Foundry Agents

## Agenda

**Thời gian đọc ước tính:** ~15 phút

### Learning outcome:
- **Khai báo** được một `MCPTool` bằng Python SDK với đầy đủ `server_label`, `server_url` và `project_connection_id`.
- **Cấu hình** được chính sách phê duyệt (Approval Policy) qua tham số `require_approval` cho từng ngữ cảnh cụ thể.
- **Xử lý** được `mcp_approval_request` trong vòng lặp đàm thoại của Agent và gửi `McpApprovalResponse`.
- **Áp dụng** được nguyên tắc Least Privilege thông qua cơ chế `allowed_tools`.

---

## Glossary & Vocabulary

**1. Technical Terms (Thuật ngữ kỹ thuật):**

| Term | Vietnamese Meaning & Quick Explain |
| :--- | :--- |
| **Approval Policy** | Chính sách phê duyệt. Cấu hình xác định việc Agent có cần sự cho phép của con người (Human-in-the-loop) trước khi gọi một công cụ hay không. |
| **mcp_approval_request** | Yêu cầu phê duyệt. Loại dữ liệu Agent trả về khi nó cần gọi một tool có cấu hình phải xin phép. |
| **McpApprovalResponse** | Phản hồi phê duyệt. Gói dữ liệu ứng dụng gửi lại Agent mang theo quyết định (approve=True/False) của con người. |
| **allowed_tools** | Danh sách công cụ được phép. Khái niệm giới hạn Agent chỉ được thấy và gọi một số ít công cụ nhất định trong toàn bộ MCP Server. |

**2. Vocabulary Support (Từ vựng học thuật/B1+):**

| Word | Meaning in Context (Nghĩa trong ngữ cảnh) |
| :--- | :--- |
| **Intercept (v)** | Chặn lại (ở giữa). Chặn luồng thực thi của Agent để chờ con người phê duyệt. |
| **Gracefully (adv)** | Một cách mượt mà/chỉnh chu. Xử lý lỗi một cách an toàn mà không làm sập toàn bộ hệ thống (Graceful error handling). |

---

## 1. WHY — Tại Sao MCP Tool Lại Khác Biệt?

Khác với Function Calling (nơi code thực thi nằm ngay trong ứng dụng của bạn), **MCP Server là một hộp đen từ bên ngoài**. Agent kết nối với MCP Server qua mạng (internet hoặc VNet), và thao tác có thể là đọc/ghi dữ liệu nhạy cảm (ví dụ: tạo Ticket, xóa Database, đọc Email).

Việc phó mặc hoàn toàn quyền quyết định cho mô hình ngôn ngữ (LLM) mang lại rủi ro rất cao. Do đó, Foundry thiết kế hai cơ chế phòng thủ riêng cho MCP Tool:
1. **Approval Policy:** Tính năng *Human-in-the-loop* — con người phải duyệt trước khi tool được chạy.
2. **Allowed Tools:** Agent chỉ nhìn thấy những công cụ cần thiết, hạn chế bề mặt tấn công.

---

## 2. WHAT — Cấu Trúc Khai Báo MCPTool

Trong Azure AI Projects Python SDK, một MCP Tool được định nghĩa qua class `MCPTool` với các tham số bắt buộc và tuỳ chọn sau:

```python
tool = MCPTool(
    server_label="github", # Định danh duy nhất cho server này
    server_url="https://api.githubcopilot.com/mcp", # Endpoint của server
    project_connection_id="my-github-connection", # Chuỗi định danh kết nối (chứa secret)
    require_approval="always", # Chính sách phê duyệt
)
```

**Definition Anatomy của `require_approval`**:
Tham số này hỗ trợ cú pháp linh hoạt (Fine-grained control):
- `"always"` (Mặc định): Mọi tool call đều bị chặn lại chờ phê duyệt.
- `"never"`: Không cần phê duyệt, chạy tự động hoàn toàn.
- `{"never": ["get_user", "search_repo"]}`: Chỉ chạy tự động 2 tool đọc này, còn lại chặn chờ phê duyệt.
- `{"always": ["delete_repo"]}`: Chạy tự động tất cả, CHỈ yêu cầu phê duyệt khi gặp tool xóa.

---

## 3. HOW — Vòng Lặp Xử Lý MCP Tool Trong Code

Hãy xem một đoạn code mẫu xử lý việc tích hợp MCP Tool và quản lý luồng phê duyệt thủ công:

```python
# filename: mcp_agent_approval.py
import json
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition, MCPTool
from openai.types.responses.response_input_param import McpApprovalResponse

project = AIProjectClient(
    endpoint="your_project_endpoint",
    credential=DefaultAzureCredential(),
)
openai = project.get_openai_client()

# Bước 1: Khai báo MCP Tool yêu cầu phê duyệt luôn luôn
mcp_tool = MCPTool(
    server_label="api-specs",
    server_url="https://api.githubcopilot.com/mcp",
    require_approval="always",
    project_connection_id="my-mcp-connection",
)

agent = project.agents.create_version(
    agent_name="GitHubAgent",
    definition=PromptAgentDefinition(
        model="gpt-4.1-mini",
        instructions="Use MCP tools as needed",
        tools=[mcp_tool],
    ),
)

# Bước 2: Bắt đầu hội thoại
conversation = openai.conversations.create()
response = openai.responses.create(
    conversation=conversation.id,
    input="What is my username in my GitHub profile?",
    extra_body={"agent_reference": {"name": agent.name, "type": "agent_reference"}},
)

# Bước 3: Quét qua response.output để tìm yêu cầu phê duyệt
input_list = []
for item in response.output:
    if item.type == "mcp_approval_request" and item.id:
        print(f"MCP Approval Requested!")
        print(f"  Server: {item.server_label}")
        print(f"  Tool: {getattr(item, 'name', '<unknown>')}")
        print(f"  Arguments: {json.dumps(getattr(item, 'arguments', None), indent=2)}")

        # Trong thực tế, bạn sẽ build UI (popup/modal) để user bấm Yes/No
        user_choice = input("Approve this MCP tool call? (y/N): ").strip().lower()
        should_approve = (user_choice == "y")
        
        # Đóng gói quyết định vào McpApprovalResponse
        input_list.append(
            McpApprovalResponse(
                type="mcp_approval_response",
                approve=should_approve,
                approval_request_id=item.id,
            )
        )

# Bước 4: Gửi quyết định phê duyệt lại cho Agent
if input_list:
    response = openai.responses.create(
        input=input_list,
        previous_response_id=response.id, # Bắt buộc phải có để Agent nối tiếp ngữ cảnh
        extra_body={"agent_reference": {"name": agent.name, "type": "agent_reference"}},
    )

print(f"Final Response: {response.output_text}")

project.agents.delete_version(agent_name=agent.name, agent_version=agent.version)
```

**Chi tiết kỹ thuật quan trọng:**
Ở Bước 4, bạn gọi `responses.create` với mảng `input` chứa kết quả approve/deny, và **BẮT BUỘC** truyền thêm `previous_response_id=response.id`. Đây là cách hệ thống biết bạn đang trả lời cho luồng bị gián đoạn nào.

---

## 4. WHAT IF — Quản Lý Rủi Ro Với `allowed_tools`

**Tình huống:** Một MCP Server của bộ phận IT có 50 công cụ (Tools), bao gồm cả `reboot_server` và `create_ticket`. Nếu bạn không chặn, LLM có thể bị "ảo giác" (hallucinate) và quyết định reboot server thay vì tạo ticket.

**Giải pháp:**
Tài liệu Microsoft nhấn mạnh: *Use an allow list of tools by using `allowed_tools`.*
Khi bạn thêm MCP Tool qua giao diện portal (Add Tools catalog), việc bạn tích chọn một số tool cụ thể chính là hành động tạo `allowed_tools`.
Trong code, bạn hoàn toàn có thể giới hạn Agent chỉ nhìn thấy tool `create_ticket`. Mọi lệnh gọi ngoài danh sách này sẽ bị từ chối ngay từ cấp độ Agent Framework.

---

## Discussion Questions

1. Nếu người dùng (User) từ chối phê duyệt (Nhập "N" ở đoạn mã Bước 3), đối tượng `McpApprovalResponse` sẽ có thuộc tính `approve=False`. LLM (Agent) sẽ phản ứng thế nào khi nhận được kết quả False này? Bạn có cần lập trình xử lý lỗi đó (try/catch) trong vòng lặp không?
2. Sự khác biệt về kiến trúc giữa `require_approval` của MCP và logic Human-in-the-loop đối với Function Calling truyền thống là gì? (Gợi ý: Ai là người tạm ngưng — LLM hay hệ thống trung gian?)

---

## References

- **Connect to Model Context Protocol servers:** [Microsoft Learn](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/model-context-protocol)
- **Best practices for using tools:** [Microsoft Learn](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-best-practice)

---
*Made by Anh Tu - Share to be share*
