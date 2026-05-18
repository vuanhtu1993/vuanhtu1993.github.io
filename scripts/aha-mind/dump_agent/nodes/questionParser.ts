import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { DumpState, Question } from "../state";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function questionParserNode(state: DumpState): Promise<Partial<DumpState>> {
  console.log("--- 2. QUESTION PARSER ---");
  const { rawTexts, pdfDirectory } = state;

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.1,
    maxRetries: 2,
  });

  const parsedQuestions: Question[] = [];
  let isRateLimited = false;

  for (const { file, text } of rawTexts) {
    if (isRateLimited) {
       console.log(`Bỏ qua file ${file} do Rate Limit 429.`);
       continue;
    }
    
    console.log(`Đang parse câu hỏi từ file: ${file}`);
    const chunkSize = 15000;
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    let chunkIndex = 1;
    let fileFullyParsed = true;

    for (const chunk of chunks) {
      if (isRateLimited) {
        fileFullyParsed = false;
        break;
      }
      console.log(`  - Processing chunk ${chunkIndex++}/${chunks.length}`);
      
      const systemMsg = new SystemMessage(`
Bạn là một chuyên gia trích xuất dữ liệu từ văn bản (Data Extractor).
Nhiệm vụ của bạn là đọc đoạn văn bản được trích xuất từ file PDF (có thể bị lỗi format, lộn xộn) và tìm ra TẤT CẢ các câu hỏi trắc nghiệm.

Văn bản thuộc đề thi chứng chỉ Microsoft AI-900.

Định dạng trả về:
Hãy trả về DUY NHẤT một mảng JSON các object câu hỏi. Không giải thích, không bọc trong markdown (như \`\`\`json).
Mỗi object có cấu trúc:
{
  "question_text": "Nội dung câu hỏi",
  "option_a": "Nội dung đáp án A",
  "option_b": "Nội dung đáp án B",
  "option_c": "Nội dung đáp án C (nếu có)",
  "option_d": "Nội dung đáp án D (nếu có)",
  "correct_answer": "A, B, C, hoặc D (Nếu không tìm thấy đáp án đúng, hãy đoán dựa trên kiến thức AI-900, hoặc để là None)",
  "explanation": "Giải thích đáp án nếu có trong text, nếu không có để chuỗi rỗng"
}

Lưu ý:
- Cố gắng dọn dẹp các ký tự thừa (như số trang, header, footer) bị dính vào câu hỏi.
- Nếu một câu hỏi bị cắt đứt giữa chunk này và chunk khác, cứ cố gắng parse phần có sẵn.
- Đảm bảo output là JSON valid (JSON array).
`);

      const humanMsg = new HumanMessage(`
[Đoạn văn bản từ file ${file}]
${chunk}

Hãy trả về JSON array:`);

      try {
        await sleep(3000); // Delay 3 giây để tránh Rate limit 429
        const response = await llm.invoke([systemMsg, humanMsg]);
        let output = response.content as string;
        
        output = output.replace(/\`\`\`json\n?/g, "").replace(/\`\`\`\n?/g, "").trim();
        
        const jsonArr = JSON.parse(output);
        if (Array.isArray(jsonArr)) {
          for (const item of jsonArr) {
            if (item.question_text && item.question_text.length > 10) {
              parsedQuestions.push({
                question_id: crypto.randomUUID().slice(0, 8),
                question_text: item.question_text,
                option_a: item.option_a || "",
                option_b: item.option_b || "",
                option_c: item.option_c || "",
                option_d: item.option_d || "",
                correct_answer: ["A", "B", "C", "D"].includes(item.correct_answer) ? item.correct_answer as any : "None",
                explanation: item.explanation || "",
                domain: "Unknown",
                difficulty: "Unknown",
                source_file: file
              });
            }
          }
        }
      } catch (err: any) {
        console.error(`  ❌ Lỗi khi parse chunk ${chunkIndex-1}:`, err.message || err);
        if (err?.message?.includes("429") || err?.message?.includes("Too Many Requests") || err?.message?.includes("quota")) {
           console.warn("⚠️ CẢNH BÁO: Đã chạm giới hạn API (Rate Limit 429). Dừng gọi API và lưu kết quả hiện tại...");
           isRateLimited = true;
           fileFullyParsed = false;
           break;
        }
      }
    }

    if (fileFullyParsed) {
      try {
        const processedDir = path.join(pdfDirectory, "processed");
        if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });
        
        const oldPath = path.join(pdfDirectory, file);
        const newPath = path.join(processedDir, file);
        if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            console.log(`✅ Đã chuyển file ${file} sang thư mục processed/`);
        }
      } catch (e) {
        console.error(`❌ Lỗi khi chuyển file:`, e);
      }
    }
  }

  console.log(`✅ Tổng cộng đã parse được ${parsedQuestions.length} câu hỏi thô.`);
  return { parsedQuestions };
}
