import { StateGraph, MemorySaver, START, END } from "@langchain/langgraph";
import { RoadmapCrawlerState, RoadmapCrawlerStateType } from "./state";
import { fetchIndexNode } from "./nodes/fetch-index";
import { classifyNode } from "./nodes/classify";
import { crawlBatchNode } from "./nodes/crawl-batch";
import { parseNormalizeNode } from "./nodes/parse-normalize";
import { saveOutputNode } from "./nodes/save-output";

/**
 * Điều kiện rẽ nhánh kiểm soát vòng lặp crawl:
 * - Nếu còn roadmap trong pendingQueue và rateLimitRemaining vẫn còn đủ: tiếp tục crawl batch tiếp theo
 * - Nếu đã crawl hết hoặc quota bị cạn kiệt: chuyển sang bước parse và lưu trữ
 */
export function shouldContinue(state: RoadmapCrawlerStateType): string {
  if (state.pendingQueue && state.pendingQueue.length > 0) {
    if (state.rateLimitRemaining > 3) {
      return "crawlBatch";
    } else {
      console.warn("⚠️ Rate limit gần cạn, dừng crawl batch để bảo toàn quota và tiến hành xử lý dữ liệu hiện có.");
      return "parseNormalize";
    }
  }
  return "parseNormalize";
}

/**
 * Khởi tạo và biên dịch đồ thị luồng công việc LangGraph cho Roadmap Crawler Agent
 */
export function buildGraph() {
  const workflow = new StateGraph(RoadmapCrawlerState)
    .addNode("fetchIndex", fetchIndexNode)
    .addNode("classify", classifyNode)
    .addNode("crawlBatch", crawlBatchNode)
    .addNode("parseNormalize", parseNormalizeNode)
    .addNode("saveOutput", saveOutputNode)

    // Khởi đầu -> Lấy danh sách roadmaps -> Phân loại 4 nhóm
    .addEdge(START, "fetchIndex")
    .addEdge("fetchIndex", "classify")
    .addEdge("classify", "crawlBatch")

    // Vòng lặp có điều kiện xử lý từng batch
    .addConditionalEdges("crawlBatch", shouldContinue, {
      crawlBatch: "crawlBatch",
      parseNormalize: "parseNormalize",
    })

    // Parse nội dung -> Ghi file -> Kết thúc
    .addEdge("parseNormalize", "saveOutput")
    .addEdge("saveOutput", END);

  return workflow.compile({
    checkpointer: new MemorySaver(),
  });
}
