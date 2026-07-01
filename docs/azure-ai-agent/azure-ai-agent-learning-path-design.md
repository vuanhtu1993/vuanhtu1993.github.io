# Design Spec: Bộ Học Liệu "Azure AI Agent"

## Tóm tắt dự án

Xây dựng bộ học liệu kỹ thuật chuyên sâu về **Azure AI Agent / Microsoft Foundry Agent Service** dưới dạng **Docs** trong Docusaurus, theo chuẩn sư phạm 4MAT, phục vụ đối tượng Intern/Junior Developer muốn học hệ sinh thái Azure AI.

**Nguồn tài liệu:** `sources/documentations/learn.microsoft.com/en-us/azure/foundry/agents/`

- `overview.md` (17KB)
- `concepts/` — 25 files (agent identity, tools, workflows, memory, RAG, MCP, v.v.)
- `how-to/` — 45+ files (deploy, configure, debug, MCP auth, memory, VS Code, M365, v.v.)
- `quickstarts/` — 9 files

---

## Quyết định thiết kế

| Hạng mục    | Quyết định                                                                |
| ------------- | ---------------------------------------------------------------------------- |
| Output format | `docs/` — Docusaurus Docs với sidebar navigation                         |
| Cấu trúc    | Tiered Category (nhóm theo chủ đề)                                       |
| Đối tượng | Intern/Junior Developer                                                      |
| Phong cách   | Giảng dạy thuần túy — Concept, Diagram, Analogy                         |
| Template      | Sử dụng skill`create-tech-lecture` (4MAT: Why → What → How → What if) |
| Diagrams      | Mermaid bắt buộc tại mỗi bước flow/architecture                        |
| Glossary      | Bảng thuật ngữ đầu mỗi bài                                            |
| Độ dài     | 2.000–4.000 từ/bài, 15-20 phút đọc                                     |
| Footer        | "Made by Anh Tu - Share to be share"                                         |

---

## Cấu trúc thư mục Docs

```
docs/
└── azure-ai-agent/
    ├── index.md                              ← Landing page: "Lộ trình học Azure AI Agent"
    │
    ├── 01-foundations/                       ← Category: Nền tảng (Module 1)
    │   ├── index.md
    │   ├── what-is-ai-agent.md
    │   ├── microsoft-foundry.md
    │   ├── development-approaches.md
    │   ├── first-agent-foundry.md
    │   ├── vscode-setup.md
    │   ├── agent-tools-overview.md
    │   └── deploy-integrate.md
    │
    ├── 02-tools/                             ← Category: Công cụ (Module 2, 3)
    │   ├── index.md
    │   ├── custom-tools-why.md               ← Module 2
    │   ├── custom-tools-options.md
    │   ├── custom-tools-integrate.md
    │   ├── mcp-discovery.md                  ← Module 3
    │   ├── mcp-server-client.md
    │   └── mcp-azure-agents.md
    │
    ├── 03-knowledge/                         ← Category: Knowledge & RAG (Module 4)
    │   ├── index.md
    │   ├── rag-for-agents.md
    │   ├── foundry-iq-overview.md
    │   ├── data-sources-config.md
    │   └── retrieval-config.md
    │
    ├── 04-integration/                       ← Category: Tích hợp hệ sinh thái (Module 5, 9)
    │   ├── index.md
    │   ├── m365-publish-options.md           ← Module 5
    │   ├── m365-teams-publish.md
    │   ├── m365-agents-toolkit.md
    │   ├── work-iq.md
    │   ├── a2a-protocol.md                   ← Module 9
    │   ├── a2a-agent-executor.md
    │   ├── a2a-server.md
    │   └── a2a-connect.md
    │
    └── 05-orchestration/                     ← Category: Workflow & Multi-Agent (Module 6, 7, 8)
        ├── index.md
        ├── workflows-overview.md             ← Module 6
        ├── workflow-patterns.md
        ├── workflow-foundry.md
        ├── workflow-power-fx.md
        ├── agent-framework-intro.md          ← Module 7
        ├── agent-framework-create.md
        ├── agent-framework-tools.md
        ├── multi-agent-overview.md           ← Module 8
        ├── orchestration-concurrent.md
        ├── orchestration-sequential.md
        ├── orchestration-group.md
        ├── orchestration-handoff.md
        └── orchestration-magentic.md
```

