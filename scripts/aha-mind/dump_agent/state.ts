import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";
import { z } from "zod";

// Zod schema for a single question
export const QuestionSchema = z.object({
  question_id: z.string(),
  question_text: z.string(),
  option_a: z.string().optional().default(""),
  option_b: z.string().optional().default(""),
  option_c: z.string().optional().default(""),
  option_d: z.string().optional().default(""),
  correct_answer: z.enum(["A", "B", "C", "D", "None"]).optional().default("None"),
  explanation: z.string().optional().default(""),
  domain: z.enum([
    "AI Workloads & Considerations",
    "Fundamental Principles of ML",
    "Computer Vision",
    "NLP",
    "Document Intelligence & Knowledge Mining",
    "Generative AI",
    "Unknown"
  ]).optional().default("Unknown"),
  difficulty: z.enum(["Easy", "Medium", "Hard", "Unknown"]).optional().default("Unknown"),
  source_file: z.string()
});

export type Question = z.infer<typeof QuestionSchema>;

export const DumpStateAnnotation = Annotation.Root({
  // Input
  pdfDirectory: Annotation<string>(),
  
  // Processing
  pdfFiles: Annotation<string[]>({
    reducer: (x, y) => y,
    default: () => [],
  }),
  rawTexts: Annotation<{ file: string, text: string }[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  parsedQuestions: Annotation<Question[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  uniqueQuestions: Annotation<Question[]>({
    reducer: (x, y) => y,
    default: () => [],
  }),
  classifiedQuestions: Annotation<Question[]>({
    reducer: (x, y) => y,
    default: () => [],
  }),
  explainedQuestions: Annotation<Question[]>({
    reducer: (x, y) => y,
    default: () => [],
  }),
  
  // Output
  csvOutputPath: Annotation<string>(),
  
  // Flow control
  validationError: Annotation<string | null>(),
  retryCount: Annotation<number>({
    reducer: (x, y) => y,
    default: () => 0,
  }),
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
});

export type DumpState = typeof DumpStateAnnotation.State;
