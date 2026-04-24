# Kế hoạch Chi tiết: Azure AI - Building AI Agents
## 15 bài · Python only · Azure AI Foundry · Azure AI Agent Service

---

## 📌 Quy ước chung

| Ký hiệu | Ý nghĩa |
|---|---|
| 🎯 | Learning objectives |
| 🧩 | Key concepts cần giải thích |
| 💻 | Code lab cần viết |
| 📊 | Diagrams cần vẽ (Mermaid) |
| 🔗 | Prerequisites (bài phụ thuộc) |
| 📦 | Deliverable (output bài học) |
| ⏱️ | Ước tính độ dài nội dung |
| 💰 | Azure cost note |

---

## 📖 PHẦN 0: Entry Point

---

### Bài 00: Course Overview & Roadmap

**File**: `docs/azure-ai/00-overview.md`  
**Sidebar position**: 0

🎯 **Learning objectives**
- Hiểu được lý do tại sao Azure AI quan trọng trong bối cảnh 2025-2026
- Nắm được roadmap toàn khoá học và thứ tự học tối ưu
- Biết prerequisites cần có trước khi bắt đầu

🧩 **Key concepts**
- Sự khác biệt giữa LLM call đơn giản vs AI Agent vs Agentic System
- Vị trí của Azure AI trong bức tranh Cloud AI (tại sao không dùng API trực tiếp?)
- Trade-off: Managed service (Azure AI Agent Service) vs Self-hosted

💻 **Code lab**
- Không có code lab — đây là bài giới thiệu
- Có **Prerequisites checklist** dạng interactive markdown
- Bảng estimation Azure cost cho toàn khoá học

📊 **Diagrams**
1. **Course Roadmap** (flowchart): 4 phần → 15 bài, có dependency arrows
2. **Learning Journey** (journey diagram): Mental model từ "LLM newbie" → "Agent Builder"

📦 **Deliverable**: Người đọc biết mình cần học gì và thứ tự

⏱️ **Ước tính**: ~800 words + 2 diagrams

💰 **Azure cost**: $0 (chưa tạo resource)

---

## 📖 PHẦN 1: Foundation

---

### Bài 01: Azure AI Ecosystem — Bức tranh toàn cảnh

**File**: `docs/azure-ai/part-1-foundation/01-azure-ai-ecosystem.md`  
**Sidebar position**: 1

🎯 **Learning objectives**
- Phân biệt được các service trong Azure AI Stack
- Quyết định được khi nào dùng Azure OpenAI, khi nào dùng Azure AI Foundry
- Hiểu được tại sao Microsoft lại kiến trúc như vậy (Root Cause)

🧩 **Key concepts**
1. **Azure AI Foundry** — Platform tích hợp (hub for AI development)
2. **Azure OpenAI Service** — Managed OpenAI models trên Azure infra
3. **Azure AI Services** — Pre-built AI APIs (Vision, Speech, Language...)
4. **Azure Machine Learning** — MLOps platform
5. **Azure AI Agent Service** — Managed agent runtime (focus của khoá học)
6. **Model Catalog** — Marketplace cho AI models (OpenAI, Meta, Mistral...)

📊 **Diagrams**
1. **Azure AI Stack** (block diagram, top-down):
   ```
   App Layer     → Azure AI Agent Service / Azure AI Studio
   Model Layer   → Azure OpenAI + Model Catalog (Phi, Meta, Mistral)
   Data Layer    → Azure AI Search + Azure Blob Storage
   Infra Layer   → Azure Compute + Networking
   ```
2. **Decision Tree** (flowchart): "Bạn cần gì?" → Chọn service nào
3. **Timeline** (timeline diagram): Lịch sử Azure AI — từ Cognitive Services → AI Foundry

💻 **Code lab**
- **Không có code** — bài này thuần lý thuyết
- Có bảng so sánh: Azure OpenAI vs Bedrock (AWS) vs Vertex AI (GCP)

📦 **Deliverable**: Mental model về Azure AI Stack

⏱️ **Ước tính**: ~1,200 words + 3 diagrams + 1 comparison table

---

### Bài 02: Azure AI Foundry — Hub & Project Model

**File**: `docs/azure-ai/part-1-foundation/02-azure-ai-foundry.md`  
**Sidebar position**: 2

🎯 **Learning objectives**
- Tạo và cấu hình Azure AI Hub + Project đúng cách
- Hiểu được mô hình quản trị Hub vs Project (tại sao có 2 layer?)
- Deploy và test model đầu tiên qua Foundry portal

🧩 **Key concepts**
1. **Hub** — Shared infrastructure layer (network, compute, credentials)
2. **Project** — Workspace cho một team/use case cụ thể
3. **Connections** — Cách kết nối Azure AI Search, Storage, OpenAI...
4. **Deployments** — Model deployment sang endpoint (PTU vs PayGo)
5. **Playgrounds** — Chat, Completions, Assistants playground