**Tổng:** 5 categories, ~35 files docs

---

## Outline chi tiết & Mapping nguồn tài liệu

### 🏗️ Category 01: Foundations (Module 1)

#### `index.md` — Giới thiệu Category

- Overview module 1, roadmap trong category

#### `what-is-ai-agent.md` — AI Agent là gì?

**Nguồn:** `overview.md` (lines 7-24)
**Key concepts:**

- AI Agent vs Chatbot thông thường
- 3 core components: Model + Instructions + Tools
- Prompt Agent vs Hosted Agent (so sánh bảng)
- **Analogy:** Agent như "nhân viên thông minh" với CV (instructions), kỹ năng (tools), não bộ (model)
- **Mermaid:** Architecture diagram 3 components

#### `microsoft-foundry.md` — Microsoft Foundry Agent Service là gì?

**Nguồn:** `overview.md` (lines 28-34), `concepts/runtime-components.md`
**Key concepts:**

- Foundry = Managed Platform for agents
- Responses API — single entry point
- Platform components: Runtime, Tools, Models, Observability, Identity
- **Mermaid:** Platform layer diagram
- **Trade-off:** Foundry vs tự host

#### `development-approaches.md` — Các hướng phát triển Agent

**Nguồn:** `overview.md` (lines 36-41), `concepts/development-lifecycle.md`
**Key concepts:**

- 3 paths: Prompt Agent (portal-first), Hosted Agent (code-first), Responses API (bring-your-own)
- 7-step development lifecycle: Create → Test → Trace → Evaluate → Optimize → Publish → Monitor
- **Mermaid:** Decision tree chọn approach, Lifecycle flowchart
- **Trade-off:** Prompt vs Hosted vs BYO

#### `first-agent-foundry.md` — Build Agent đầu tiên trong Foundry Portal

**Nguồn:** `quickstarts/quickstart-hosted-agent.md`, `quickstarts/prompt-agent.md`
**Key concepts:**

- Portal-first flow: Create project → Add model → Configure instructions → Attach tools → Test in playground
- Agent playground là gì?
- **Mermaid:** Step-by-step flowchart build agent trong portal

#### `vscode-setup.md` — Setup VS Code cho Agent Development

**Nguồn:** `how-to/vs-code-agents-workflow-pro-code.md`, `environment-setup.md`
**Key concepts:**

- Extensions cần thiết
- Pro-code workflow trong VS Code
- Connect VS Code với Azure Foundry project
- **Mermaid:** Development environment diagram

#### `agent-tools-overview.md` — Mở rộng Agent với Tools

**Nguồn:** `concepts/tool-catalog.md` (toàn bộ)
**Key concepts:**

- Built-in Tools: Web Search, Code Interpreter, File Search, Function Calling
- Custom Tools: MCP, OpenAPI, A2A
- Toolbox — bundle tools thành 1 endpoint
- Authentication cho tools
- **Mermaid:** Tool taxonomy diagram, Tool call flow (sequenceDiagram)
- **Trade-off:** Built-in vs Custom tools

#### `deploy-integrate.md` — Test, Deploy và Integrate Agent

**Nguồn:** `how-to/agent-applications.md`, `overview.md` (lines 100-125)
**Key concepts:**

- Versioning: auto-snapshot, rollback
- Publishing: promote to managed resource với stable endpoint
- Distribution: Teams, M365 Copilot, Entra Agent Registry
- Protocols: OpenResponses, Activity, Invocations, A2A
- **Mermaid:** Deploy pipeline diagram

---

### 🔧 Category 02: Tools (Module 2 & 3)

#### ✅ `custom-tools-why.md` — Tại sao cần Custom Tools?

**Nguồn:** `concepts/tool-catalog.md` (Custom tools section), `concepts/tool-best-practice.md`
**Key concepts:**

