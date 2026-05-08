import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

export const SyllabusStateAnnotation = Annotation.Root({
  rawExcelPath: Annotation<string>(),
  syllabusMetaCsvPath: Annotation<string>(),
  scheduleDetailCsvPath: Annotation<string>(),
  tsvOutput: Annotation<string>(),
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

export type SyllabusState = typeof SyllabusStateAnnotation.State;