📊 **Diagrams**
1. **Hub-Project Architecture** (block diagram):
   ```
   Azure AI Hub (Shared)
   ├── Connections (AI Search, Storage, Key Vault)
   ├── Compute clusters
   └── Projects
       ├── Project A (Team 1)
       └── Project B (Team 2)  ← Our project
   ```
2. **Deployment Types** (comparison diagram): Standard vs PTU

💻 **Code lab** — Lab dạng step-by-step (Portal UI)
1. Tạo Resource Group
2. Tạo Azure AI Hub
3. Tạo Project trong Hub
4. Deploy `gpt-4o` model
5. Test trong Chat Playground

📦 **Deliverable**: Azure AI Hub + Project đang chạy, model GPT-4o đã deploy

⏱️ **Ước tính**: ~1,500 words + 2 diagrams + step-by-step screenshots description

💰 **Azure cost**: ~$0-1 (chỉ test nhẹ trong playground)

---

### Bài 03: Setup Environment — Python & Azure SDK

**File**: `docs/azure-ai/part-1-foundation/03-setup-environment.md`  
**Sidebar position**: 3

🎯 **Learning objectives**
- Cài đặt đầy đủ Python environment cho Azure AI development
- Hiểu và implement đúng cách Authentication (tại sao KHÔNG dùng API key hardcoded)
- Verify kết nối Python ↔ Azure AI Foundry thành công

🧩 **Key concepts**
1. **DefaultAzureCredential** — Chain-based auth (local dev vs cloud)
2. **azure-ai-projects** — Main SDK cho khoá học này
3. **Connection String vs Endpoint** — Cách kết nối project
4. **Environment Variables** — `.env` pattern an toàn
5. **Virtual environment** — Best practice Python project

📊 **Diagrams**
1. **DefaultAzureCredential Chain** (sequence diagram):
   ```
   Code → EnvironmentCredential?
        → WorkloadIdentityCredential?  
        → ManagedIdentityCredential?
        → AzureCliCredential ✓ (local dev)
        → ...
   ```

💻 **Code lab** — Có code thực sự

```python
# Lab 03-01: Install & verify
# requirements.txt
azure-ai-projects>=1.0.0
azure-identity>=1.15.0
python-dotenv>=1.0.0

# Lab 03-02: First connection
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

client = AIProjectClient.from_connection_string(
    conn_str=os.environ["PROJECT_CONNECTION_STRING"],
    credential=DefaultAzureCredential()
)

# Verify: List available connections
connections = client.connections.list()
for conn in connections:
    print(f"✅ {conn.name} ({conn.connection_type})")
```

**Steps**:
1. Install Python 3.11+
2. Tạo virtual environment
3. `pip install -r requirements.txt`
4. `az login` (Azure CLI)
5. Tạo `.env` với connection string
6. Chạy verification script

📦 **Deliverable**: Script Python kết nối Azure AI Foundry thành công, in ra list connections

⏱️ **Ước tính**: ~1,200 words + 1 diagram + 3 code blocks

💰 **Azure cost**: $0

---

## 📖 PHẦN 2: Hello Agent

---

### Bài 04: Anatomy of an AI Agent — Giải phẫu Agent

**File**: `docs/azure-ai/part-2-first-agent/04-agent-anatomy.md`  
**Sidebar position**: 4

🎯 **Learning objectives**
- Định nghĩa chính xác AI Agent theo chuẩn Azure AI
- Phân biệt được: LLM call → Chatbot → AI Agent → Agentic System
- Hiểu vòng đời một agent request từ đầu đến cuối

🧩 **Key concepts** (giải phẫu từng thành phần)
1. **Agent** — "Model + Instructions + Tools chạy trên managed runtime"
2. **Model** — LLM backbone (GPT-4o)
3. **Instructions** — System prompt định hình behavior (tại sao quan trọng hơn prompt user?)
4. **Tools** — Khả năng của agent (built-in + custom)
5. **Thread** — Conversation context (persistent session)
6. **Run** — Một lần thực thi agent (có state machine)
7. **Messages** — Content trong thread (user/assistant/tool)

📊 **Diagrams**
1. **Agent Architecture** (block diagram):
   ```
   ┌─────────────────────────────────┐
   │        Azure AI Agent           │
   │  ┌──────────┐  ┌────────────┐   │
   │  │  Model   │  │Instructions│   │
   │  │ (GPT-4o) │  │(System     │   │
   │  └──────────┘  │ Prompt)    │   │
   │                └────────────┘   │
   │  ┌──────────────────────────┐   │
   │  │         Tools            │   │
   │  │ [File Search] [Code Int] │   │
   │  │ [Custom Functions]       │   │
   │  └──────────────────────────┘   │
   └─────────────────────────────────┘
        ↕ Thread (Conversation State)
   ```

