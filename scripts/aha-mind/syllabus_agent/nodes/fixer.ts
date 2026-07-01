import { SyllabusState } from "../state";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { geminiService } from "../../utils/gemini-service";

export async function fixerNode(state: SyllabusState): Promise<Partial<SyllabusState>> {
  console.log("--- 4. FIXER NODE ---");
  const { tsvOutput, validationError, retryCount } = state;

  const systemMsgText = `
Bạn là một chuyên gia sửa lỗi định dạng. 
Hệ thống vừa sinh ra cấu trúc Mindmap dạng Tab-indented nhưng bị lỗi thụt lề (nhảy cóc số lượng Tab).
Quy tắc BẮT BUỘC:
1. Thứ bậc cha con ĐƯỢC XÁC ĐỊNH DUY NHẤT bằng số lượng ký tự Tab (\\t) ở đầu dòng.
2. Cấp con thụt lùi vào đúng 1 Tab so với cấp cha. KHÔNG BAO GIỜ được nhảy cóc (Ví dụ: cha là 1 tab, con nhảy lên 3 tabs là SAI).
3. Sửa lại cấu trúc để tuân thủ hoàn toàn quy tắc trên.
4. KHÔNG sử dụng Markdown. CHỈ dùng chữ thuần và Tab (\\t).
5. CHỈ trả về cấu trúc TSV đã được sửa lỗi, KHÔNG giải thích, KHÔNG bọc trong markdown block.
`;
  const systemMsg = new SystemMessage(systemMsgText);

  const humanMsgText = `
[Cấu trúc TSV bị lỗi]
${tsvOutput}

[Chi tiết lỗi từ Validator]
${validationError}

Hãy sửa lại lỗi nhảy cóc Tab này và trả về kết quả hoàn chỉnh:
`;
  const humanMsg = new HumanMessage(humanMsgText);

  console.log(`Đang phân tích lỗi và sửa cấu trúc... (Lần thử: ${retryCount + 1})`);
  
  const response = await geminiService.invoke([systemMsg, humanMsg]);
  
  let fixedOutput = response.content as string;
  // Xóa markdown blocks nếu có
  fixedOutput = fixedOutput.replace(/```[a-z]*\n?/g, "").replace(/```\n?/g, "").trim();

  return { 
    tsvOutput: fixedOutput,
    retryCount: retryCount + 1,
    validationError: null // Reset error for the next validation check
  };
}
