export type HiveRole = "system" | "user" | "assistant";

export interface HiveMessage {
  role: HiveRole;
  content: string;
}

export interface HiveCallOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  name?: string;
}

export interface HiveTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  reasoningTokens?: number;
}

/**
 * Interface kết quả Invoke:
 * Bắt buộc có .content để tương thích 100% với các Node gọi `response.content` (translator.ts, questionParser.ts).
 */
export interface HiveInvokeResult {
  content: string;
  text: string;
  usage: HiveTokenUsage;
  reasoning?: string;
}

export interface HiveStructuredResult<T> {
  parsed: T;
  usage: HiveTokenUsage;
}

export interface HiveStreamChunk {
  content?: string;
  reasoning?: string;
  isDone: boolean;
  usage?: HiveTokenUsage;
}
