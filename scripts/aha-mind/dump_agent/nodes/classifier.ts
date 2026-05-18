import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { DumpState, Question } from "../state";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function classifierNode(state: DumpState): Promise<Partial<DumpState>> {
  console.log("--- 4. CLASSIFIER ---");
  const { uniqueQuestions } = state;

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.1,
    maxRetries: 2,
  });

  const classifiedQuestions: Question[] = [...uniqueQuestions];
  let isRateLimited = false;
  
  const batchSize = 10;
  for (let i = 0; i < classifiedQuestions.length; i += batchSize) {
    if (isRateLimited) {
       console.log("Bỏ qua các câu hỏi còn lại do Rate Limit 429.");
       break;
    }

    console.log(`Đang phân loại batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(classifiedQuestions.length / batchSize)}`);
    const batch = classifiedQuestions.slice(i, i + batchSize);
    
    const batchDataForLLM = batch.map((q, idx) => ({
      index: idx,
      question: q.question_text
    }));

    const systemMsg = new SystemMessage(`
Bạn là chuyên gia phân loại câu hỏi chứng chỉ AI-900.
Hãy phân loại từng câu hỏi vào MỘT trong các domain sau và đánh giá độ khó (Easy/Medium/Hard):

[Domains]
- AI Workloads & Considerations
- Fundamental Principles of ML
- Computer Vision
- NLP
- Document Intelligence & Knowledge Mining
- Generative AI

Định dạng trả về:
Trở về MẢNG JSON duy nhất, mỗi phần tử có:
{
  "index": <index của câu hỏi>,
  "domain": "<Một trong các domain trên>",
  "difficulty": "Easy" | "Medium" | "Hard"
}
Không kèm theo bất kỳ văn bản nào khác, không bọc markdown.
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
          batch[item.index].domain = item.domain;
          batch[item.index].difficulty = item.difficulty;
        }
      }
    } catch (err: any) {
      console.error(`❌ Lỗi khi phân loại batch:`, err.message || err);
      if (err?.message?.includes("429") || err?.message?.includes("Too Many Requests") || err?.message?.includes("quota")) {
         console.warn("⚠️ CẢNH BÁO: Đã chạm giới hạn API (Rate Limit 429). Dừng phân loại và lưu kết quả hiện tại...");
         isRateLimited = true;
         break;
      }
    }
  }

  return { classifiedQuestions };
}