2. **Run State Machine** (state diagram):
   ```
   queued → in_progress → requires_action → in_progress → completed
                       ↘ failed
                       ↘ cancelled
                       ↘ expired
   ```

3. **So sánh** (table/diagram): LLM API call vs Chatbot vs Agent vs Multi-Agent

💻 **Code lab** — Chỉ inspect, chưa tạo agent
```python
# Explore agent service capabilities
agent_client = client.agents
print(agent_client.list_agents())  # Empty lần đầu
```

📦 **Deliverable**: Mental model rõ về agent architecture

⏱️ **Ước tính**: ~1,500 words + 3 diagrams + 1 comparison table

---

### Bài 05: Hello Agent — Build Agent đầu tiên

**File**: `docs/azure-ai/part-2-first-agent/05-hello-agent.md`  
**Sidebar position**: 5

🎯 **Learning objectives**
- Create, run, và query một agent hoàn chỉnh bằng Python SDK
- Hiểu vòng poll và xử lý Run states
- Quản lý Thread lifecycle đúng cách

🧩 **Key concepts**
1. **`agents.create_agent()`** — Tạo agent (persistent, reusable)
2. **`agents.create_thread()`** — Tạo conversation session
3. **`agents.create_message()`** — Add message vào thread
4. **`agents.create_and_process_run()`** — Run có built-in polling
5. **`agents.list_messages()`** — Lấy response

📊 **Diagrams**
1. **Request Flow** (sequence diagram):
   ```
   Python App → Create Agent → (one time)
   Python App → Create Thread → (per session)
   Python App → Create Message → Add to Thread
   Python App → Create Run → Agent Service
   Agent Service → Model (GPT-4o)
   Model → Response → Thread
   Python App → List Messages → Display
   ```

💻 **Code lab** — Full standalone example

```python
# lab-05-hello-agent.py

import os
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv

load_dotenv()

# 1. Connect
client = AIProjectClient.from_connection_string(
    conn_str=os.environ["PROJECT_CONNECTION_STRING"],
    credential=DefaultAzureCredential()
)

# 2. Create Agent (one-time)
agent = client.agents.create_agent(
    model="gpt-4o",
    name="my-first-agent",
    instructions="Bạn là trợ lý AI chuyên về công nghệ Azure. Hãy trả lời ngắn gọn, chính xác bằng tiếng Việt.",
)
print(f"✅ Agent created: {agent.id}")

# 3. Create Thread (per session)
thread = client.agents.create_thread()

# 4. Create Message
message = client.agents.create_message(
    thread_id=thread.id,
    role="user",
    content="Azure AI Foundry là gì và nó khác gì Azure OpenAI Service?",
)

# 5. Run & Poll
run = client.agents.create_and_process_run(
    thread_id=thread.id,
    agent_id=agent.id
)
print(f"Run status: {run.status}")

# 6. Get Response
messages = client.agents.list_messages(thread_id=thread.id)
for msg in messages.data:
    if msg.role == "assistant":
        print(f"\n🤖 Agent: {msg.content[0].text.value}")

# 7. Cleanup
client.agents.delete_agent(agent.id)
```

**Lab structure**:
1. Basic Hello Agent (code trên)
2. Multi-turn conversation (reuse thread)
3. Error handling (run failed, expired)

📦 **Deliverable**: Script `lab-05-hello-agent.py` chạy được end-to-end

⏱️ **Ước tính**: ~1,800 words + 1 diagram + 3 code blocks (tiến từng bước)

💰 **Azure cost**: ~$0.01 (vài GPT-4o calls)

---

### Bài 06: Tools & Actions — Trao quyền cho Agent

**File**: `docs/azure-ai/part-2-first-agent/06-tools-and-actions.md`  
**Sidebar position**: 6

🎯 **Learning objectives**
- Hiểu cơ chế Tool Use trong Azure AI Agent Service
- Implement custom Function Tool cho agent
- Xử lý `requires_action` state khi agent cần gọi tool

🧩 **Key concepts**
1. **Function Calling** — Agent nhận JSON schema, gọi function, nhận result
2. **Tool Definition** — JSON schema mô tả tool (name, description, parameters)
3. **`requires_action` state** — Agent "dừng" để chờ tool result
4. **Tool Output Submission** — App phải submit kết quả về cho agent
5. **Built-in Tools** — `FileSearchTool`, `CodeInterpreterTool` (sẽ dùng ở Part 3)

📊 **Diagrams**
1. **Function Calling Flow** (sequence diagram):
   ```
   App → Add Message → "Thời tiết Hà Nội hôm nay?"
   App → Create Run
   Agent → Decides to call get_weather(city="Hanoi")
   Run status → requires_action
   App → Call real get_weather() → "28°C, mưa nhẹ"
   App → Submit Tool Output → Agent
   Agent → Formulates response → "Hà Nội hôm nay 28°C, có mưa nhẹ..."
   Run status → completed
   ```

