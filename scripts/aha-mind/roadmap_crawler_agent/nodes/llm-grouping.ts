import { z } from "zod";
import { RoadmapCrawlerStateType, GraphNode } from "../state";
import { geminiService } from "../../utils/gemini";
import { slugToTitle } from "../config";

/**
 * Zod Schema cho structured output từ Gemini:
 * Ánh xạ mỗi subtopic (theo ID) về một parent topic (theo ID)
 */
const GroupingOutputSchema = z.object({
  mappings: z.array(
    z.object({
      subtopicId: z.string().describe("ID chính xác của subtopic node"),
      subtopicLabel: z.string().describe("Tên hoặc label của subtopic"),
      parentTopicId: z.string().describe("ID chính xác của parent topic node được chọn từ danh sách ứng viên"),
      parentTopicLabel: z.string().describe("Tên hoặc label của parent topic được chọn"),
      reason: z.string().optional().describe("Lý do ngắn gọn cho việc gán nhóm theo chuyên môn"),
    })
  ).describe("Danh sách ánh xạ ngữ nghĩa giữa subtopic và parent topic"),
});

/**
 * Node: llmGroupingNode
 * 
 * Mục tiêu:
 * - Thay thế hoàn toàn cơ chế Spatial Proximity (toạ độ Y pixel dễ sai lệch).
 * - Sử dụng Gemini Service để hiểu ngữ cảnh kỹ thuật sâu:
 *   Ví dụ: SSR, CSR, SPA, SSG thuộc về "Rendering Strategies",
 *          Vitest, Jest, Playwright thuộc về "Testing" hoặc topic kiểm thử tương ứng.
 * - Giữ nguyên các dashed edges đã có sẵn từ roadmap.sh API (ground-truth).
 * - Trả về `llmGroupingMap` ánh xạ `{ [slug]: { [subtopicId]: parentTopicId } }`.
 */
