---
title: "LangSmith Deployment - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/langchain/deploy"
crawled_at: "2026-06-17T14:48:43.733Z"
---

When you’re ready to deploy your LangChain agent to production, LangSmith provides a managed hosting platform designed for agent workloads. Traditional hosting platforms are built for stateless, short-lived web applications, while LangGraph is **purpose-built for stateful, long-running agents** that require persistent state and background execution. LangSmith handles the infrastructure, scaling, and operational concerns so you can deploy directly from your repository.

## Prerequisites

Before you begin, ensure you have the following:

-   A [GitHub account](https://github.com/)
-   A [LangSmith account](https://smith.langchain.com/?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=oss-langchain-deploy) (free to sign up)

## Deploy your agent

### 1\. Create a repository on GitHub

Your application’s code must reside in a GitHub repository to be deployed on LangSmith. Both public and private repositories are supported. For this quickstart, first make sure your app is LangGraph-compatible by following the [local server setup guide](https://docs.langchain.com/oss/javascript/langchain/studio). Then, push your code to the repository.

### 2\. Deploy to LangSmith

1

2

3

4

### 3\. Test your application in Studio

Once your application is deployed:

1.  Select the deployment you just created to view more details.
2.  Click the **Studio** button in the top right corner. Studio will open to display your graph.

### 4\. Get the API URL for your deployment

1.  In the **Deployment details** view in LangGraph, click the **API URL** to copy it to your clipboard.
2.  Click the `URL` to copy it to the clipboard.

### 5\. Test the API

You can now test the API:

-   JavaScript
    
-   Rest API
    

1.  Install LangGraph JS:

```
npm install @langchain/langgraph-sdk
```

2.  Send a message to the agent:

```
const { Client } = await import("@langchain/langgraph-sdk");

const client = new Client({ apiUrl: "your-deployment-url", apiKey: "your-langsmith-api-key" });

const streamResponse = client.runs.stream(
    null,    // Threadless run
    "agent", // Name of agent. Defined in langgraph.json.
    {
        input: {
            "messages": [
                { "role": "user", "content": "What is LangGraph?"}
            ]
        },
        streamMode: "messages",
    }
);

for await (const chunk of streamResponse) {
    console.log(`Receiving new event of type: ${chunk.event}...`);
    console.log(JSON.stringify(chunk.data));
    console.log("\n\n");
}
```

```
curl -s --request POST \
    --url <DEPLOYMENT_URL>/runs/stream \
    --header 'Content-Type: application/json' \
    --header "X-Api-Key: <LANGSMITH API KEY> \
    --data "{
        \"assistant_id\": \"agent\", `# Name of agent. Defined in langgraph.json.`
        \"input\": {
            \"messages\": [
                {
                    \"role\": \"human\",
                    \"content\": \"What is LangGraph?\"
                }
            ]
        },
        \"stream_mode\": \"updates\"
    }"
```

---