💻 **Code lab**

```python
# lab-06-tool-agent.py

import json
from azure.ai.projects.models import FunctionTool, ToolSet

# Define custom tool schema
def get_weather(city: str) -> str:
    """Mock weather function - replace with real API"""
    mock_data = {
        "hanoi": "28°C, mưa nhẹ, độ ẩm 80%",
        "hcmc": "32°C, nắng, độ ẩm 65%",
    }
    return mock_data.get(city.lower(), "Không tìm thấy dữ liệu")

# Tool schema (JSON Schema format)
weather_tool_schema = {
    "name": "get_weather",
    "description": "Lấy thông tin thời tiết hiện tại của một thành phố",
    "parameters": {
        "type": "object",
        "properties": {
            "city": {
                "type": "string",
                "description": "Tên thành phố (ví dụ: Hanoi, HCMC)"
            }
        },
        "required": ["city"]
    }
}

# Create agent with tool
functions = FunctionTool(functions={weather_tool_schema})
toolset = ToolSet()
toolset.add(functions)

agent = client.agents.create_agent(
    model="gpt-4o",
    name="weather-agent",
    instructions="Trợ lý thời tiết. Luôn dùng tool get_weather để tra thông tin.",
    toolset=toolset
)

# Handle requires_action loop
def run_with_tool_loop(thread_id, agent_id):
    run = client.agents.create_run(thread_id=thread_id, agent_id=agent_id)
    
    while run.status in ["queued", "in_progress", "requires_action"]:
        if run.status == "requires_action":
            tool_calls = run.required_action.submit_tool_outputs.tool_calls
            tool_outputs = []
            
            for tc in tool_calls:
                args = json.loads(tc.function.arguments)
                if tc.function.name == "get_weather":
                    result = get_weather(**args)
                    tool_outputs.append({
                        "tool_call_id": tc.id,
                        "output": result
                    })
            
            run = client.agents.submit_tool_outputs_to_run(
                thread_id=thread_id,
                run_id=run.id,
                tool_outputs=tool_outputs
            )
        else:
            import time
            time.sleep(0.5)
            run = client.agents.get_run(thread_id=thread_id, run_id=run.id)
    
    return run
```

📦 **Deliverable**: Weather Agent với custom tool chạy end-to-end

⏱️ **Ước tính**: ~2,000 words + 1 diagram + 4 code blocks

💰 **Azure cost**: ~$0.02

---

## 📖 PHẦN 3: Cookbook Recipes

---

### Bài 07: Recipe — RAG Agent với Azure AI Search

**File**: `docs/azure-ai/part-3-recipes/07-recipe-rag-agent.md`  
**Sidebar position**: 7

🎯 **Learning objectives**
- Hiểu RAG architecture và tại sao cần Azure AI Search
- Index documents lên Azure AI Search qua SDK
- Build agent dùng `FileSearchTool` để answer từ knowledge base

🧩 **Key concepts**
1. **RAG** (Retrieval-Augmented Generation) — Tại sao agent cần memory ngoài context window?
2. **Vector Search** — Embedding-based semantic search (vs keyword search)
3. **Azure AI Search** — Managed search service, tích hợp native với AI Foundry
4. **Vector Store** — Container cho embedded documents trong Agent Service
5. **FileSearchTool** — Built-in tool sử dụng Vector Store
6. **Chunking Strategy** — Ảnh hưởng đến chất lượng retrieval

📊 **Diagrams**
1. **RAG Architecture** (sequence diagram):
   ```
   [Documents] → chunk → embed → [Azure AI Search Index]
   User Question → embed → similarity search → top-K chunks
   top-K chunks + Question → LLM → Answer
   ```
2. **Traditional LLM vs RAG Agent** (comparison)

💻 **Code lab**

```python
# lab-07-rag-agent.py

# Step 1: Create Vector Store
vector_store = client.agents.create_vector_store_and_poll(
    file_ids=[],
    name="product-knowledge-base"
)

# Step 2: Upload documents
with open("docs/product-manual.pdf", "rb") as f:
    file = client.agents.upload_file_and_poll(
        file=f, 
        purpose="assistants"
    )
    
client.agents.update_vector_store(
    vector_store_id=vector_store.id,
    file_ids=[file.id]
)

# Step 3: Create RAG Agent with FileSearch
file_search = FileSearchTool(vector_store_ids=[vector_store.id])
toolset = ToolSet()
toolset.add(file_search)

rag_agent = client.agents.create_agent(
    model="gpt-4o",
    name="customer-support-agent",
    instructions="""Bạn là Customer Support Agent cho sản phẩm XYZ.
    Luôn tìm kiếm trong knowledge base trước khi trả lời.
    Nếu không tìm thấy thông tin, hãy nói thật.""",
    toolset=toolset
)

# Step 4: Query the agent
# ... (thread + message + run loop)
```

