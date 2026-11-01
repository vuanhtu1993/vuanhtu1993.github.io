---
title: "Customer support agent"
source_url: "https://platform.claude.com/docs/en/about-claude/use-case-guides/customer-support-chat"
crawled_at: "2026-11-01T16:30:32.596Z"
---

Build a customer support chatbot with Claude that answers product questions, stays on topic, and generates quotes through tool use.

## Prerequisites

To follow this guide, you need:

-   A Claude API key (set as the `ANTHROPIC_API_KEY` environment variable)
-   Python 3.10 or later

Install the required packages:

## Before building with Claude

### Decide whether to use Claude for support chat

Here are some key indicators that you should employ an LLM such as Claude to automate portions of your customer support process:

Some considerations for choosing Claude over other LLMs:

-   You prioritize natural, nuanced conversation: Claude’s sophisticated language understanding allows for more natural, context-aware conversations that feel more human-like than chats with other LLMs.
-   You often receive complex and open-ended queries: Claude can handle a wide range of topics and inquiries without generating scripted responses or requiring extensive programming of permutations of user utterances.
-   You need scalable multilingual support: Claude’s multilingual capabilities allow it to engage in conversations in over 200 languages without the need for separate chatbots or extensive translation processes for each supported language.

### Define your ideal chat interaction

Outline an ideal customer interaction to define how and when you expect the customer to interact with Claude. This outline will help to determine the technical requirements of your solution.

Here is an example chat interaction for car insurance customer support:

-   **Customer:** Initiates support chat experience
    -   **Claude:** Warmly greets customer and initiates conversation
-   **Customer:** Asks about insurance for their new electric car
    -   **Claude:** Provides relevant information about electric vehicle coverage
-   **Customer:** Asks questions related to unique needs for electric vehicle insurance
    -   **Claude:** Responds with accurate and informative answers and provides links to the sources
-   **Customer:** Asks off-topic questions unrelated to insurance or cars
    -   **Claude:** Clarifies it does not discuss unrelated topics and steers the user back to car insurance
-   **Customer:** Expresses interest in an insurance quote
    -   **Claude:** Asks a set of questions to determine the appropriate quote, adapting to their responses
    -   **Claude:** Sends a request to use the quote generation API tool along with necessary information collected from the user
    -   **Claude:** Receives the response information from the API tool use, synthesizes the information into a natural response, and presents the provided quote to the user
-   **Customer:** Asks follow-up questions
    -   **Claude:** Answers follow-up questions as needed
    -   **Claude:** Guides the customer to the next steps in the insurance process and closes out the conversation

### Break the interaction into unique tasks

Customer support chat is a collection of multiple different tasks, from question answering to information retrieval to taking action on requests, wrapped up in a single customer interaction. Before you start building, break down your ideal customer interaction into every task you want Claude to be able to perform. This ensures you can prompt and evaluate Claude for every task, and gives you a good sense of the range of interactions you need to account for when writing test cases.

Here are the key tasks associated with the example insurance interaction:

1.  Greeting and general guidance
    
    -   Warmly greet the customer and initiate conversation
    -   Provide general information about the company and interaction
2.  Product information
    
    -   Provide information about electric vehicle coverage
    -   Answer questions related to unique electric vehicle insurance needs
    -   Answer follow-up questions about the quote or insurance details
    -   Offer links to sources when appropriate
3.  Conversation management
    
    -   Stay on topic (car insurance)
    -   Redirect off-topic questions back to relevant subjects
4.  Quote generation
    
    -   Ask appropriate questions to determine quote eligibility
    -   Adapt questions based on customer responses
    -   Submit collected information to quote generation API
    -   Present the provided quote to the customer

### Establish success criteria

Work with your support team to [define success criteria and write detailed evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests) with measurable benchmarks and goals.

Here are criteria and benchmarks that can be used to evaluate how successfully Claude performs the defined tasks:

Here are criteria and benchmarks that can be used to evaluate the business impact of employing Claude for support:

## How to implement Claude as a customer service agent

### Choose the right Claude model

The choice of model depends on the trade-offs among cost, accuracy, and response time.

