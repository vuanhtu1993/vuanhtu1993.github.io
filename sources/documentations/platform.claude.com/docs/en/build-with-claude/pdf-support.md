---
title: "PDF support"
source_url: "https://platform.claude.com/docs/en/build-with-claude/pdf-support"
crawled_at: "2026-11-01T16:20:30.137Z"
---

Process PDFs with Claude: extract text, analyze charts, and understand visual content from your documents.

You can ask Claude about any text, pictures, charts, and tables in PDFs you provide. Some sample use cases:

-   Analyzing financial reports and understanding charts/tables
-   Extracting key information from legal documents
-   Helping with document translation
-   Converting document information into structured formats

## Before you start

### Check PDF requirements

Claude works with any standard PDF. Ensure your request size meets these requirements:

| Requirement | Limit |
| --- | --- |
| Maximum request size | 128 MB on the first-party Claude API (varies by platform; see [request size limits](https://platform.claude.com/docs/en/api/overview#request-size-limits)) |
| Maximum pages per request | 600 (100 when the request’s context window is under 1M tokens) |
| Format | Standard PDF (no passwords/encryption) |

Both limits are on the entire request payload, including any other content sent alongside PDFs. For large PDFs, consider uploading with the [Files API](https://platform.claude.com/docs/en/build-with-claude/files) and referencing by `file_id` to keep request payloads small.

Because PDF support relies on Claude’s vision capabilities, it is subject to the same [limitations and considerations](https://platform.claude.com/docs/en/build-with-claude/vision#limitations) as other vision tasks.

### Supported platforms and models

All [active models](https://platform.claude.com/docs/en/models/overview) support PDF processing.

## Process PDFs with Claude

### Send your first PDF request

Start with a simple example using the Messages API. You can provide PDFs to Claude in three ways:

1.  As a URL reference to a PDF hosted online
2.  As a base64-encoded PDF in `document` content blocks
3.  By a `file_id` from the [Files API](https://platform.claude.com/docs/en/build-with-claude/files)

#### Option 1: URL-based PDF document

The simplest approach is to reference a PDF directly from a URL:

The response returns Claude’s analysis as text blocks in `content`, with token consumption in `usage`:

#### Option 2: Base64-encoded PDF document

If you need to send PDFs from your local system or when a URL isn’t available:

#### Option 3: Files API

For PDFs you’ll use repeatedly, or when you want to avoid encoding overhead, use the [Files API](https://platform.claude.com/docs/en/build-with-claude/files):

### How PDF support works

When you send a PDF to Claude, the following steps occur:

1.  ### The system extracts the contents of the document.
    
    -   The system converts each page of the document into an image.
    -   The text from each page is extracted and provided alongside each page’s image.
    
2.  ### Claude analyzes both the text and images.
    
    -   Documents are provided as a combination of text and images for analysis.
    -   This allows users to ask for insights on visual elements of a PDF, such as charts, diagrams, and other non-textual content.
    
3.  ### Claude responds, referencing the PDF’s contents if relevant.
    
    Claude can reference both textual and visual content when it responds. You can further improve performance by integrating PDF support with:
    
    -   [Use prompt caching](#use-prompt-caching): To improve performance for repeated analysis.
    -   [Process document batches](#process-document-batches): To process documents at high volume.
    -   [Tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview): To extract specific information from documents for use as tool inputs.
    

### Estimate your costs

The token count of a PDF file depends on the total text extracted from the document and the number of pages:

-   Text token costs: Each page typically uses 1,500–3,000 tokens depending on content density. Standard API pricing applies with no additional PDF fees.
-   Image token costs: Because each page is converted into an image, the same [image-based cost calculations](https://platform.claude.com/docs/en/build-with-claude/vision#evaluate-image-size) are applied.

You can use [token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting) to estimate costs for your specific PDFs.

## Optimize PDF processing

### Improve performance

Follow these best practices for optimal results:

-   Place PDFs before text in your requests
-   Use standard fonts
-   Ensure text is clear and legible
-   Rotate pages to proper upright orientation
-   Use logical page numbers (from PDF viewer) in prompts
-   Split large PDFs into chunks when needed
-   Enable prompt caching for repeated analysis

### Scale your implementation

For high-volume processing, consider these approaches:

#### Use prompt caching

Cache PDFs with [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) to improve performance on repeated queries:

#### Process document batches

Use the [Message Batches API](https://platform.claude.com/docs/en/build-with-claude/batch-processing) to process many PDFs in one request:

Batches process asynchronously. To check progress and retrieve results once processing ends, see [Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing).

## Next steps

Claude’s vision capabilities allow it to process and analyze images, opening up exciting possibilities for multimodal interaction.

Explore practical examples of PDF processing in the Claude Cookbook recipe.

See complete API documentation for PDF support.

## Availability

PDF support is available on every model and eligible for zero data retention and HIPAA readiness.

### API support
