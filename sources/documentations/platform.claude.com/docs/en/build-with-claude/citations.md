---
title: "Citations"
source_url: "https://platform.claude.com/docs/en/build-with-claude/citations"
crawled_at: "2026-11-01T16:16:21.281Z"
---

Ground Claude’s responses in your source documents. Citations return the exact passages that support each claim, so you can verify answers and surface sources to your users.

Claude can provide detailed citations when answering questions about documents, helping you track and verify the sources behind each response.

All [active models](https://platform.claude.com/docs/en/models/overview) support citations.

The following example shows how to enable citations on a plain text document with the Messages API:

---

## How citations work

Integrate citations with Claude in these steps:

1.  ### Provide document(s) and enable citations
    
    -   Include documents in any of the supported formats: [PDFs](#pdf-documents), [plain text](#plain-text-documents), or [custom content](#custom-content-documents) documents.
    -   Set `citations.enabled=true` on each of your documents. Currently, citations must be enabled on all or none of the documents within a request.
    -   Only text citations are currently supported. Image citations are not yet possible.
    
2.  ### Documents get processed
    
    -   Document contents are “chunked” to define the minimum granularity of possible citations. For example, sentence chunking lets Claude cite a single sentence or chain together multiple consecutive sentences to cite a paragraph or longer passage.
        -   **For PDFs:** Text is extracted as described in [PDF support](https://platform.claude.com/docs/en/build-with-claude/pdf-support) and content is chunked into sentences. Citing images from PDFs is not currently supported.
        -   **For plain text documents:** Content is chunked into sentences that can be cited from.
        -   **For custom content documents:** Your provided content blocks are used as-is and no further chunking is done.
    
3.  ### Claude provides cited response
    
    -   Responses might now include multiple text blocks where each text block can contain a claim that Claude is making and a list of citations that support the claim.
    -   Citations reference specific locations in source documents. The format of these citations is dependent on the type of document being cited from.
        -   **For PDFs:** Citations include the page number range (1-indexed).
        -   **For plain text documents:** Citations include the character index range (0-indexed).
        -   **For custom content documents:** Citations include the content block index range (0-indexed) corresponding to the original content list provided.
    -   Document indices are provided to indicate the reference source and are 0-indexed according to the list of all documents in your original request.
    

### Citable versus non-citable content

-   Text found within a document’s `source` content can be cited from.
-   `title` and `context` are optional fields that are passed to the model but not used toward cited content.
-   `title` is limited in length, so the `context` field is useful for storing document metadata as text or stringified JSON.

### Citation indices

-   Document indices are 0-indexed from the list of all document content blocks in the request (spanning across all messages).
-   Character indices are 0-indexed with exclusive end indices.
-   Page numbers are 1-indexed with exclusive end page numbers.
-   Content block indices are 0-indexed with exclusive end indices from the `content` list provided in the custom content document.

### Token costs

-   Enabling citations incurs a slight increase in input tokens because of system prompt additions and document chunking.
-   However, the citations feature is very efficient with output tokens. Internally, the model outputs citations in a standardized format, and those citations are then parsed into cited text and document location indices. The `cited_text` field is provided for convenience and does not count toward output tokens.
-   When passed back in subsequent conversation turns, `cited_text` is also not counted toward input tokens.

## Feature compatibility

Citations work in conjunction with other API features including [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), [token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting), and [batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing).

### Get structured data with citations

To get a citation for each extracted value, prompt Claude to answer with one line per field. Then parse the lines into structured data in your code.

Avoid user or system prompts that ask for only JSON, such as “Return only a JSON object, no other text.” A request with such a prompt succeeds, but the response might contain few or no citations.

The following prompt asks for two fields from the plain text document in the example at the top of this page. Send it in place of that example’s question:

In the following response, each value has its own citations:

To parse the response, follow these steps:

1.  Read the `text` blocks in order, and add each block’s text to the current line. Start a new line at each newline character.
2.  Attach each block’s `citations` to every line that contains part of its text. A cited block can hold only a value, as in this example, or a whole line.
3.  Skip lines that have no colon. Split each remaining line at its first colon into a field name and a value, and trim spaces from both. Skip lines whose name isn’t one of your fields, such as a closing note.
4.  Check that each field has a value and at least one citation. The API doesn’t guarantee either.

### Using prompt caching with citations

Citations and prompt caching can be used together effectively.

The citation blocks generated in responses cannot be cached directly, but the source documents they reference can be cached. To optimize performance, apply `cache_control` to your top-level document content blocks.

In this example:

-   The document content is cached using `cache_control` on the document block.
-   Citations are enabled on the document.
-   Claude can generate responses with citations while benefiting from cached document content.
-   Subsequent requests using the same document benefit from the cached content.

## Document types

### Choosing a document type

Three document types are supported for citations. Documents can be provided directly in the message (base64, text, or URL) or uploaded through the [Files API](https://platform.claude.com/docs/en/build-with-claude/files) and referenced by `file_id`:

| Type | Best for | Chunking | Citation format |
| --- | --- | --- | --- |
| Plain text | Simple text documents, prose | Sentence | Character indices (0-indexed) |
| PDF | PDF files with text content | Sentence | Page numbers (1-indexed) |
| Custom content | Lists, transcripts, special formatting, more granular citations | No additional chunking | Block indices (0-indexed) |

### Plain text documents

Plain text documents are automatically chunked into sentences. You can provide them inline or by reference with their `file_id`:

### PDF documents

PDF documents can be provided as base64-encoded data, as a URL, or by `file_id`. PDF text is extracted and chunked into sentences. As image citations are not yet supported, PDFs that are scans of documents and do not contain extractable text are not citable.

### Custom content documents

Custom content documents give you control over citation granularity. No additional chunking is done and chunks are provided to the model according to the content blocks provided.

---

## Response structure

When citations are enabled, responses include multiple text blocks with citations:

### Streaming support

For streaming responses, citations arrive as a `citations_delta` delta type inside `content_block_delta` events. Each delta contains a single citation to add to the `citations` list on the current `text` content block.

## Next steps

Handle the `citations_delta` delta type alongside text deltas to render cited responses as they stream.

Pass search results from your RAG pipeline as first-class content blocks with built-in citation support.

Learn how Claude extracts text from PDFs and how page-based citations map back to your source files.

Upload documents once and reference them by `file_id` across multiple citation requests.

## Availability

Citations are available on every model and eligible for zero data retention and HIPAA readiness.

### API support
