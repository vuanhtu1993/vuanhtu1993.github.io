import { RoadmapCrawlerStateType, RoadmapMeta } from "../state";
import { CATEGORY_LABELS, CategoryKey } from "../config";

/**
 * Node: classifyRoadmaps
 * 
 * Mục tiêu:
 * - Phân loại toàn bộ các roadmaps vào 4 nhóm chuẩn của roadmap.sh:
 *   1. role-based (Lộ trình vị trí nghề nghiệp)
 *   2. skill-based (Kỹ năng, ngôn ngữ, framework)
 *   3. tool-platform (Công cụ, nền tảng, cơ sở dữ liệu)
 *   4. best-practice (Quy chuẩn kiến trúc, thực hành tốt nhất)
 * - Hiển thị tổng quan số lượng trước khi bước vào giai đoạn tải chi tiết.
 */
export const classifyNode = async (
  state: RoadmapCrawlerStateType
): Promise<Partial<RoadmapCrawlerStateType>> => {
  console.log("📂 [2/5] Đang phân loại danh mục Roadmaps vào 4 nhóm kiến trúc...");

  const classifiedMap: Record<string, RoadmapMeta[]> = {
    "role-based": [],
    "skill-based": [],
    "tool-platform": [],
    "best-practice": [],
  };

  for (const item of state.roadmapIndex) {
    const cat = item.category as CategoryKey;
    if (classifiedMap[cat]) {
      classifiedMap[cat].push(item);
    } else {
      // Fallback nếu có category khác
      if (!classifiedMap["skill-based"]) {
        classifiedMap["skill-based"] = [];
      }
      classifiedMap["skill-based"].push(item);
    }
  }

  // In bảng thống kê sư phạm rõ ràng
  console.log("\n📋 --- THỐNG KÊ DANH MỤC ROADMAPS ---");
  for (const [key, label] of Object.entries(CATEGORY_LABELS)) {
    const list = classifiedMap[key] || [];
    console.log(`  🔹 ${label.vi}: ${list.length} roadmaps`);
  }
  console.log("------------------------------------\n");

  return {
    classifiedMap,
  };
};