For customer support chat, Claude Opus 5.5 is well suited to balance intelligence, latency, and cost, including the most complex support scenarios that require deep reasoning across long, multistep conversations. However, for instances where you have a conversation flow with multiple prompts including RAG, tool use, or long-context prompts, Claude Haiku 5.5 might be more suitable to optimize for latency. [Effort](https://platform.claude.com/docs/en/build-with-claude/effort) is its main control for speed: `low` is the fastest level, suited to chat and short tool tasks.

### Build a strong prompt

Using Claude for customer support requires Claude having enough direction and context to respond appropriately, while having enough flexibility to handle a wide range of customer inquiries.

Start by writing the elements of a strong prompt, beginning with a system prompt. Create a file called `config.py` and add each of the following blocks to it:

It’s best to break down complex prompts into subsections and write one part at a time. For each task, you might find greater success by following a step-by-step process to define the parts of the prompt Claude would need to do the task well. For this car insurance customer support example, you’ll be writing piecemeal all the parts for a prompt starting with the “Greeting and general guidance” task. This also makes debugging your prompt easier as you can more quickly adjust individual parts of the overall prompt.

Then do the same for your car insurance and electric car insurance information.

Now that you have your static content, add at least 4–5 sample “good” interactions to guide Claude’s responses. These examples should be representative of your ideal customer interaction and can include elements such as guardrails and tool calls.

Also include any important instructions outlining dos and don’ts for how Claude should interact with the customer. This might draw from brand guardrails or support policies.

Now combine all these sections into a single string to use as your prompt.

### Add dynamic and agentic capabilities with tool use

Claude is capable of taking actions and retrieving information dynamically using client-side tool use functionality. Start by listing any external tools or APIs the prompt should use.

For this example, start with one tool for calculating the quote.

Add the model name, the tool definition, and a stub implementation to `config.py`:

### Deploy your prompts

It’s hard to know how well your prompt works without deploying it in a test production setting and [running evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests). Build a small application using the prompt, the Anthropic SDK, and Streamlit for a user interface.

In a file called `chatbot.py` (or the equivalent module in your language), set up the ChatBot class, which will encapsulate the interactions with the Anthropic SDK.

The class should have two main methods: one that calls the API to generate a message, and one that processes each incoming user input.

### Build your user interface

Test deploying this code with Streamlit using a main function. This `main()` function sets up a Streamlit-based chat interface. Streamlit is a Python framework, so this part of the walkthrough is shown in Python only; the ChatBot class shown earlier is the piece you can port to any language.

Do this in a file called `app.py`:

Run the program with:

### Evaluate your prompts

Prompting often requires testing and optimization for it to be production ready. To determine the readiness of your solution, evaluate the chatbot performance using a systematic process combining quantitative and qualitative methods. Creating a [strong empirical evaluation](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests#build-evaluations) based on your defined success criteria will allow you to optimize your prompts.

### Improve performance

In complex scenarios, it might be helpful to consider additional strategies to improve performance beyond standard [prompt engineering techniques](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview) and [guardrail implementation strategies](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations). Here are some common scenarios:

#### Reduce long context latency with RAG

When dealing with large amounts of static and dynamic context, including all information in the prompt can lead to high costs, slower response times, and reaching context window limits. In this scenario, implementing Retrieval Augmented Generation (RAG) techniques can improve performance and efficiency.

You can create a more scalable and responsive system by converting information into vector representations with [embedding models](https://platform.claude.com/docs/en/build-with-claude/embeddings), such as those from Voyage AI by MongoDB. This approach allows for dynamic retrieval of relevant information based on the current query, rather than including all possible context in every prompt.

Implementing RAG for support use cases has been shown to increase accuracy, reduce response times, and reduce API costs in systems with extensive context requirements. See the [RAG recipe](https://platform.claude.com/cookbook/capabilities-retrieval-augmented-generation-guide) for a worked example.

#### Integrate real-time data with tool use

When dealing with queries that require real-time information, such as account balances or policy details, embedding-based RAG approaches are not sufficient. Instead, tool use can enhance your chatbot’s ability to provide accurate, real-time responses. For example, you can use tool use to look up customer information, retrieve order details, and cancel orders on behalf of the customer.

This approach, outlined in the [tool use: customer service agent recipe](https://platform.claude.com/cookbook/tool-use-customer-service-agent), lets you integrate live data into Claude’s responses and provide a more personalized and efficient customer experience.

#### Strengthen input and output guardrails

When deploying a chatbot, especially in customer service scenarios, it’s important to prevent risks associated with misuse, out-of-scope queries, and inappropriate responses. Although Claude is inherently resilient to such scenarios, here are additional steps to strengthen your chatbot guardrails:

-   [Reduce hallucination](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations): Implement fact-checking mechanisms and [citations](https://platform.claude.com/cookbook/misc-using-citations) to ground responses in provided information.
-   Cross-check information: Verify that the agent’s responses align with your company’s policies and known facts.
-   Avoid contractual commitments: Ensure the agent doesn’t make promises or enter into agreements it’s not authorized to make.
-   [Mitigate jailbreaks](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks): Use methods such as harmlessness screens and input validation to prevent users from exploiting model vulnerabilities to generate inappropriate content.
-   Avoid mentioning competitors: Implement a competitor mention filter to maintain brand focus and not mention any competitor’s products or services.
-   [Increase output consistency](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/increase-consistency): Prevent Claude from changing style or going out of character, even during long, complex interactions.
-   Remove personally identifiable information (PII): Unless explicitly required and authorized, strip out any PII from responses.

#### Reduce perceived response time with streaming

When dealing with potentially lengthy responses, implementing streaming can improve user engagement and satisfaction. In this scenario, users receive the answer progressively instead of waiting for the entire response to be generated.

Here is how to implement streaming:

1.  Use the [Anthropic Streaming API](https://platform.claude.com/docs/en/build-with-claude/streaming) to support streaming responses.
2.  Set up your front end to handle incoming chunks of text.
3.  Display each chunk as it arrives, simulating real-time typing.
4.  Implement a mechanism to save the full response, allowing users to view it if they navigate away and return.

In some cases, streaming makes it possible to use more advanced models with higher base latencies, as the progressive display mitigates the impact of longer processing times.

#### Scale your chatbot

As the complexity of your chatbot grows, your application architecture can evolve to match. Before you add further layers to your architecture, consider the following less exhaustive options:

-   Ensure that you are making the most out of your prompts and optimizing through prompt engineering. Use the [prompt engineering guides](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview) to write the most effective prompts.
-   Add additional [tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) to the prompt (which can include [prompt chains](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#chain-complex-prompts)) and see if you can achieve the functionality required.

If your chatbot handles incredibly varied tasks, you might want to consider adding a [separate intent classifier](https://platform.claude.com/cookbook/capabilities-classification-guide) to route the initial customer query. For the existing application, this would involve creating a decision tree that would route customer queries through the classifier and then to specialized conversations (with their own set of tools and system prompts). Note that this method requires an additional call to Claude that can increase latency.

### Integrate Claude into your support workflow

Although these examples have focused on Python functions callable within a Streamlit environment, deploying Claude for a real-time support chatbot requires an API service.

Here’s how you can approach this:

1.  Create an API wrapper: Develop a simple API wrapper around your classification function. For example, you can use Flask or FastAPI to wrap your code into an HTTP service. Your HTTP service could accept the user input and return the Assistant response in its entirety. Thus, your service could have the following characteristics:
    
    -   Server-Sent Events (SSE): SSE allows for real-time streaming of responses from the server to the client. This provides a smooth, interactive experience when working with LLMs.
    -   Caching: Implementing caching can improve response times and reduce unnecessary API calls.
    -   Context retention: Maintaining context when a user navigates away and returns is important for continuity in conversations.
2.  Build a web interface: Implement a user-friendly web UI for interacting with the Claude-powered agent.
    

## Next steps

Give Claude access to your APIs so it can take action on behalf of customers.

Build evaluations to measure your support agent against the success criteria you defined.

Stream responses so customers see answers as they generate.

Refine your system prompt and examples for better task performance.
