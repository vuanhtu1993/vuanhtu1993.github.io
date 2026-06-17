---
title: "Text splitter integrations - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/integrations/splitters"
crawled_at: "2026-06-17T14:49:41.043Z"
---

**Text splitters** break large docs into smaller chunks that will be retrievable individually and fit within model context window limit. There are several strategies for splitting documents, each with its own advantages.

## Text structure-based

Text is naturally organized into hierarchical units such as paragraphs, sentences, and words. We can leverage this inherent structure to inform our splitting strategy, creating split that maintain natural language flow, maintain semantic coherence within split, and adapts to varying levels of text granularity. LangChain’s `RecursiveCharacterTextSplitter` implements this concept:

-   The [`RecursiveCharacterTextSplitter`](https://docs.langchain.com/oss/javascript/integrations/splitters/recursive_text_splitter) attempts to keep larger units (e.g., paragraphs) intact.
-   If a unit exceeds the chunk size, it moves to the next level (e.g., sentences).
-   This process continues down to the word level if necessary.

Example usage:

```
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 100, chunkOverlap: 0 })
const texts = splitter.splitText(document)
```

**Available text splitters**:

-   [Recursively split text](https://docs.langchain.com/oss/javascript/integrations/splitters/recursive_text_splitter)

## Length-based

An intuitive strategy is to split documents based on their length. This simple yet effective approach ensures that each chunk doesn’t exceed a specified size limit. Key benefits of length-based splitting:

-   Straightforward implementation
-   Consistent chunk sizes
-   Easily adaptable to different model requirements

Types of length-based splitting:

-   Token-based: Splits text based on the number of tokens, which is useful when working with language models.
-   Character-based: Splits text based on the number of characters, which can be more consistent across different types of text.

Example implementation using LangChain’s `CharacterTextSplitter` with token-based splitting:

```
import { TokenTextSplitter } from "@langchain/textsplitters";

const splitter = new TokenTextSplitter({ encodingName: "cl100k_base", chunkSize: 100, chunkOverlap: 0 })
const texts = splitter.splitText(document)
```

**Available text splitters**:

-   [Split by tokens](https://docs.langchain.com/oss/javascript/integrations/splitters/split_by_token)
-   [Split by characters](https://docs.langchain.com/oss/javascript/integrations/splitters/character_text_splitter)

## Document structure-based

Some documents have an inherent structure, such as HTML, Markdown, or JSON files. In these cases, it’s beneficial to split the document based on its structure, as it often naturally groups semantically related text. Key benefits of structure-based splitting:

-   Preserves the logical organization of the document
-   Maintains context within each chunk
-   Can be more effective for downstream tasks like retrieval or summarization

**Available text splitters**:

-   [Split code](https://docs.langchain.com/oss/javascript/integrations/splitters/code_splitter)

---
