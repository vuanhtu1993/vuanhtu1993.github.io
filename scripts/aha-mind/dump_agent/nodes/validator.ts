import { DumpState } from "../state";
import { QuestionSchema } from "../state";

export async function validatorNode(state: DumpState): Promise<Partial<DumpState>> {
  console.log("--- 6. VALIDATOR ---");
  const { explainedQuestions } = state;

  let validationError = null;

  for (const q of explainedQuestions) {
    const result = QuestionSchema.safeParse(q);
    if (!result.success) {
      console.error(`❌ Lỗi schema tại câu hỏi ${q.question_id}:`, result.error.errors);
      validationError = "Dữ liệu không hợp lệ theo Schema.";
      break;
    }
  }

  if (validationError) {
    return {
      validationError,
      retryCount: state.retryCount + 1
    };
  }

  console.log("✅ Validation thành công.");
  return { validationError: null };
}