- Gap giữa built-in tools và nhu cầu thực tế doanh nghiệp
- Khi nào built-in tools không đủ?
- **Analogy:** Built-in tools như bộ đồ nghề tiêu chuẩn; custom tools như đặt hàng tool riêng
- **Mermaid:** Decision flowchart: Should I use custom tools?

#### ✅ `custom-tools-options.md` — Các lựa chọn Custom Tools

**Nguồn:** `concepts/tool-catalog.md`, `how-to/tools/function-calling.md`, `how-to/tools/openapi.md`
**Key concepts:**

- Function Calling — define & execute locally
- OpenAPI Tool — connect REST API bằng spec
- MCP — remote tool protocol
- A2A — agent-to-agent
- **Bảng so sánh** 4 options theo: hosting, auth, use case, complexity
- **Mermaid:** Comparison diagram

#### ✅ `custom-tools-integrate.md` — Cách tích hợp Custom Tools

**Nguồn:** `how-to/tools/function-calling.md`, `how-to/tools/openapi.md`, `how-to/tools/azure-functions.md`
**Key concepts:**

- Function calling flow: Define schema → Agent calls → App executes → Return result
- OpenAPI flow: Provide spec → Agent discovers endpoints → Calls automatically
- **Mermaid:** sequenceDiagram cho từng approach

#### ✅ `mcp-discovery.md` — Understand MCP Tool Discovery

**Nguồn:** `concepts/tool-catalog.md` (MCP sections), Tool catalog UI walkthrough
**Key concepts:**

- MCP Protocol là gì? (Model Context Protocol)
- Remote MCP Server vs Local MCP Server
- Tool catalog: browse, filter, configure
- **Mermaid:** MCP topology diagram

#### ✅ `mcp-server-client.md` — MCP Server và Client

**Nguồn:** `how-to/mcp-authentication.md`
**Key concepts:**

- MCP Server = expose tools via protocol
- Authentication: Key-based, Entra (Managed Identity), OAuth OBO
- **Mermaid:** Auth flow diagrams cho từng method
- **Trade-off:** 3 auth methods

#### ✅ `mcp-azure-agents.md` — Dùng MCP với Azure AI Agents

**Nguồn:** `how-to/tools/model-context-protocol.md`, `overview.md` (MCP section)
**Key concepts:**

- Thêm MCP tool vào agent definition
- Toolbox — bundle MCP tools
- Azure Functions as MCP endpoint
- **Mermaid:** End-to-end MCP integration flow

---

### 📚 Category 03: Knowledge & RAG (Module 4)

#### ✅ `rag-for-agents.md` — RAG cho AI Agents

**Nguồn:** `concepts/what-is-foundry-iq.md`, `concepts/vector-stores.md`
**Key concepts:**

- RAG (Retrieval-Augmented Generation) là gì?
- Tại sao cần RAG cho agents? (hallucination problem)
- RAG vs Fine-tuning: trade-off quan trọng
- Vector Stores trong Foundry
- **Analogy:** Agent như thám tử — RAG cho phép nó tra cứu "hồ sơ vụ án" trước khi trả lời
- **Mermaid:** RAG pipeline diagram

#### ✅ `foundry-iq-overview.md` — Foundry IQ là gì?

**Nguồn:** `concepts/what-is-foundry-iq.md`
**Key concepts:**

- Foundry IQ = Knowledge base management platform
- Foundry IQ vs File Search (so sánh)
- Work IQ vs Fabric IQ vs Foundry IQ (bộ 3 IQ)
- **Mermaid:** IQ products overview

#### ✅ `data-sources-config.md` — Cấu hình Data Sources

**Nguồn:** `how-to/foundry-iq-connect.md`
**Key concepts:**

- Supported data sources: Azure Blob, SharePoint, Azure AI Search, v.v.
- Connections trong Foundry project
- Data ingestion & chunking strategies
- **Mermaid:** Data source → Index → Knowledge base flow

#### ✅ `retrieval-config.md` — Cấu hình Retrieval với Foundry IQ

**Nguồn:** `how-to/foundry-iq-connect.md`, `concepts/vector-stores.md`
**Key concepts:**