**Project**: Customer Support Agent cho một sản phẩm giả định

📦 **Deliverable**: RAG Agent với 5 tài liệu mẫu, trả lời câu hỏi dựa trên docs

⏱️ **Ước tính**: ~2,200 words + 2 diagrams + 4 code blocks

💰 **Azure cost**: ~$0.05 (AI Search + embeddings + GPT calls)

---

### Bài 08: Recipe — Code Interpreter Agent

**File**: `docs/azure-ai/part-3-recipes/08-recipe-code-interpreter.md`  
**Sidebar position**: 8

🎯 **Learning objectives**
- Hiểu Code Interpreter hoạt động như thế nào (sandboxed Python)
- Upload CSV/Excel và yêu cầu agent phân tích dữ liệu
- Nhận và lưu output code + charts từ agent

🧩 **Key concepts**
1. **Code Interpreter Tool** — Sandboxed Python environment trong Azure
2. **File Upload for Analysis** — `purpose="assistants"` vs blob storage
3. **Annotations** — Cách parse image/file output từ message
4. **Sandboxing** — Security model của Code Interpreter (tại sao an toàn?)

📊 **Diagrams**
1. **Code Interpreter Flow** (sequence diagram):
   ```
   Upload CSV → Agent Service Storage
   "Phân tích xu hướng doanh thu" → Agent
   Agent → Write Python code → Execute in sandbox
   Code output (table + chart) → Message annotations
   App → Download chart → Display
   ```

💻 **Code lab**

```python
# lab-08-code-interpreter.py

# Step 1: Upload data file
with open("data/sales_2025.csv", "rb") as f:
    data_file = client.agents.upload_file_and_poll(
        file=f, purpose="assistants"
    )

# Step 2: Create agent with Code Interpreter
code_interpreter = CodeInterpreterTool(file_ids=[data_file.id])
toolset = ToolSet()
toolset.add(code_interpreter)

analyst_agent = client.agents.create_agent(
    model="gpt-4o",
    name="data-analyst-agent",
    instructions="""Bạn là Data Analyst chuyên nghiệp.
    Khi phân tích dữ liệu, hãy:
    1. Trình bày summary statistics
    2. Tạo visualization phù hợp
    3. Đưa ra insights và recommendations""",
    toolset=toolset
)

# Step 3: Request analysis
# "Phân tích xu hướng doanh thu Q1-Q4 2025, so sánh theo quý và region"

# Step 4: Parse and save charts
messages = client.agents.list_messages(thread_id=thread.id)
for msg in messages.data:
    for content in msg.content:
        if content.type == "image_file":
            # Download and save chart
            file_content = client.agents.get_file_content(
                file_id=content.image_file.file_id
            )
            with open("output/chart.png", "wb") as f:
                f.write(file_content.read())
```

**Project**: Data Analysis Agent — upload CSV doanh thu, nhận báo cáo + biểu đồ

📦 **Deliverable**: Agent tự viết Python, chạy trong sandbox, trả về chart PNG

⏱️ **Ước tính**: ~1,800 words + 1 diagram + 4 code blocks

💰 **Azure cost**: ~$0.10 (Code Interpreter tốn hơn)

---

### Bài 09: Recipe — File Search Agent (Document Q&A)

**File**: `docs/azure-ai/part-3-recipes/09-recipe-file-search.md`  
**Sidebar position**: 9

🎯 **Learning objectives**
- Nắm sâu về Vector Store management (create, update, expire policy)
- Hiểu chunking và ranking ảnh hưởng như thế nào đến answer quality
- Build Document Q&A agent với citation tracing

🧩 **Key concepts** (khác bài 07 — đi sâu hơn)
1. **Vector Store Expiration Policy** — Tự động cleanup
2. **Chunking Parameters** — max_chunk_size_tokens, chunk_overlap_tokens
3. **File Status** — `in_progress` → `completed` → `failed` per file
4. **Citations in Answers** — Parse `annotations` để trích dẫn nguồn
5. **Multiple Vector Stores per Agent** — Tổ chức knowledge base

📊 **Diagrams**
1. **Vector Store Lifecycle** (state diagram)
2. **Citation Extraction** (data flow): Raw message → parse annotations → formatted citations

💻 **Code lab**

```python
# lab-09-file-search.py

# Advanced: Multiple vector stores + citation extraction
def extract_citations(message):
    """Extract source citations from agent message annotations"""
    citations = []
    for content in message.content:
        if content.type == "text":
            text = content.text.value
            for annotation in content.text.annotations:
                if annotation.type == "file_citation":
                    citation = {
                        "text": annotation.text,
                        "file_id": annotation.file_citation.file_id,
                        "quote": annotation.file_citation.quote
                    }
                    citations.append(citation)
    return citations

# Configure chunking
vector_store = client.agents.create_vector_store(
    name="technical-docs",
    chunking_strategy={
        "type": "static",
        "static": {
            "max_chunk_size_tokens": 800,
            "chunk_overlap_tokens": 100
        }
    },
    expires_after={
        "anchor": "last_active_at",
        "days": 7
    }
)
```

