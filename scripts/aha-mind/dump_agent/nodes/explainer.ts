import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { DumpState, Question } from "../state";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function explainerNode(state: DumpState): Promise<Partial<DumpState>> {
  console.log("--- 5. EXPLAINER ---");
  const { classifiedQuestions } = state;

  const llm = new ChatGoogleGenerativeAI({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    temperature: 0.1,
    maxRetries: 2,
  });

  const explainedQuestions: Question[] = [...classifiedQuestions];
  let isRateLimited = false;
  
  const questionsNeedingExplanation = explainedQuestions.filter(q => !q.explanation || q.explanation.trim() === "");
  console.log(`Có ${questionsNeedingExplanation.length} câu cần tạo giải thích.`);

  const batchSize = 10;
  for (let i = 0; i < questionsNeedingExplanation.length; i += batchSize) {
    if (isRateLimited) {
       console.log("Bỏ qua giải thích các câu còn lại do Rate Limit 429.");
       break;
    }

    console.log(`Đang giải thích batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(questionsNeedingExplanation.length / batchSize)}`);
    const batch = questionsNeedingExplanation.slice(i, i + batchSize);
    
    const batchDataForLLM = batch.map((q, idx) => ({
      index: idx,
      question: q.question_text,
      correct_answer: q.correct_answer
    }));

    const systemMsg = new SystemMessage(`
Bạn là một chuyên gia đào tạo AI-900.
Với mỗi câu hỏi trắc nghiệm sau, hãy viết một câu giải thích ngắn gọn, dễ hiểu (bằng tiếng Anh) tại sao đáp án đó là đúng.
Trọng tâm vào việc phân biệt với các khái niệm khác. 1-2 câu là đủ.

Định dạng trả về: JSON Array
[
  {
    "index": <index>,
    "explanation": "<Lời giải thích ngắn gọn>"
  }
]
Không bọc bằng ký hiệu markdown.
`);

    const humanMsg = new HumanMessage(`
[Batch câu hỏi]
${JSON.stringify(batchDataForLLM, null, 2)}
    `);

    try {
      await sleep(3000); // Thêm sleep tránh 429
      const response = await llm.invoke([systemMsg, humanMsg]);
      let output = response.content as string;
      output = output.replace(/\`\`\`json\n?/g, "").replace(/\`\`\`\n?/g, "").trim();
      
      const jsonArr = JSON.parse(output);
      for (const item of jsonArr) {
        if (item.index !== undefined && batch[item.index]) {
          batch[item.index].explanation = item.explanation;
        }
      }
    } catch (err: any) {
      console.error(`❌ Lỗi khi sinh giải thích batch:`, err.message || err);
      if (err?.message?.includes("429") || err?.message?.includes("Too Many Requests") || err?.message?.includes("quota")) {
         console.warn("⚠️ CẢNH BÁO: Đã chạm giới hạn API (Rate Limit 429). Dừng sinh giải thích và lưu kết quả hiện tại...");
         isRateLimited = true;
         break;
      }
    }
  }

  return { explainedQuestions };
}