- Retrieval config: top-k, score threshold, reranking
- Semantic search vs Keyword search
- Attach Foundry IQ knowledge base vào agent
- **Mermaid:** Query → Retrieval → Augment → Generate flow

---

### 🔗 Category 04: Integration (Module 5 & 9)

#### `m365-publish-options.md` — Publishing Options trong Foundry

**Nguồn:** `concepts/agent-365-integration.md`, `overview.md` (Publishing section)
**Key concepts:**

- 4 protocols: OpenResponses, Activity, Invocations, A2A
- Entra Agent Registry
- **Bảng so sánh** protocols theo use case
- **Mermaid:** Publishing ecosystem diagram

#### `m365-teams-publish.md` — Publish Agent lên Microsoft Teams

**Nguồn:** `how-to/publish-copilot.md`
**Key concepts:**

- Flow publish từ Foundry portal → Teams
- M365 Copilot integration
- Permissions cần thiết
- **Mermaid:** Publish flow diagram

#### `m365-agents-toolkit.md` — Microsoft 365 Agents Toolkit (Advanced)

**Nguồn:** `how-to/agent-365.md`, `how-to/grant-agent-365-permissions.md`
**Key concepts:**

- Agents Toolkit là gì?
- Customization vs Portal publish
- Required permissions configuration

#### `work-iq.md` — Access M365 Data với Work IQ

**Nguồn:** `concepts/what-is-memory.md`, `how-to/memory-usage.md`
**Key concepts:**

- Work IQ = M365 data grounding (SharePoint, Teams, Outlook)
- Memory vs Work IQ: khi nào dùng cái nào?
- Privacy & access control trong M365 data

#### `a2a-protocol.md` — A2A Protocol là gì?

**Nguồn:** `how-to/enable-agent-to-agent-endpoint.md`, `concepts/tool-catalog.md` (A2A section)
**Key concepts:**

- A2A (Agent-to-Agent) Protocol
- Khi nào dùng A2A thay vì MCP?
- A2A Agent Card concept
- **Mermaid:** A2A communication pattern

#### `a2a-agent-executor.md` — Implement Agent Executor

**Nguồn:** `how-to/enable-agent-to-agent-endpoint.md`
**Key concepts:**

- AgentExecutor interface
- Task handling & response streaming
- **Mermaid:** Executor lifecycle diagram

#### `a2a-server.md` — Host A2A Server

**Nguồn:** `how-to/enable-agent-to-agent-endpoint.md`
**Key concepts:**

- Enable A2A endpoint trên Foundry
- Agent Card configuration
- Authentication cho A2A

#### `a2a-connect.md` — Connect to A2A Agent

**Nguồn:** `how-to/enable-agent-to-agent-endpoint.md`
**Key concepts:**

- Discovery via Agent Card URL
- A2A client patterns
- Cross-organization agent communication

---

### 🔀 Category 05: Orchestration (Module 6, 7, 8)

#### `workflows-overview.md` — Workflow trong Microsoft Foundry

**Nguồn:** `concepts/workflow.md`
**Key concepts:**

- Workflow là gì? (orchestration layer bên trên agents)
- Workflow vs Agent: phân biệt
- Components: Triggers, Actions, Agents, Conditions
- **Analogy:** Workflow như "bản nhạc" — Agent như "nhạc cụ"
- **Mermaid:** Workflow component diagram

#### `workflow-patterns.md` — Workflow Patterns

**Nguồn:** `concepts/workflow.md`
**Key concepts:**

- Sequential, Parallel, Event-driven patterns
- Khi nào dùng pattern nào?
- **Mermaid:** 3 pattern comparison diagrams

#### `workflow-foundry.md` — Tạo Workflows trong Foundry

**Nguồn:** `concepts/workflow.md`, `how-to/vs-code-agents-workflow-low-code.md`
**Key concepts:**

- Visual workflow builder trong Foundry portal
- Low-code approach
- Add agents vào workflow
- **Mermaid:** Build workflow step-by-step

#### `workflow-power-fx.md` — Power Fx trong Workflows

**Nguồn:** `concepts/workflow.md`
**Key concepts:**

- Power Fx là gì? (Excel-like formula language)
- Dùng Power Fx cho conditions & data transformation
- **Analogy:** Power Fx như công thức Excel nhưng cho workflow logic