**Project**: Technical Documentation Q&A — multiple PDF docs + citation display

📦 **Deliverable**: Agent trả lời với citation format: "Theo [Tài liệu X, trang Y]..."

⏱️ **Ước tính**: ~2,000 words + 2 diagrams + 4 code blocks

💰 **Azure cost**: ~$0.05

---

### Bài 10: Recipe — Multi-Agent Orchestration (Azure Native)

**File**: `docs/azure-ai/part-3-recipes/10-recipe-multi-agent.md`  
**Sidebar position**: 10

🎯 **Learning objectives**
- Hiểu pattern Orchestrator + Specialist Agents
- Implement agent handoff bằng Azure AI Agent Service native
- Quản lý shared thread và context giữa các agents

🧩 **Key concepts**
1. **Orchestrator Pattern** — Agent điều phối (routing, delegation)
2. **Specialist Agents** — Agents chuyên biệt một domain
3. **Agent-as-Tool** — Orchestrator gọi specialist như gọi function tool
4. **Shared Thread** — Dùng chung context hay thread riêng?
5. **Handoff Protocol** — Cách truyền context giữa agents
6. **Azure native approach** — Không dùng LangGraph, implement orchestration thuần Python

📊 **Diagrams**
1. **Multi-Agent Architecture** (block diagram):
   ```
   User Query
       ↓
   Orchestrator Agent
   ├── Research Specialist Agent  (RAG + web search)
   ├── Writer Agent               (content generation)
   └── Reviewer Agent             (QA + fact-check)
       ↓
   Final Response
   ```
2. **Handoff Sequence** (sequence diagram)

💻 **Code lab**

```python
# lab-10-multi-agent.py

# Pattern: Orchestrator calls Specialists as function tools

def run_research_agent(topic: str) -> str:
    """Specialist: Research Agent - gathers information"""
    # Create thread for research agent
    research_thread = client.agents.create_thread()
    client.agents.create_message(
        thread_id=research_thread.id,
        role="user",
        content=f"Research the following topic thoroughly: {topic}"
    )
    run = client.agents.create_and_process_run(
        thread_id=research_thread.id,
        agent_id=research_agent_id
    )
    msgs = client.agents.list_messages(thread_id=research_thread.id)
    return msgs.data[0].content[0].text.value

def run_writer_agent(research_result: str, format: str) -> str:
    """Specialist: Writer Agent - formats content"""
    # ...similar pattern...

# Orchestrator as function tools
orchestrator_tools = [
    FunctionTool({
        "name": "research_topic",
        "description": "Giao cho Research Agent nghiên cứu một chủ đề",
        "parameters": {"type": "object", "properties": {"topic": {"type": "string"}}}
    }),
    FunctionTool({
        "name": "write_content", 
        "description": "Giao cho Writer Agent viết nội dung từ research",
        "parameters": {"type": "object", "properties": {"research": {"type": "string"}, "format": {"type": "string"}}}
    })
]

# Tool handler maps to real agent calls
tool_handlers = {
    "research_topic": lambda args: run_research_agent(args["topic"]),
    "write_content": lambda args: run_writer_agent(args["research"], args["format"])
}
```

**Project**: Content Pipeline — Orchestrator → Research Agent → Writer Agent → Reviewer Agent

📦 **Deliverable**: 3-agent pipeline tạo báo cáo kỹ thuật từ topic đầu vào

⏱️ **Ước tính**: ~2,500 words + 2 diagrams + 5 code blocks (bài phức tạp nhất)

💰 **Azure cost**: ~$0.20 (nhiều agent calls)

---

### Bài 11: Recipe — Streaming Responses

**File**: `docs/azure-ai/part-3-recipes/11-recipe-streaming.md`  
**Sidebar position**: 11

🎯 **Learning objectives**
- Implement streaming với Azure AI Agent Service event stream
- Phân biệt event types và xử lý từng loại đúng cách
- Build real-time console output và hiểu cách extend sang web UI

🧩 **Key concepts**
1. **Event Stream** — Server-Sent Events từ Agent Service
2. **Stream Event Types**: `thread.run.created`, `thread.message.delta`, `thread.run.completed`...
3. **Delta Content** — Incremental text chunks
4. **`create_stream()` vs `create_and_process_run()`** — Trade-off streaming vs polling
5. **EventHandler pattern** — OOP approach để xử lý events

📊 **Diagrams**
1. **Streaming Event Timeline** (timeline/sequence diagram):
   ```
   → thread.run.created
   → thread.run.in_progress
   → thread.message.created
   → thread.message.delta (×N chunks)
   → thread.message.completed  
   → thread.run.completed
   ```

