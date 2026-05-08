import { SyllabusState } from "../state";

export async function validatorNode(state: SyllabusState): Promise<Partial<SyllabusState>> {
  console.log("--- 3. VALIDATOR NODE ---");
  const { tsvOutput } = state;
  
  if (!tsvOutput) {
    return { validationError: "TSV Output is empty." };
  }

  const lines = tsvOutput.split("\n");
  let prevTabCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue; // Bỏ qua dòng trống

    const tabMatch = line.match(/^\t+/);
    const tabCount = tabMatch ? tabMatch[0].length : 0;
    
    // Rule: Số lượng Tab hiện tại không được lớn hơn (Số lượng Tab trước đó + 1)
    if (tabCount > prevTabCount + 1) {
      const errorMsg = `Lỗi ở dòng ${i + 1}: Thụt lề nhảy cóc từ ${prevTabCount} tabs lên ${tabCount} tabs.\nNội dung dòng: "${line.trim()}"`;
      console.log(`❌ Validator phát hiện lỗi: ${errorMsg}`);
      return { validationError: errorMsg };
    }
    
    prevTabCount = tabCount;
  }

  console.log("✅ Cấu trúc Tab-indented hoàn toàn hợp lệ.");
  return { validationError: null };
}
