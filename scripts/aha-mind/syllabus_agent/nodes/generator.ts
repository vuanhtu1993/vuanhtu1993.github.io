import fs from "fs";
import { SyllabusState } from "../state";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { geminiService } from "../../utils/gemini";

export async function generatorNode(state: SyllabusState): Promise<Partial<SyllabusState>> {
  console.log("--- 2. GENERATOR NODE ---");
  const { syllabusMetaCsvPath, scheduleDetailCsvPath } = state;

  const syllabusContent = fs.readFileSync(syllabusMetaCsvPath, "utf8");
  const scheduleContent = fs.readFileSync(scheduleDetailCsvPath, "utf8");

  const systemMsgText = `
Bạn là một chuyên gia thiết kế chương trình học (Instructional Designer).
Nhiệm vụ của bạn là đọc 2 file CSV chứa thông tin Syllabus và Schedule của một khóa học, sau đó tổng hợp chúng thành một Sơ đồ tư duy dạng văn bản Tab-indented (TSV).
Quy tắc BẮT BUỘC:
1. Thứ bậc cha con ĐƯỢC XÁC ĐỊNH DUY NHẤT bằng số lượng ký tự Tab (\\t) ở đầu dòng.
2. Dòng ở cấp cao nhất (Tên khóa học) không có Tab.
3. Cấp con thụt lùi vào đúng 1 Tab so với cấp cha. KHÔNG BAO GIỜ được nhảy cóc từ 0 Tab lên 2 Tabs, hay 1 Tab lên 3 Tabs.
4. KHÔNG sử dụng Markdown formating (như #, -, *). KHÔNG sử dụng Mermaid.
5. CHỈ dùng chữ thuần và Tab (\\t).
6. CHỈ trả về cấu trúc phân cấp, KHÔNG giải thích hay thêm bất kỳ text nào khác.
`;
  const systemMsg = new SystemMessage(systemMsgText);

  const humanMsgText = `
[Thông tin chung của khóa học]
${syllabusContent}

[Lịch trình chi tiết]
${scheduleContent}

Hãy tạo Tab-indented Mindmap. Bắt đầu ngay với nội dung:
`;
  const humanMsg = new HumanMessage(humanMsgText);

  console.log("Đang tổng hợp thông tin và tạo cấu trúc TSV...");
  
  const response = await geminiService.invoke([systemMsg, humanMsg]);

  let tsvOutput = response.content as string;
  // Xóa các mã markdown thừa nếu LLM tự ý thêm vào
  tsvOutput = tsvOutput.replace(/```[a-z]*\n?/g, "").replace(/```\n?/g, "").trim();

  return { tsvOutput };
}
