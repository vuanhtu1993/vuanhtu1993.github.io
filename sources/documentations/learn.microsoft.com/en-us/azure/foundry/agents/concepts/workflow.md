---
title: "Build a workflow in Microsoft Foundry - Microsoft Foundry"
source_url: "https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/workflow"
crawled_at: "2026-06-27T11:25:35.666Z"
---

Workflows are UI-based tools in Microsoft Foundry. Use them to create declarative, predefined sequences of actions that orchestrate agents and business logic in a visual builder.

Workflows enable you to build intelligent automation systems that seamlessly blend AI agents with business processes in a visual manner. Traditional single-agent systems are limited in their ability to handle complex, multifaceted tasks. By orchestrating multiple agents, each powered by a Foundry model with specialized skills or roles, you can create systems that are more robust, adaptive, and capable of solving real-world problems collaboratively.

-   An Azure account with an active subscription. If you don't have one, create a [free Azure account, which includes a free trial subscription](https://azure.microsoft.com/pricing/purchase-options/azure-account?cid=msft_learn_ddeb7e80-91bc-6793-873b-e49babed7a32).
-   A project in Microsoft Foundry. For more information, see [Create projects](https://learn.microsoft.com/en-us/azure/foundry/how-to/create-projects).
-   Access to create and run workflows in your Foundry project. For more information, see [Azure role-based access control (RBAC) in Foundry](https://learn.microsoft.com/en-us/azure/foundry/concepts/rbac-foundry).

Workflows are ideal for scenarios where you need to:

-   Orchestrate multiple agents in a repeatable process.
-   Add branching logic (for example, if/else) and variable handling without writing code.
-   Create human-in-the-loop steps (for example, approvals or clarifying questions).

If you want to edit workflow YAML in Visual Studio Code or run workflows in a local playground, see:

-   [Work with Declarative (Low-code) Agent workflows in Visual Studio Code](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/vs-code-agents-workflow-low-code)
-   [Work with Hosted (Pro-code) Agent workflows in Visual Studio Code](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/vs-code-agents-workflow-pro-code)

Foundry provides templates for common orchestration patterns. Start with a blank workflow or select a template:

| Pattern | Description | Typical use case |
| --- | --- | --- |
| Human in the loop | Asks the user a question and awaits user input to proceed | Creating approval requests during workflow execution and waiting for human approval, or obtaining information from the user |
| Sequential | Passes the result from one agent to the next in a defined order | Step-by-step workflows, pipelines, or multiple-stage processing |
| Group chat | Dynamically passes control between agents based on context or rules | Dynamic workflows, escalation, fallback, or expert handoff scenarios |

For more information, see [Microsoft Agent Framework workflow orchestrations](https://learn.microsoft.com/en-us/agent-framework/user-guide/workflows/orchestrations/overview).

This procedure shows how to create a sequential workflow. The same general steps apply to other workflow types.

1.  Sign in to [Microsoft Foundry](https://ai.azure.com/?cid=learnDocs). Make sure the **New Foundry** toggle is on. These steps refer to **Foundry (new)**.
    
    ![](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782559534/aha-mind/docs-crawler/learn.microsoft.com/new-foundry_hhqecn.png)
    
2.  On the upper-right menu, select **Build**.
    
3.  Select **Create new workflow** > **Sequential**.
    
4.  Assign an agent to the agent nodes by selecting each agent node in the workflow and either selecting the desired agent or creating a new one. For more information, see [Add agents](#add-agents) later in this article.
    
5.  Select **Save** in the visualizer to save the changes.
    
    Important
    
    Foundry doesn't save workflows automatically. Select **Save** after every change to preserve your work.
    
6.  Select **Run Workflow**.
    
7.  Interact with the workflow in the chat window.
    
8.  Optionally, add new nodes to your workflow. The next section in this article provides information about nodes.
    

After you select **Run Workflow**, verify that:

-   Each node completes in the visualizer.
-   You see the expected responses in the chat window.
-   Any variables you save (for example, JSON output from an agent node) contain the values you expect.

Nodes are the building blocks of your workflow. Each node performs a specific action in sequence.

Common node types include:

-   **Agent**: Invoke an agent.
-   **Logic**: Use _if/else_, _go to_, or _for each_.
-   **Data transformation**: Set a variable or parse a value.
-   **Basic chat**: Send a message or ask a question to an agent.

When you select a prebuilt workflow, the builder displays the nodes in sequence. To reorder nodes, select the three dots on a node and then select **move**. To add nodes, select the plus (**+**) icon in the workspace.

Add any Foundry agent from your project to the workflow. Agent nodes also let you create new agents with customized capabilities by configuring their model, prompt, and tools.

For advanced agent creation options, go to the **Foundry Agent** tab in the Foundry portal.

Note

Hosted agents aren't supported in the workflow designer. To coordinate tasks, call other agents, or orchestrate workflows within a Hosted agent, use [Microsoft Agent Framework workflows](https://learn.microsoft.com/en-us/agent-framework/workflows/) or another agent framework that supports workflow capabilities from your Hosted agent code.

1.  In the workflow visualizer, select the plus sign.
    
2.  In the pop-up dropdown list, select **Invoke agent**.
    
3.  In the **Create new agent** window, select **existing**.
    
4.  Enter the agent name to search for existing agents in your Foundry project.
    
5.  Select the desired agent to add it into your workflow.
    

1.  In the workflow visualizer, select the plus sign.
    
2.  In the pop-up dropdown list, select **Invoke agent**.
    
3.  Enter an agent name and description of what the agent does.
    
4.  Select **Add**.
    
5.  In the **Invoke an agent** window, configure the agent.
    
6.  Select **Save**.
    

To configure an agent to return structured JSON output:

1.  In the **Invoke agent** configuration window, select **Create a new agent**.
    
2.  Configure the agent to send output as a JSON schema:
    
    1.  Select **Details**.
    2.  Select the parameter icon.
    3.  For **Text format**, select **JSON Schema**.
    
    [![Screenshot that shows the window for configuring a JSON schema format for output.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782559534/aha-mind/docs-crawler/learn.microsoft.com/select-parameters_awny8v.png)](https://learn.microsoft.com/en-us/azure/foundry/media/workflows/select-parameters.png#lightbox)
    
3.  Copy the desired JSON schema and paste it in the **Add response format** window. The following screenshot shows a math example. Select **Save**.
    
    [![Screenshot that shows the addition of a response format in JSON.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782559534/aha-mind/docs-crawler/learn.microsoft.com/response-format_mo3od6.png)](https://learn.microsoft.com/en-us/azure/foundry/media/workflows/response-format.png#lightbox)
    

Important

Don't include secrets (passwords, keys, tokens) in JSON schemas, prompts, or saved workflow variables.

```
{
  "name": "math_response",
  "schema": {
    "type": "object",
    "properties": {
      "steps": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "explanation": {
              "type": "string"
            },
            "output": {
              "type": "string"
            }
          },
          "required": [
            "explanation",
            "output"
          ],
          "additionalProperties": false
        }
      },
      "final_answer": {
        "type": "string"
      }
    },
    "additionalProperties": false,
    "required": [
      "steps",
      "final_answer"
    ]
  },
  "strict": true
}
```

1.  Select **Action settings**. Then select **Save output json\_object/json\_schema as**.
    
2.  Select **Create new variable**. Choose a variable name, and then select **Done**.
    
    [![Screenshot that shows options for creating a new variable in a Microsoft Foundry workflow.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782559535/aha-mind/docs-crawler/learn.microsoft.com/save-output_it9fp0.png)](https://learn.microsoft.com/en-us/azure/foundry/media/workflows/save-output.png#lightbox)
    

-   **YAML visualizer view**: Set the **YAML Visualizer View** toggle to **On** to store the workflow as a YAML file. Edit in either the visualizer or the YAML view. Saving creates a new version with full version history.
    
    Both the visualizer and YAML are editable. Changes to the YAML file appear immediately in the visualizer.
    
-   **Versioning**: Each save creates a new, unchangeable version. To view version history or delete older versions, open the **Version** dropdown list to the left of the **Save** button.
    
-   **Notes**: Add notes to the workflow visualizer for extra context. In the upper-left corner of the visualizer, select **Add note**.
    

Power Fx is a low-code language that uses Excel-like formulas. Use Power Fx to create complex logic that lets your agents manipulate data. For example, a Power Fx formula can set a variable value, parse a string, or evaluate a condition. For more information, see the [Power Fx overview](https://learn.microsoft.com/en-us/power-platform/power-fx/overview) and [formula reference](https://learn.microsoft.com/en-us/power-platform/power-fx/formula-reference-copilot-studio).

To use a variable in a Power Fx formula, you must add a prefix to its name to indicate the variable's scope:

-   For system variables, use `System.`
-   For local variables, use `Local.`

Here are the system variables:

| Name | Description |
| --- | --- |
| `Activity` | Information about the current activity |
| `Bot` | Information about the agent |
| `Conversation` | Information about the current conversation |
| `Conversation.Id` | Unique ID of the current conversation |
| `Conversation.LocalTimeZone` | Time zone of the user, in the IANA Time Zone Database format |
| `Conversation.LocalTimeZoneOffset` | Time offset from UTC for the current local time zone |
| `Conversation.InTestMode` | Boolean flag that represents if the conversation is happening on a test canvas |
| `ConversationId` | Unique ID of the current conversation |
| `InternalId` | Internal identifier for the system |
| `LastMessage` | Information about the previous message that the user sent |
| `LastMessage.Id` | ID of the previous message that the user sent |
| `LastMessage.Text` | Previous message that the user sent |
| `LastMessageId` | ID of the previous message that the user sent |
| `LastMessageText` | Previous message that the user sent |
| `Recognizer` | Information about intent recognition and the triggering message |
| `User` | Information about the user currently talking to the agent |
| `User.Language` | User language locale per conversation |
| `UserLanguage` | User language locale per conversation |

In addition to using variables in a Power Fx formula, you can enter literal values. To use a literal value in a formula, you must enter it in the format that corresponds to its [type](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-variables-about?tabs=webApp).

The following table lists the data types and the format of their corresponding literal values:

| Type | Format examples |
| --- | --- |
| String | `"hi"`, `"hello world!"`, `"copilot"` |
| Boolean | Only `true` or `false` |
| Number | `1`, `532`, `5.258`,`-9201` |
| Record and table | `[1]`, `[45, 8, 2]`, `["cats", "dogs"]`, `{ id: 1 }`, `{ message: "hello" }`, `{ name: "John", info: { age: 25, weight: 175 } }` |
| Date and time | `Time(5,0,23)`, `Date(2022,5,24)`, `DateTimeValue("May 10, 2022 5:00:00 PM")` |
| Choice | Not supported |
| Blank | Only `Blank()` |

The following table lists the Power Fx formulas that you can use with each data type.

| Type | Power Fx formulas |
| --- | --- |
| String | [Text function](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-text)  
[Concat and Concatenate functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-concatenate)  
[Len function](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-len)  
[Lower, Upper, and Proper functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-lower-upper-proper)  
[IsMatch, Match, and MatchAll functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-ismatch)  
[EndsWith and StartsWith functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-startswith)  
[Find function](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-find)  
[Replace and Substitute function](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-replace-substitute) |
| Boolean | [Boolean function](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-boolean)  
[And, Or, and Not functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-logicals)  
[If and Switch functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-if) |
| Number | [Decimal, Float, and Value functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-value)  
[Int, Round, RoundDown, RoundUp, and Trunc functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-round) |
| Record and table | [Concat and Concatenate functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-concatenate)  
[Count, CountA, CountIf, and CountRows functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-table-counts)  
[ForAll function](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-forall)  
[First, FirstN, Index, Last, and LastN functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-first-last)  
[Filter, Search, and LookUp functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-filter-lookup)  
[JSON function](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-json)  
[ParseJSON function](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-parsejson) |
| Date and time | [Date, DateTime, and Time functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-date-time)  
[DateValue, TimeValue, and DateTimeValue functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-datevalue-timevalue)  
[Day, Month, Year, Hour, Minute, Second, and Weekday functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-datetime-parts)  
[Now, Today, IsToday, UTCNow, UTCToday, IsUTCToday functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-now-today-istoday)  
[DateAdd, DateDiff, and TimeZoneOffset functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-dateadd-datediff)  
[Text function](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-text) |
| Blank | [Blank, Coalesce, IsBlank, and IsEmpty functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-isblank-isempty)  
[Error, IfError, IsError, IsBlankOrError functions](https://learn.microsoft.com/en-us/power-platform/power-fx/reference/function-iferror) |

This example shows how to store and output a customer's name in capital letters:

1.  Create a workflow and add an **Ask a question** node.
    
2.  On the pane that appears, in the **Ask a question** box, enter **What is your name?** or another message. In the **Save user response as** box, enter a variable name; for example, `Var01`. Then select **Done**.
    
    [![Screenshot that shows the configuration of a question for sending a message.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782559534/aha-mind/docs-crawler/learn.microsoft.com/ask-a-question-node_pbfnsa.png)](https://learn.microsoft.com/en-us/azure/foundry/media/workflows/ask-a-question-node.png#lightbox)
    
3.  Add a **Send message** action. On the pane that appears, in the **Message to send** area, enter `{Upper(Local.Var01)}`. Then select **Done**.
    
    [![Screenshot that shows the variable instantiation for the action of sending a message.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782559534/aha-mind/docs-crawler/learn.microsoft.com/variable-message_wbeevb.png)](https://learn.microsoft.com/en-us/azure/foundry/media/workflows/variable-message.png#lightbox)
    
4.  Select **Preview**.
    
5.  On the preview pane, send a message to the agent to invoke the workflow.
    
    [![Screenshot that shows the preview of a question for the action of sending a message.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782559534/aha-mind/docs-crawler/learn.microsoft.com/type-question_hpbytp.png)](https://learn.microsoft.com/en-us/azure/foundry/media/workflows/type-question.png#lightbox)
    

This example shows how to add an if/else flow and build a condition with system variables.

1.  Create a workflow and add an **Ask a question** node.
    
2.  Select the **+** icon and add an **if/else** flow.
    
3.  Type `System.` in the **Condition** box to build a condition statement for each if/else branch.
    
    [![A screenshot showing the system variables in the if-else condition text box.](https://res.cloudinary.com/dv3vzmogk/image/upload/v1782559534/aha-mind/docs-crawler/learn.microsoft.com/if-else-condition_txylvf.png)](https://learn.microsoft.com/en-us/azure/foundry/media/workflows/if-else-condition.png#lightbox)
    
4.  Select a **Next Action** for the next step in the workflow.
    
5.  Select **Done**. Select **Save** to save your workflow.
    

| Issue | Solution |
| --- | --- |
| **Workflows** option not visible or can't create/edit workflows | Confirm you have the **Contributor** role or higher on your project. See [Azure role-based access control (RBAC) in Foundry](https://learn.microsoft.com/en-us/azure/foundry/concepts/rbac-foundry). |
| Changes don't appear after editing | Select **Save** in the visualizer. Foundry doesn't save changes automatically. |
| Workflow run produces unexpected output | Verify each agent node has an agent assigned. Check that saved outputs (JSON schema) are valid. |
| Power Fx formula error: "Name isn't valid" | Add the correct scope prefix. Use `System.` for system variables and `Local.` for local variables. |
| Power Fx formula error: "Type mismatch" | Verify the variable type matches the expected input. Use conversion functions like `Text()` or `Value()` if needed. |
| Workflow times out | Break complex workflows into smaller segments. Check that external services respond within expected timeframes. |

To delete a workflow you no longer need:

1.  Open the workflow in the Foundry portal.
2.  Select the **Version** dropdown list to the left of the **Save** button.
3.  Select **Delete** for the version you want to remove.

-   [Foundry Agent Service FAQ](https://learn.microsoft.com/en-us/azure/foundry/agents/faq)
-   [Tool best practices for Foundry agents](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-best-practice)
-   [Work with Declarative (Low-code) Agent workflows in Visual Studio Code](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/vs-code-agents-workflow-low-code)
-   [Work with Hosted (Pro-code) Agent workflows in Visual Studio Code](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/vs-code-agents-workflow-pro-code)
