---
title: "Document loader integrations - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/document_loaders"
crawled_at: "2026-06-17T14:49:55.177Z"
---

Document loaders provide a **standard interface** for reading data from different sources (such as Slack, Notion, or Google Drive) into LangChain’s [Document](https://reference.langchain.com/javascript/langchain-core/documents/Document) format. This ensures that data can be handled consistently regardless of the source. All document loaders implement the [BaseLoader](https://reference.langchain.com/javascript/classes/_langchain_core.document_loaders_base.BaseDocumentLoader.html) interface.

## Interface

Each document loader may define its own parameters, but they share a common API:

-   `load()`: Loads all documents at once.
-   `loadAndSplit()`: Loads all documents at once and splits them into smaller documents.

```
import { OracleDocLoader } from "@oracle/langchain-oracledb";

const loader = new OracleDocLoader(,
  ...  // <-- Integration specific parameters here
);
const data = await loader.load();
```

## By category

LangChain.js categorizes document loaders in two different ways:

-   [File loaders](https://docs.langchain.com/oss/javascript/integrations/document_loaders/file_loaders), which load data into LangChain formats from your local filesystem.
-   [Web loaders](https://docs.langchain.com/oss/javascript/integrations/document_loaders/web_loaders), which load data from remote sources.

### File loaders

#### Common file types

| Document Loader | Description | Package/API |
| --- | --- | --- |
| [`DirectoryLoader`](https://docs.langchain.com/oss/javascript/integrations/document_loaders/file_loaders/directory) | Load all files from a directory with custom loader mappings | Package |
| [JSON](https://docs.langchain.com/oss/javascript/integrations/document_loaders/file_loaders/json) | Load JSON files using JSON pointer to target specific keys | Package |
| [`JSONLines`](https://docs.langchain.com/oss/javascript/integrations/document_loaders/file_loaders/jsonlines) | Load data from JSONLines/JSONL files | Package |
| [`Text`](https://docs.langchain.com/oss/javascript/integrations/document_loaders/file_loaders/text) | Load plain text files | Package |

#### Specialized file loaders

| Document Loader | Description | Package/API |
| --- | --- | --- |
| [`MultiFileLoader`](https://docs.langchain.com/oss/javascript/integrations/document_loaders/file_loaders/multi_file) | Load data from multiple individual file paths | Package |
| [`OracleDocLoader`](https://docs.langchain.com/oss/javascript/integrations/document_loaders/file_loaders/oracleai) | Ingest Oracle AI Vector Search tables or Oracle Text-supported files | Package |

### Web loaders

#### Cloud providers

| Document Loader | Description | Web Support | Package/API |
| --- | --- | --- | --- |
| [Google Cloud SQL for PostgreSQL](https://docs.langchain.com/oss/javascript/integrations/document_loaders/web_loaders/google_cloudsql_pg) | Load documents from Cloud SQL PostgreSQL databases | ✅ | Package |

#### Audio & video

| Document Loader | Description | Web Support | Package/API |
| --- | --- | --- | --- |
| [`Soniox`](https://docs.langchain.com/oss/javascript/integrations/document_loaders/web_loaders/soniox) | Transcribe multilingual audio files with optional translation using Soniox API | ✅ | API |

#### Other

| Document Loader | Description | Web Support | Package/API |
| --- | --- | --- | --- |
| [`LangSmith`](https://docs.langchain.com/oss/javascript/integrations/document_loaders/web_loaders/langsmith) | Load datasets and traces from LangSmith | ✅ | API |

## All document loaders

---
