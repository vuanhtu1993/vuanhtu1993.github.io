import { RoadmapCrawlerStateType, RoadmapMeta } from "../state";
import { GitHubClient } from "../utils/github-client";
import { getCategoryForSlug, slugToTitle } from "../config";

/**
 * Node: fetchIndex
 * 
 * Mục tiêu:
 * - Gọi Git Trees API 1 lần duy nhất để lấy toàn bộ danh sách file markdown của tất cả roadmaps.
 * - Nhóm các file theo slug roadmap, tính số lượng topics.
 * - Nếu người dùng chỉ định targetSlugs (ví dụ: --slug frontend,backend), lọc chỉ giữ lại các slugs này.
 * - Chuẩn bị pendingQueue cho các bước crawl tiếp theo.
 */
export const fetchIndexNode = async (
  state: RoadmapCrawlerStateType
): Promise<Partial<RoadmapCrawlerStateType>> => {
  console.log("🔍 [1/5] Đang lấy danh mục toàn bộ Roadmaps từ GitHub Repository...");

  const client = new GitHubClient();

  try {
    const { items, rateLimitRemaining } = await client.fetchRoadmapsTree();

    // Nhóm items theo slug
    const filesBySlug = new Map<string, number>();
    for (const item of items) {
      filesBySlug.set(item.slug, (filesBySlug.get(item.slug) || 0) + 1);
    }

    // Xây dựng roadmap index
    let allSlugs = Array.from(filesBySlug.keys()).sort();

    // Lọc theo targetSlugs nếu người dùng có truyền vào
    if (state.targetSlugs && state.targetSlugs.length > 0) {
      const targets = new Set(state.targetSlugs.map((s) => s.trim().toLowerCase()));
      allSlugs = allSlugs.filter((s) => targets.has(s.toLowerCase()));

      console.log(`🎯 Đã áp dụng bộ lọc: chỉ crawl ${allSlugs.length} roadmap được chỉ định: [${allSlugs.join(", ")}]`);
    } else {
      console.log(`📊 Tìm thấy tổng cộng ${allSlugs.length} roadmaps với ${items.length} chủ đề (topics) trong repository.`);
    }

    const roadmapIndex: RoadmapMeta[] = allSlugs.map((slug) => ({
      slug,
      title: slugToTitle(slug),
      category: getCategoryForSlug(slug),
      treeSha: "",
      fileCount: filesBySlug.get(slug) || 0,
    }));

    return {
      roadmapIndex,
      allTreeItems: items,
      pendingQueue: [...allSlugs],
      rateLimitRemaining,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ [fetchIndex] Lỗi khi lấy cây thư mục roadmaps: ${message}`);
    return {
      errors: [`[fetchIndex] ${message}`],
      pendingQueue: [],
    };
  }
};