#### `agent-framework-intro.md` — Microsoft Agent Framework

**Nguồn:** `concepts/hosted-agents.md`
**Key concepts:**

- Microsoft Agent Framework (MAF) là gì?
- MAF vs LangGraph vs OpenAI Agents SDK: so sánh
- Khi nào chọn MAF?
- **Mermaid:** Framework comparison

#### `agent-framework-create.md` — Tạo Agent với MAF

**Nguồn:** `concepts/hosted-agents.md`, `quickstarts/quickstart-hosted-agent.md`
**Key concepts:**

- Agent structure trong MAF
- HostedAgent pattern
- Responses API integration
- **Mermaid:** MAF agent architecture

#### `agent-framework-tools.md` — Thêm Tools vào MAF Agent

**Nguồn:** `concepts/tool-best-practice.md`, `how-to/tools/`
**Key concepts:**

- Tool integration patterns trong MAF
- Tool selection best practices
- Testing tools

#### `multi-agent-overview.md` — Giới thiệu Multi-Agent Orchestration

**Nguồn:** `concepts/hosted-agents.md`
**Key concepts:**

- Tại sao Multi-Agent? (specialization, scalability)
- Orchestration patterns: Concurrent, Sequential, Group Chat, Handoff, Magentic
- **Mermaid:** Pattern taxonomy diagram

#### `orchestration-concurrent.md` — Concurrent Orchestration

**Key concepts:**

- Agents chạy song song
- Fan-out / Fan-in pattern
- Khi nào dùng: tasks độc lập, cần tốc độ

#### `orchestration-sequential.md` — Sequential Orchestration

**Key concepts:**

- Agents chạy tuần tự, output → input
- Pipeline pattern
- Khi nào dùng: tasks phụ thuộc nhau

#### `orchestration-group.md` — Group Chat Orchestration

**Key concepts:**

- Multiple agents trong 1 conversation
- Moderator agent pattern
- Khi nào dùng: debate, review, brainstorm

#### `orchestration-handoff.md` — Handoff Orchestration

**Key concepts:**

- Agents "bàn giao" task cho nhau
- Triage pattern
- Khi nào dùng: routing theo expertise

#### `orchestration-magentic.md` — Magentic Orchestration

**Key concepts:**

- Magentic = Microsoft's meta-agent pattern
- Dynamic planning và task decomposition
- Khi nào dùng: phức tạp nhất, tasks không xác định trước

---

## Sidebars.js Configuration

