---
title: "Legal summarization"
source_url: "https://platform.claude.com/docs/en/about-claude/use-case-guides/legal-summarization"
crawled_at: "2026-11-01T16:30:43.828Z"
---

This guide walks through how to use Claude’s advanced natural language processing capabilities to efficiently summarize legal documents, extracting key information and expediting legal research. With Claude, you can streamline the review of contracts, litigation prep, and regulatory work, saving time and ensuring accuracy in your legal processes.

> Visit the [summarization recipe](https://platform.claude.com/cookbook/capabilities-summarization-guide) in the Claude Cookbook to see an example legal summarization implementation using Claude.

## Before building with Claude

### Decide whether to use Claude for legal summarization

Here are some key indicators that you should employ an LLM such as Claude to summarize legal documents:

There is no single correct summary for any given document. Without clear direction, it can be difficult for Claude to determine which details to include. To achieve optimal results, identify the specific information you want to include in the summary.

For instance, when summarizing a sublease agreement, you might want to extract the following key points:

### Establish success criteria

Evaluating the quality of summaries is a notoriously challenging task. Unlike many other natural language processing tasks, evaluation of summaries often lacks clear-cut, objective metrics. The process can be highly subjective, with different readers valuing different aspects of a summary. Here are criteria you might want to consider when assessing how well Claude performs legal summarization.

See the guide on [establishing success criteria](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests) for more information.

---

## How to summarize legal documents using Claude

### Select the right Claude model

Model accuracy is extremely important when summarizing legal documents. Claude Opus 5.5 is an excellent choice for use cases such as this where high accuracy is required. If the size and quantity of your documents are large such that costs start to become a concern, you can also try using a smaller model such as Claude Haiku 5.5.

To help estimate these costs, the following is a comparison of the cost to summarize 1,000 sublease agreements using Opus and Haiku models:

-   **Content size**
    
    -   Number of agreements: 1,000
    -   Characters per agreement: 300,000
    -   Total characters: 300M
-   **Estimated tokens**
    
    -   Input tokens: 108M, about 108,000 per agreement (about 1 token per 2.8 characters, the rate both models showed on this guide’s sample agreement)
    -   Output tokens per summary, including any thinking tokens, which are billed as output: about 6,200 on Claude Opus 5.5 and 3,100 on Claude Haiku 5.5
    -   Total output tokens: 6.2M on Claude Opus 5.5 and 3.1M on Claude Haiku 5.5
-   **Claude Opus 5.5 estimated cost**
    
    -   Input token cost: 108 MTok \* $4.00/MTok = $432.00 USD
    -   Output token cost: 6.2 MTok \* $20.00/MTok = $124.00 USD
    -   Total cost: $432.00 + $124.00 = $556.00 USD
-   **Claude Haiku 5.5 estimated cost**, at its prices for prompts over 100,000 tokens
    
    -   Input token cost: 108 MTok \* $0.50/MTok = $54.00 USD
    -   Output token cost: 3.1 MTok \* $2.50/MTok = $7.75 USD
    -   Total cost: $54.00 + $7.75 = $61.75 USD

### Transform documents into a format that Claude can process

Before you start summarizing documents, you need to prepare your data. This involves extracting text from PDFs, cleaning the text, and ensuring it’s ready to be processed by Claude.

Here is a demonstration of this process on a sample PDF:

In this example, you first download a PDF of a sample sublease agreement used in the Claude Cookbook’s [summarization recipe](https://platform.claude.com/cookbook/capabilities-summarization-guide). This agreement was sourced from a publicly available sublease agreement from the [sec.gov website](https://www.sec.gov/Archives/edgar/data/1045425/000119312507044370/dex1032.htm).

The example uses the `pypdf` library to extract the contents of the PDF and convert it to text. The text data is then cleaned by removing page numbers and extra whitespace.

### Build a strong prompt

Claude can adapt to various summarization styles. You can change the details of the prompt to guide Claude to be more or less verbose, include more or less technical terminology, or provide a higher- or lower-level summary of the context at hand.

Here’s an example of how to create a prompt that ensures the generated summaries follow a consistent structure when analyzing sublease agreements:

This code implements a `summarize_document()` function that uses Claude to summarize the contents of a sublease agreement. The function accepts a text string and a list of details to extract as inputs. In this example, the code calls the function with the `document_text` and `details_to_extract` variables that were defined in the previous code snippets.

Within the function, a prompt is generated for Claude, including the document to be summarized, the details to extract, and specific instructions for summarizing the document. The prompt instructs Claude to respond with a summary of each detail to extract nested within XML headers.

Because the code outputs each section of the summary within tags, each section can be parsed out as a post-processing step. This approach makes it possible to create structured summaries that can be adapted for your use case, so that each summary follows the same pattern.

### Evaluate your prompt

Prompting often requires testing and optimization for it to be production ready. To determine the readiness of your solution, evaluate the quality of your summaries using a systematic process combining quantitative and qualitative methods. Creating a [strong empirical evaluation](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests#build-evaluations) based on your defined success criteria allows you to optimize your prompts. Here are some metrics you might want to include within your empirical evaluation:

### Deploy your prompt

Here are some additional considerations to keep in mind as you deploy your solution to production.

1.  **Ensure no liability:** Understand the legal implications of errors in the summaries, which could lead to legal liability for your organization or clients. Provide disclaimers or legal notices clarifying that the summaries are generated by AI and should be reviewed by legal professionals.
    
2.  **Handle diverse document types:** This guide discusses how to extract text from PDFs. In the real world, documents might come in a variety of formats (such as PDFs, Word documents, and text files). Ensure your data extraction pipeline can convert all of the file formats you expect to receive.
    
3.  **Parallelize API calls to Claude:** Long documents with a large number of tokens might require up to a minute for Claude to generate a summary. For large document collections, you might want to send API calls to Claude in parallel so that the summaries can be completed in a reasonable timeframe. Refer to Anthropic’s [rate limits](https://platform.claude.com/docs/en/api/rate-limits#rate-limits) to determine the maximum number of API calls that can be performed in parallel.
    

---

## Improve performance

In complex scenarios, it might be helpful to consider additional strategies to improve performance beyond standard [prompt engineering techniques](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview). Here are some advanced strategies:

### Perform meta-summarization to summarize long documents

Legal summarization often involves handling long documents or many related documents at once, such that you surpass Claude’s context window. You can use a chunking method known as meta-summarization to handle this use case. This technique involves breaking down documents into smaller, manageable chunks and then processing each chunk separately. You can then combine the summaries of each chunk to create a meta-summary of the entire document.

Here’s an example of how to perform meta-summarization:

The `summarize_long_document()` function builds upon the earlier `summarize_document()` function by splitting the document into smaller chunks and summarizing each chunk individually.

The code achieves this by applying the `summarize_document()` function to each chunk of 20,000 characters within the original document. The individual summaries are then combined, and a final summary is created from these chunk summaries.

Note that the `summarize_long_document()` function isn’t strictly necessary for the example PDF, as the entire document fits within Claude’s context window. However, it becomes essential for documents exceeding Claude’s context window or when summarizing multiple related documents together. Regardless, this meta-summarization technique often captures additional important details in the final summary that were missed in the earlier single-summary approach.

### Use summary indexed documents to explore a large collection of documents

Searching a collection of documents with an LLM usually involves retrieval-augmented generation (RAG). However, in scenarios involving large documents or when precise information retrieval is crucial, a basic RAG approach might be insufficient. Summary indexed documents is an advanced RAG approach that provides a more efficient way of ranking documents for retrieval, using less context than traditional RAG methods. In this approach, you first use Claude to generate a concise summary for each document in your corpus, and then use Claude to rank the relevance of each summary to the query being asked. For further details on this approach, including a code-based example, see the summary indexed documents section in the [summarization recipe](https://platform.claude.com/cookbook/capabilities-summarization-guide).

### Fine-tune Claude to learn from your dataset

Another advanced technique to improve Claude’s ability to generate summaries is fine-tuning. Fine-tuning involves training Claude on a custom dataset that specifically aligns with your legal summarization needs, ensuring that Claude adapts to your use case. Here’s an overview on how to perform fine-tuning:

1.  **Identify errors:** Start by collecting instances where Claude’s summaries are inadequate. This could include missing critical legal details, misunderstanding context, or using inappropriate legal terminology.
    
2.  **Curate a dataset:** Once you’ve identified these issues, compile a dataset of these problematic examples. This dataset should include the original legal documents alongside your corrected summaries, ensuring that Claude learns the behavior you want.
    
3.  **Perform fine-tuning:** Fine-tuning involves retraining the model on your curated dataset to adjust its weights and parameters. This retraining helps Claude better adapt to the specific requirements of your legal domain, improving its ability to summarize documents according to your standards.
    
4.  **Improve iteratively:** Fine-tuning is not a one-time process. As Claude continues to generate summaries, you can iteratively add new examples where it has underperformed, further refining its capabilities. Over time, this continuous feedback loop will result in a model that is highly specialized for your legal summarization tasks.
    

View a fully implemented code-based example of how to use Claude to summarize contracts.

Explore the Citations recipe for guidance on how to ensure accuracy and explainability of information.
