---
title: "Todo list - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/deepagents/frontend/todo-list"
crawled_at: "2026-06-17T14:58:34.522Z"
---

Not every agent interaction is a chat. Sometimes the agent is executing a multi-step plan, and the best way to show progress is a **todo list** that updates in real time. The deep agent todo list pattern reads a `todos` array directly from the agent’s state, rendering each item with its current status as the agent works through its plan. It’s a progress dashboard built on the same `useStream` hook you use for chat. It shows that agent state can power any UI, not just message bubbles.

## How it works

Deep agents include a built-in **`todos` state** that tracks task progress as the agent works through its plan. As the agent executes, it updates each todo’s status from `"pending"` to `"in_progress"` to `"completed"`. The [`useStream`](https://reference.langchain.com/javascript/langchain-react/index/useStream) hook exposes this state via `stream.values.todos`, and your UI renders it reactively. The flow looks like this:

1.  User submits a request
2.  Agent creates a plan and populates `todos` in its state
3.  Agent begins executing each todo transitions through `pending` → `in_progress` → `completed`
4.  `stream.values.todos` updates in real time as the agent progresses
5.  Your UI re-renders the todo list with current statuses

## Setting up `useStream`

No special configuration is needed. Point [`useStream`](https://reference.langchain.com/javascript/langchain-react/index/useStream) at your agent and read the `todos` from `stream.values`.

## Building the TodoList component

The todo list renders each item with a status icon, color coding, and visual styling that reflects the current state:

```
function TodoList({ todos }: { todos: Todo[] }) {
  const completed = todos.filter((t) => t.status === "completed").length;
  const percentage = todos.length
    ? Math.round((completed / todos.length) * 100)
    : 0;

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Agent Progress</h2>
        <span className="text-sm text-gray-500">
          {completed}/{todos.length} tasks
        </span>
      </div>

      <ProgressBar percentage={percentage} />

      <ul className="mt-4 space-y-2">
        {todos.map((todo, i) => (
          <TodoItem key={i} todo={todo} />
        ))}
      </ul>
    </div>
  );
}
```

## Progress bar

A visual progress bar gives users an at-a-glance summary of overall completion:

```
function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Progress</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

## Individual todo items

Each item gets a status icon, color-coded text, and strikethrough styling for completed tasks:

```
function TodoItem({ todo }: { todo: Todo }) {
  const config = {
    pending: {
      icon: "○",
      textClass: "text-gray-600",
      bgClass: "bg-gray-50",
      iconClass: "text-gray-400",
    },
    in_progress: {
      icon: "◉",
      textClass: "text-amber-800",
      bgClass: "bg-amber-50 border-amber-200",
      iconClass: "text-amber-500 animate-pulse",
    },
    completed: {
      icon: "✓",
      textClass: "text-green-800 line-through",
      bgClass: "bg-green-50 border-green-200",
      iconClass: "text-green-500",
    },
  };

  const style = config[todo.status];

  return (
    <li
      className={`flex items-start gap-3 rounded-md border px-3 py-2 ${style.bgClass}`}
    >
      <span className={`mt-0.5 text-lg leading-none ${style.iconClass}`}>
        {style.icon}
      </span>
      <span className={`text-sm ${style.textClass}`}>{todo.content}</span>
    </li>
  );
}
```

The `in_progress` icon uses `animate-pulse` to draw attention to the currently active task.

## Calculating progress

Derive progress metrics directly from the todos array:

```
const todos = stream.values?.todos ?? [];

const completed = todos.filter((t) => t.status === "completed").length;
const inProgress = todos.filter((t) => t.status === "in_progress").length;
const pending = todos.filter((t) => t.status === "pending").length;
const percentage = todos.length
  ? Math.round((completed / todos.length) * 100)
  : 0;
```

These values update reactively as the agent modifies its state, keeping the progress bar and counters in sync.

## Combining with chat messages

The todo list works alongside the regular chat interface. A practical layout shows the todo list as a persistent sidebar or header panel, with chat messages below:

```
function TodoAgentLayout() {
  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "deep_agent_todo_list",
  });

  const todos = stream.values?.todos ?? [];

  return (
    <div className="flex h-screen flex-col">
      {todos.length > 0 && (
        <div className="border-b bg-gray-50 p-4">
          <TodoList todos={todos} />
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {stream.messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))}
        </div>
      </main>

      <ChatInput
        onSubmit={(text) =>
          stream.submit({ messages: [{ type: "human", content: text }] })
        }
        isLoading={stream.isLoading}
      />
    </div>
  );
}
```

## Use cases

The todo list pattern fits any scenario where an agent executes a structured plan:

-   **Project planning**: agent breaks a project into tasks and works through them sequentially
-   **Research workflows**: each research question becomes a todo that the agent investigates and completes
-   **Data processing**: steps like ingestion, validation, transformation, and export each get their own todo
-   **Onboarding flows**: agent walks through setup steps, checking off each one as it configures services
-   **Report generation**: sections of a report become todos: gather data, analyze trends, write summary, format output

## Handling empty and loading states

Handle the initial state before the agent has created its plan:

```
function TodoList({ todos, isLoading }: { todos: Todo[]; isLoading: boolean }) {
  if (todos.length === 0 && !isLoading) {
    return null;
  }

  if (todos.length === 0 && isLoading) {
    return (
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="animate-spin">⟳</span>
          Agent is creating a plan...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      {/* ... full todo list rendering */}
    </div>
  );
}
```

## Best practices

-   **Show the todo list prominently**. It’s the primary progress indicator for plan-based agents. Don’t bury it below the fold.
-   **Animate status transitions**. Smooth transitions make the agent feel more responsive. Use CSS transitions on background color, text decoration, and opacity.
-   **Only highlight one `in_progress` item**. Agents typically work on one task at a time. If multiple items show as `in_progress`, the UI gets noisy. Consider only pulsing the first one.
-   **Collapse or dim completed items**. As the list grows, completed items become less relevant. Reduce their visual weight so users focus on what’s still happening.
-   **Show the progress percentage**. A single number like “67% complete” is immediately understandable, even from across the room.
-   **Keep the todo list in sync**. Because `stream.values` updates reactively, the todo list stays current automatically. Don’t add manual polling or refresh logic.

---
