import { Annotation } from "@langchain/langgraph";

export interface Article {
  title: string;
  link: string;
  content: string;
  pubDate: string;
}

export interface ExtractedTerm {
  word: string;
  explanation: string;
  cefrLevel: string;
  etymology: string;
  analogy: string;
}

export interface AhaMindState {
  // Input Config
  articleUrl: string;

  // Pipeline Data
  rawArticles: Article[];
  articleToProcess: Article | null;

  // LLM Results
  extractedTerms: ExtractedTerm[];

  // Final Output
  finalMdxContent: string;
}

export const StateAnnotation = Annotation.Root({
  articleUrl: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
    default: () => "",
  }),
  rawArticles: Annotation<Article[]>({
    reducer: (x, y) => y ?? x ?? [],
    default: () => [],
  }),
  articleToProcess: Annotation<Article | null>({
    reducer: (x, y) => (y !== undefined ? y : x),
    default: () => null,
  }),
  extractedTerms: Annotation<ExtractedTerm[]>({
    reducer: (x, y) => y ?? x ?? [],
    default: () => [],
  }),
  finalMdxContent: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
    default: () => "",
  })
});