💻 **Code lab**

```python
# lab-11-streaming.py
from azure.ai.projects.models import AgentEventHandler, MessageDeltaChunk

class MyStreamHandler(AgentEventHandler):
    def on_message_delta(self, delta: MessageDeltaChunk) -> None:
        """Called for each text chunk"""
        for content in delta.delta.content or []:
            if hasattr(content, 'text') and content.text:
                print(content.text.value, end="", flush=True)
    
    def on_run_step_done(self, run_step) -> None:
        print(f"\n[Step completed: {run_step.type}]")
    
    def on_error(self, data: str) -> None:
        print(f"\n❌ Error: {data}")

# Use streaming
with client.agents.create_stream(
    thread_id=thread.id,
    agent_id=agent.id,
    event_handler=MyStreamHandler()
) as stream:
    stream.until_done()
```

**Project**: Real-time Terminal Chat với streaming agent response

📦 **Deliverable**: Interactive CLI chat với typing effect output

⏱️ **Ước tính**: ~1,800 words + 1 diagram + 4 code blocks

💰 **Azure cost**: ~$0.05

---

## 📖 PHẦN 4: Production Ready

---

### Bài 12: Monitoring & Tracing

**File**: `docs/azure-ai/part-4-production/12-monitoring-tracing.md`  
**Sidebar position**: 12

🎯 **Learning objectives**
- Enable và cấu hình AI tracing trong Azure AI Foundry
- Trace một agent run end-to-end (prompt → tool calls → response)
- Tạo custom metrics và alert cho agent health

🧩 **Key concepts**
1. **OpenTelemetry** — Standard tracing protocol Azure AI sử dụng
2. **Azure Application Insights** — Destination cho traces/metrics
3. **AI Tracing** — Token usage, latency, run steps per agent call
4. **`azure-monitor-opentelemetry`** — SDK để enable auto-instrumentation
5. **Custom Spans** — Thêm custom trace cho business logic

📊 **Diagrams**
1. **Telemetry Pipeline** (data flow):
   ```
   Agent Code → OpenTelemetry SDK → Azure Monitor Exporter → App Insights
   App Insights → Azure Monitor → Alerts/Dashboards
   ```

💻 **Code lab**

```python
# lab-12-monitoring.py
from azure.monitor.opentelemetry import configure_azure_monitor

# Enable auto-instrumentation
configure_azure_monitor(
    connection_string=os.environ["APPLICATIONINSIGHTS_CONNECTION_STRING"]
)

# Custom span example
from opentelemetry import trace
tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("process-user-query") as span:
    span.set_attribute("query.length", len(user_query))
    result = run_agent(user_query)
    span.set_attribute("response.tokens", result.usage.total_tokens)
```

📦 **Deliverable**: Agent với full tracing, Dashboard trên Application Insights

⏱️ **Ước tính**: ~1,800 words + 1 diagram + 3 code blocks

💰 **Azure cost**: ~$0.01 (App Insights free tier rộng)

---

### Bài 13: Safety & Guardrails

**File**: `docs/azure-ai/part-4-production/13-safety-guardrails.md`  
**Sidebar position**: 13

🎯 **Learning objectives**
- Cấu hình Content Filter và hiểu các category filter
- Implement input validation trước khi gửi đến agent
- Protect against prompt injection attacks

🧩 **Key concepts**
1. **Azure AI Content Safety** — Tích hợp filter của Azure
2. **Content Filter Categories**: Hate, Violence, Sexual, Self-harm (severity levels)
3. **Prompt Shield** — Detect prompt injection / jailbreak attempts
4. **Ground Truth Grounding** — Chỉ answer trong scope của context
5. **Output Validation** — Kiểm tra response trước khi trả về user

📊 **Diagrams**
1. **Defense in Depth** (layered diagram):
   ```
   Layer 1: Input Validation (Python)
   Layer 2: Prompt Shield (Azure AI Content Safety)
   Layer 3: Agent Instructions (System Prompt)
   Layer 4: Content Filter (Azure OpenAI)
   Layer 5: Output Validation (Python)
   ```

💻 **Code lab** — Guardrail wrapper pattern

📦 **Deliverable**: Agent với multi-layer safety, test với adversarial inputs

⏱️ **Ước tính**: ~2,000 words + 1 diagram + 4 code blocks

💰 **Azure cost**: ~$0.05 (Content Safety API calls)

---

### Bài 14: Cost Optimization

**File**: `docs/azure-ai/part-4-production/14-cost-optimization.md`  
**Sidebar position**: 14

🎯 **Learning objectives**
- Estimate và monitor Azure AI costs chính xác
- Implement caching để giảm redundant API calls
- Chọn đúng model cho từng use case (GPT-4o vs GPT-4o-mini trade-off)