export const llmGroupingNode = async (
  state: RoadmapCrawlerStateType
): Promise<Partial<RoadmapCrawlerStateType>> => {
  console.log("🧠 [3.5/5] Đang phân tích ngữ nghĩa và gom nhóm Cha - Con bằng Gemini LLM...");

  const llmGroupingMap: Record<string, Record<string, string>> = {};

  for (const slug of Object.keys(state.crawledRaw)) {
    const graphData = state.graphDataMap?.[slug];
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
      console.log(`  ⏩ Roadmap "${slug}" không có dữ liệu graph topology, bỏ qua LLM grouping.`);
      continue;
    }

    const { nodes, edges } = graphData;
    const nodeMap = new Map<string, GraphNode>();
    for (const n of nodes) {
      nodeMap.set(n.id, n);
    }

    // 1. Thu thập các quan hệ có sẵn từ dashed edges và parentId (Ground Truth)
    const knownParentMap = new Map<string, string>(); // subtopicId -> parentTopicId
    const dashedEdges = edges.filter((e) => e.data?.edgeStyle === "dashed");

    for (const e of dashedEdges) {
      knownParentMap.set(e.target, e.source);
    }

    for (const n of nodes) {
      if (n.parentId && n.type === "subtopic") {
        knownParentMap.set(n.id, n.parentId);
      }
    }

    // 2. Xác định danh sách Candidate Parent Topics
    // Loại trừ các node trang trí như title, paragraph, button, section, horizontal, vertical
    const excludedTypes = new Set(["title", "paragraph", "button", "section", "horizontal", "vertical", "label", "linksgroup"]);
    const candidateTopics = nodes.filter((n) => {
      if (excludedTypes.has(n.type)) return false;
      // Là source trong dashed edge HOẶC là topic node
      if (dashedEdges.some((e) => e.source === n.id)) return true;
      if (n.type === "topic") return true;
      return false;
    });

    const candidateTopicIds = new Set(candidateTopics.map((t) => t.id));

    // 3. Xác định các Subtopic "Mồ Côi" (chưa có dashed edge nào kết nối)
    const subtopicNodes = nodes.filter((n) => n.type === "subtopic");
    const orphanSubtopics = subtopicNodes.filter((s) => !knownParentMap.has(s.id));

    console.log(
      `  🗺️  Roadmap "${slug}": ${candidateTopics.length} Candidate Topics, ${subtopicNodes.length} Subtopics (${knownParentMap.size} đã có cạnh nối, ${orphanSubtopics.length} mồ côi cần LLM xử lý).`
    );

    // Bắt đầu tổng hợp map kết quả
    const finalSlugMap: Record<string, string> = {};
    for (const [subId, parentId] of knownParentMap.entries()) {
      finalSlugMap[subId] = parentId;
    }

    // Nếu không có subtopic mồ côi, hoàn tất roadmap này
    if (orphanSubtopics.length === 0) {
      llmGroupingMap[slug] = finalSlugMap;
      continue;
    }

    // Nếu ở chế độ DRY-RUN, giả lập mapping mà không tốn API call
    if (state.dryRun) {
      console.log(`  [DRY-RUN] Giả lập gán nhóm LLM cho ${orphanSubtopics.length} subtopics của "${slug}"...`);
      for (const orphan of orphanSubtopics) {
        // Gán giả lập vào candidate topic đầu tiên
        finalSlugMap[orphan.id] = candidateTopics[0]?.id || "default-topic";
      }
      llmGroupingMap[slug] = finalSlugMap;
      continue;
    }

    // 4. Chuẩn bị Prompt cho Gemini Service
    const roadmapTitle = slugToTitle(slug);

    const candidateListStr = candidateTopics
      .map((t) => {
        const label = t.data?.label || slugToTitle(t.id);
        return `- [ID: ${t.id}] "${label}"`;
      })
      .join("\n");

    const orphanListStr = orphanSubtopics
      .map((s) => {
        const label = s.data?.label || slugToTitle(s.id);
        return `- [ID: ${s.id}] "${label}"`;
      })
      .join("\n");

    const examplesStr = Array.from(knownParentMap.entries())
      .slice(0, 8)
      .map(([subId, parentId]) => {
        const subLabel = nodeMap.get(subId)?.data?.label || subId;
        const parentLabel = nodeMap.get(parentId)?.data?.label || parentId;
        return `  * "${subLabel}" -> "${parentLabel}"`;
      })
      .join("\n");

    const prompt = `Bạn là một Kiến trúc sư Hệ thống & Giảng viên Đào tạo Lập trình viên Cao cấp.
Chúng ta đang chuẩn hóa cấu trúc cây phân cấp (Hierarchy) cho lộ trình kỹ thuật: "${roadmapTitle}".

Dưới đây là:
1. DANH SÁCH CHỦ ĐỀ CHA HỢP LỆ (Candidate Parent Topics):
${candidateListStr}

2. DANH SÁCH CÁC CHỦ ĐỀ CON MỒ CÔI CẦN GOM NHÓM (Orphan Subtopics):
${orphanListStr}

${examplesStr ? `3. CÁC VÍ DỤ ĐÃ ĐƯỢC XÁC THỰC TRƯỚC ĐÓ TRONG LỘ TRÌNH NÀY:\n${examplesStr}\n` : ""}

NHIỆM VỤ CỦA BẠN:
- Dựa trên kiến thức chuyên môn sâu về ${roadmapTitle} và quy chuẩn công nghệ thực tế, hãy phân loại TỪNG chủ đề con mồ côi vào đúng chủ đề cha phù hợp nhất về mặt ngữ nghĩa và logic sư phạm.
- VÍ DỤ CỤ THỂ ĐIỂN HÌNH:
  * Trong Next.js: "SSR", "CSR", "SPA", "SSG" BẮT BUỘC phải thuộc về "Rendering Strategies" (hoặc topic tương đương về Rendering), TUYỆT ĐỐI KHÔNG gán vào "create-next-app".
  * "Node.js", "Edge" phải thuộc về "Runtimes and Types" (hoặc "Rendering" / "Server").
  * "CSS Modules", "Tailwind CSS", "Sass", "CSS in JS" phải thuộc về "Styling" hoặc "Composition".
  * "Vitest", "Jest", "Playwright", "Cypress" phải thuộc về "Testing" hoặc topic kiểm thử/deployment phù hợp.
- YÊU CẦU BẮT BUỘC:
  * parentTopicId BẮT BUỘC PHẢI LÀ MỘT TRONG CÁC ID CÓ TRONG "DANH SÁCH CHỦ ĐỀ CHA HỢP LỆ". Tuyệt đối không tự bịa ID.
  * Phải gán đủ cho toàn bộ ${orphanSubtopics.length} chủ đề con mồ côi.`;

    try {
      console.log(`  🤖 Đang gọi Gemini Service gom nhóm ${orphanSubtopics.length} subtopics cho "${slug}"...`);
      const response = await geminiService.invokeStructured(GroupingOutputSchema, prompt);

      let matchedCount = 0;
      if (response && Array.isArray(response.mappings)) {
        for (const item of response.mappings) {
          if (item.subtopicId && item.parentTopicId && candidateTopicIds.has(item.parentTopicId)) {
            finalSlugMap[item.subtopicId] = item.parentTopicId;
            matchedCount++;
          }
        }
      }

      // Xử lý các subtopic còn sót (nếu LLM bỏ quên) bằng fallback an toàn
      let fallbackCount = 0;
      for (const orphan of orphanSubtopics) {
        if (!finalSlugMap[orphan.id]) {
          let closestCandidate = candidateTopics[0];
          let minDy = Infinity;
          for (const c of candidateTopics) {
            const dy = Math.abs(c.position.y - orphan.position.y);
            if (dy < minDy) {
              minDy = dy;
              closestCandidate = c;
            }
          }
          finalSlugMap[orphan.id] = closestCandidate.id;
          fallbackCount++;
        }
      }

      console.log(
        `  ✨ Hoàn tất gom nhóm "${slug}": ${matchedCount}/${orphanSubtopics.length} gán bởi LLM, ${fallbackCount} fallback.`
      );
    } catch (err) {
      console.error(`  ⚠️ Lỗi khi gọi Gemini cho "${slug}", sử dụng fallback:`, err);
      for (const orphan of orphanSubtopics) {
        let closestCandidate = candidateTopics[0];
        let minDy = Infinity;
        for (const c of candidateTopics) {
          const dy = Math.abs(c.position.y - orphan.position.y);
          if (dy < minDy) {
            minDy = dy;
            closestCandidate = c;
          }
        }
        finalSlugMap[orphan.id] = closestCandidate?.id || "fallback-topic";
      }
    }

    llmGroupingMap[slug] = finalSlugMap;
  }

  return {
    llmGroupingMap,
  };
};
