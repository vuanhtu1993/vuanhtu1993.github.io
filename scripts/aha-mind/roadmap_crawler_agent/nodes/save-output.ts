import { RoadmapCrawlerStateType } from "../state";
import { getDb, closeDb } from "../../lib/mongo";

/**
 * Node: saveOutput
 * 
 * Mục tiêu:
 * - Lưu toàn bộ dữ liệu lộ trình thu thập được vào MongoDB Atlas (Database: stories)
 * - Tách bạch dữ liệu thành 2 collections tối ưu:
 *   + roadmaps: Lưu metadata tổng quan, modules phân cấp và cấu trúc đồ thị graph
 *   + topics: Lưu chi tiết từng chủ đề (order, content, markdown description, resources)
 * - Tự động upsert theo slug để đảm bảo tính lũy kế và toàn vẹn dữ liệu
 * - Tuân thủ quy tắc chân trang: "Made by Anh Tu - Share to be share"
 */
export const saveOutputNode = async (
  state: RoadmapCrawlerStateType
): Promise<Partial<RoadmapCrawlerStateType>> => {
  console.log("💾 [5/5] Đang lưu trữ dữ liệu vào MongoDB Atlas...");

  if (state.dryRun) {
    console.log("⚡ [DRY-RUN] Bỏ qua việc lưu vào MongoDB.");
    return { outputPaths: [] };
  }

  const writtenPaths: string[] = [];

  try {
    const db = await getDb();
    const roadmapsCol = db.collection("roadmaps");
    const topicsCol = db.collection("topics");

    for (const rm of state.parsedRoadmaps) {
      console.log(`  📦 Đang lưu trữ lộ trình: ${rm.title} (${rm.slug})...`);

      // 1. Tách subtopics ra khỏi modules để lưu vào collection topics độc lập
      const topicDocs: any[] = [];
      const modulesWithoutSubtopics = (rm.modules || []).map((mod: any) => {
        const subtopics = mod.subtopics || [];
        for (let i = 0; i < subtopics.length; i++) {
          const t = subtopics[i];
          topicDocs.push({
            roadmapSlug: rm.slug,
            moduleId: mod.id,
            order: i,
            ...t,
          });
        }
        const { subtopics: _, ...modWithout } = mod;
        return modWithout;
      });

      const actualTopicCount = topicDocs.length || rm.topicCount || 0;
      const actualModuleCount = modulesWithoutSubtopics.length || rm.moduleCount || 0;

      // 2. Upsert document vào collection roadmaps
      await roadmapsCol.updateOne(
        { slug: rm.slug },
        {
          $set: {
            ...rm,
            modules: modulesWithoutSubtopics,
            topicCount: actualTopicCount,
            moduleCount: actualModuleCount,
            updatedAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );

      // 3. Thay thế các topics cũ bằng topics mới của roadmap này
      await topicsCol.deleteMany({ roadmapSlug: rm.slug });
      if (topicDocs.length > 0) {
        await topicsCol.insertMany(topicDocs);
      }

      const dbPath = `mongodb://stories/roadmaps/${rm.slug} (${actualModuleCount} modules, ${actualTopicCount} topics)`;
      writtenPaths.push(dbPath);
      console.log(`  ✅ Đã lưu ${rm.slug} thành công vào MongoDB.`);
    }

    console.log(`\n🎉 Đã đồng bộ thành công ${state.parsedRoadmaps.length} roadmaps vào MongoDB Atlas!`);
  } catch (error) {
    console.error("❌ Lỗi khi lưu vào MongoDB Atlas:", error);
    throw error;
  } finally {
    await closeDb();
  }

  return {
    outputPaths: writtenPaths,
  };
};