🧩 **Key concepts**
1. **Azure AI Pricing Model** — Input tokens vs Output tokens vs Tool calls
2. **PTU (Provisioned Throughput Units)** — Khi nào nên dùng?
3. **Semantic Caching** — Cache responses dựa trên semantic similarity
4. **Token Budgeting** — `max_completion_tokens` per run
5. **Model Selection Matrix** — GPT-4o vs GPT-4o-mini vs Phi-4

📊 **Diagrams**
1. **Cost Components Breakdown** (pie chart bằng Mermaid)
2. **Model Selection Decision Tree** (flowchart)

💻 **Code lab**
```python
# Token budget per run
run = client.agents.create_run(
    thread_id=thread.id,
    agent_id=agent.id,
    max_completion_tokens=500,  # Hard limit
    max_prompt_tokens=2000      # Context limit
)

# Truncation strategy
run = client.agents.create_run(
    ...,
    truncation_strategy={
        "type": "last_messages",
        "last_messages": 10  # Keep only last 10 messages
    }
)
```

📦 **Deliverable**: Cost monitoring script + optimization checklist

⏱️ **Ước tính**: ~1,800 words + 2 diagrams + 3 code blocks

💰 **Azure cost**: $0 (analysis bài, không tạo mới)

---

### Bài 15: Capstone Project — Full AI Agent System

**File**: `docs/azure-ai/part-4-production/15-capstone-project.md`  
**Sidebar position**: 15

🎯 **Learning objectives**
- Tổng hợp tất cả kiến thức từ bài 01-14 vào một project hoàn chỉnh
- Apply production best practices: monitoring, safety, cost optimization
- Có thể giải thích và demo cho người khác

🧩 **Project Spec: "HR Onboarding Assistant"**

> **Yêu cầu**: Xây dựng AI Agent hỗ trợ nhân viên mới trong 30 ngày đầu

**Functional Requirements**:
1. Trả lời câu hỏi về chính sách công ty (RAG từ HR documents)
2. Tạo onboarding checklist cá nhân hóa (Code Interpreter)
3. Giải thích các quy trình theo từng bước (FileSearch + streaming)
4. Escalate sang HR human khi câu hỏi vượt scope (guardrails)

**Non-functional Requirements**:
- Response time < 10s (streaming cho UX tốt hơn)
- Cost < $0.05 per session (budget enforcement)
- Safety: Block inappropriate content
- Monitoring: Full tracing trên App Insights

💻 **Code structure**
```
capstone/
├── agents/
│   ├── hr_agent.py          # Main HR agent
│   └── escalation_handler.py
├── tools/
│   ├── policy_search.py     # RAG tool
│   └── checklist_generator.py
├── utils/
│   ├── streaming.py         # Streaming handler
│   ├── safety.py            # Guardrails
│   └── monitoring.py        # Telemetry
├── data/
│   └── hr_policies/         # Sample HR docs
├── main.py                  # Entry point
└── requirements.txt
```

📦 **Deliverable**: GitHub-ready project + Self-assessment rubric

**Rubric**:
| Criteria | 1 điểm | 2 điểm | 3 điểm |
|---|---|---|---|
| Agent tạo & chạy được | Basic | Multi-turn | With tools |
| RAG hoạt động | Kết nối được | Trả lời đúng | Có citations |
| Streaming | Implement | Smooth UX | With events |
| Safety | Content filter | +Input validation | +Prompt shield |
| Monitoring | Basic logs | App Insights | Custom metrics |

⏱️ **Ước tính**: ~2,500 words + 1 architecture diagram + full codebase skeleton

💰 **Azure cost**: ~$0.50-1.00 (full demo run)

---

## 📅 Lộ trình thực hiện (Sprint Plan)

| Sprint | Bài | Ước tính | Tech Complexity |
|---|---|---|---|
| **Sprint 1** | 00, 01, 02, 03 | ~3 ngày | ⭐⭐ |
| **Sprint 2** | 04, 05, 06 | ~3 ngày | ⭐⭐⭐ |
| **Sprint 3a** | 07, 08, 09 | ~3 ngày | ⭐⭐⭐ |
| **Sprint 3b** | 10, 11 | ~3 ngày | ⭐⭐⭐⭐ |
| **Sprint 4** | 12, 13, 14, 15 | ~4 ngày | ⭐⭐⭐⭐ |

**Tổng ước tính**: ~16 ngày nếu làm 1 bài/ngày

---

## Verification Plan

### Per Article
```bash
# Build check
npm run build

# Serve & preview
npm run serve
```
- [ ] Mermaid diagrams render đúng
- [ ] Code blocks có syntax highlighting
- [ ] Internal links hoạt động
- [ ] Frontmatter đúng format

### Per Sprint
- Preview toàn bộ phần trên localhost
- Kiểm tra sidebar navigation thứ tự

### Pre-publish
- Chạy `/push-content` workflow
- Fix MDX syntax errors nếu có