```js
// sidebars.js
const sidebars = {
  azureAiAgentSidebar: [
    {
      type: 'doc',
      id: 'azure-ai-agent/index',
      label: '🤖 Azure AI Agent — Lộ trình',
    },
    {
      type: 'category',
      label: '🏗️ 01. Nền Tảng',
      items: [
        'azure-ai-agent/01-foundations/index',
        'azure-ai-agent/01-foundations/what-is-ai-agent',
        'azure-ai-agent/01-foundations/microsoft-foundry',
        'azure-ai-agent/01-foundations/development-approaches',
        'azure-ai-agent/01-foundations/first-agent-foundry',
        'azure-ai-agent/01-foundations/vscode-setup',
        'azure-ai-agent/01-foundations/agent-tools-overview',
        'azure-ai-agent/01-foundations/deploy-integrate',
      ],
    },
    {
      type: 'category',
      label: '🔧 02. Công Cụ',
      items: [
        'azure-ai-agent/02-tools/index',
        'azure-ai-agent/02-tools/custom-tools-why',
        'azure-ai-agent/02-tools/custom-tools-options',
        'azure-ai-agent/02-tools/custom-tools-integrate',
        'azure-ai-agent/02-tools/mcp-discovery',
        'azure-ai-agent/02-tools/mcp-server-client',
        'azure-ai-agent/02-tools/mcp-azure-agents',
      ],
    },
    {
      type: 'category',
      label: '📚 03. Knowledge & RAG',
      items: [
        'azure-ai-agent/03-knowledge/index',
        'azure-ai-agent/03-knowledge/rag-for-agents',
        'azure-ai-agent/03-knowledge/foundry-iq-overview',
        'azure-ai-agent/03-knowledge/data-sources-config',
        'azure-ai-agent/03-knowledge/retrieval-config',
      ],
    },
    {
      type: 'category',
      label: '🔗 04. Tích Hợp',
      items: [
        'azure-ai-agent/04-integration/index',
        'azure-ai-agent/04-integration/m365-publish-options',
        'azure-ai-agent/04-integration/m365-teams-publish',
        'azure-ai-agent/04-integration/m365-agents-toolkit',
        'azure-ai-agent/04-integration/work-iq',
        'azure-ai-agent/04-integration/a2a-protocol',
        'azure-ai-agent/04-integration/a2a-agent-executor',
        'azure-ai-agent/04-integration/a2a-server',
        'azure-ai-agent/04-integration/a2a-connect',
      ],
    },
    {
      type: 'category',
      label: '🔀 05. Workflow & Orchestration',
      items: [
        'azure-ai-agent/05-orchestration/index',
        'azure-ai-agent/05-orchestration/workflows-overview',
        'azure-ai-agent/05-orchestration/workflow-patterns',
        'azure-ai-agent/05-orchestration/workflow-foundry',
        'azure-ai-agent/05-orchestration/workflow-power-fx',
        'azure-ai-agent/05-orchestration/agent-framework-intro',
        'azure-ai-agent/05-orchestration/agent-framework-create',
        'azure-ai-agent/05-orchestration/agent-framework-tools',
        'azure-ai-agent/05-orchestration/multi-agent-overview',
        'azure-ai-agent/05-orchestration/orchestration-concurrent',
        'azure-ai-agent/05-orchestration/orchestration-sequential',
        'azure-ai-agent/05-orchestration/orchestration-group',
        'azure-ai-agent/05-orchestration/orchestration-handoff',
        'azure-ai-agent/05-orchestration/orchestration-magentic',
      ],
    },
  ],
};
```

---

## Kế hoạch triển khai (Giai đoạn sau)

### Thứ tự ưu tiên viết bài:

**Phase 1 — Foundation (Priority 1):**

1. `index.md` — Landing page
2. `01-foundations/what-is-ai-agent.md` ← Bài nền tảng nhất
3. `01-foundations/microsoft-foundry.md`
4. `01-foundations/development-approaches.md`

**Phase 2 — Tools (Priority 2):**
5. `02-tools/custom-tools-why.md`
6. `02-tools/mcp-discovery.md`
7. `02-tools/mcp-server-client.md`

**Phase 3 — Knowledge (Priority 3):**
8. `03-knowledge/rag-for-agents.md`
9. `03-knowledge/foundry-iq-overview.md`

**Phase 4 — Orchestration (Priority 4):**
10. `05-orchestration/workflows-overview.md`
11. `05-orchestration/multi-agent-overview.md`
12. Các bài orchestration patterns

**Phase 5 — Integration (Priority 5):**
13. `04-integration/m365-publish-options.md`
14. `04-integration/a2a-protocol.md`
15. Các bài còn lại

### Skill sử dụng khi viết:

- `create-tech-lecture` — **quản lý toàn bộ template** (4MAT, Glossary, Mermaid, Trade-off, TL;DR, Footer). Đây là skill chính cho mỗi bài, không cần định nghĩa template riêng trong plan.
- `mermaid-expert` — tạo diagrams phức tạp, tránh syntax errors
- `fact-check` — verify thông tin từ tài liệu gốc Microsoft
- `review-report` — QA nội dung & format trước khi publish
- `/push-content` workflow — deploy lên GitHub Pages

---

## Tổng quan số lượng

| Hạng mục                   | Số lượng         |
| ---------------------------- | ------------------- |
| Categories                   | 5                   |
| Files docs                   | ~35                 |
| Bài học chính             | ~30                 |
| Diagrams Mermaid ước tính | ~90 (3/bài)        |
| Từ tổng ước tính        | 75.000–120.000 từ |
| Thời gian đọc tổng       | ~25–40 giờ        |

---

*Made by Anh Tu - Share to be share*
