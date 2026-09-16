import { ParsedRoadmap, RoadmapCrawlerStateType } from "../state";
import { getCategoryForSlug, slugToTitle } from "../config";
import { buildHierarchicalRoadmap } from "../utils/graph-builder";

/**
 * Node: parseNormalize
 * 
 * Mục tiêu:
 * - Duyệt qua tất cả các file markdown đã tải về trong `crawledRaw`
 * - Kết hợp với `graphDataMap` (topology từ roadmap.sh API) thông qua `buildHierarchicalRoadmap`
 * - Tạo cấu trúc 3 tầng:
 *   1. modules: Cây phân cấp Modules chính kèm Subtopics con có thứ tự tuyến tính rõ ràng
 *   2. topics: Danh sách tổng hợp toàn bộ topics được làm giàu với order, parentTopic, prereqs
 *   3. graph: Cạnh nối đồ thị phục vụ trực quan hóa
 */
export const parseNormalizeNode = async (
  state: RoadmapCrawlerStateType
): Promise<Partial<RoadmapCrawlerStateType>> => {
  console.log("⚙️  [4/5] Đang phân tích Markdown và xây dựng cấu trúc đồ thị phân cấp...");

  const parsedRoadmaps: ParsedRoadmap[] = [];
  let totalTopics = 0;
  let totalModules = 0;
  let totalResources = 0;

  for (const [slug, rawTopics] of Object.entries(state.crawledRaw)) {
    const category = getCategoryForSlug(slug);
    const title = slugToTitle(slug);
    const graphData = state.graphDataMap?.[slug] || null;
    const llmGrouping = state.llmGroupingMap?.[slug] || undefined;

    // Xây dựng cây phân cấp và cấu trúc module lộ trình
    const { modules, topics, graph } = buildHierarchicalRoadmap(slug, rawTopics, graphData, llmGrouping);

    for (const t of topics) {
      totalResources += t.resources.length;
    }
    totalTopics += topics.length;
    totalModules += modules.length;

    parsedRoadmaps.push({
      slug,
      title,
      category,
      topicCount: topics.length,
      moduleCount: modules.length,
      modules,
      topics,
      graph,
      updatedAt: new Date().toISOString(),
    });
  }

  // Sắp xếp các roadmaps theo category rồi theo slug
  parsedRoadmaps.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.slug.localeCompare(b.slug);
  });

  console.log(
    `✅ Phân tích hoàn tất: ${parsedRoadmaps.length} roadmaps, ${totalModules} modules, ${totalTopics} topics, ${totalResources} tài nguyên học tập.`
  );

  return {
    parsedRoadmaps,
  };
};
