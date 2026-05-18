import { DumpState, Question } from "../state";

export async function deduplicatorNode(state: DumpState): Promise<Partial<DumpState>> {
  console.log("--- 3. DEDUPLICATOR ---");
  const { parsedQuestions } = state;

  const uniqueQuestions: Question[] = [];
  const seenTexts = new Set<string>();

  for (const q of parsedQuestions) {
    const normalized = q.question_text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 100);

    if (!seenTexts.has(normalized)) {
      seenTexts.add(normalized);
      uniqueQuestions.push(q);
    }
  }

  console.log(`✅ Lọc trùng lặp: ${parsedQuestions.length} -> ${uniqueQuestions.length} câu hỏi.`);

  return { uniqueQuestions };
}
