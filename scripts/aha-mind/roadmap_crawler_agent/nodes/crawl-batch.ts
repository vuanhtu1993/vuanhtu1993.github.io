import { RawTopic, RoadmapCrawlerStateType, RoadmapGraphData } from "../state";
import { GitHubClient } from "../utils/github-client";
import { GITHUB_CONFIG } from "../config";

/**
 * Node: crawlBatch
 * 
 * Mục tiêu:
 * - Lấy một lô (batch) các roadmaps từ pendingQueue (mặc định 5 roadmaps/lần)
 * - Tải song song có kiểm soát toàn bộ file markdown nội dung của từng roadmap
 * - Tải Graph Topology (nodes & edges) từ roadmap.sh API để tái dựng cấu trúc phân cấp
 * - Cập nhật tiến độ trực quan (visual progress indicator)
 * - Xóa các slugs đã xử lý khỏi pendingQueue
 * - Hỗ trợ chế độ dry-run để kiểm tra logic mà không tốn băng thông
 */
export const crawlBatchNode = async (
  state: RoadmapCrawlerStateType
): Promise<Partial<RoadmapCrawlerStateType>> => {
  const batchSize = GITHUB_CONFIG.BATCH_SIZE;
  const currentBatch = state.pendingQueue.slice(0, batchSize);

  if (currentBatch.length === 0) {
    return { pendingQueue: [] };
  }

  const remainingAfter = state.pendingQueue.slice(batchSize);
  const totalCount = state.roadmapIndex.length;
  const processedCount = totalCount - state.pendingQueue.length;

  console.log(
    `⚡ [3/5] Đang xử lý lô (${processedCount + 1}-${processedCount + currentBatch.length}/${totalCount}): [${currentBatch.join(", ")}]`
  );

  const client = new GitHubClient();
  const newlyCrawled: Record<string, RawTopic[]> = {};
  const newlyGraphData: Record<string, RoadmapGraphData> = {};

  for (const slug of currentBatch) {
    const slugFiles = state.allTreeItems.filter((item) => item.slug === slug);

    if (slugFiles.length === 0) {
      console.warn(`⚠️  Roadmap "${slug}" không có file markdown nào trong content/. Bỏ qua.`);
      newlyCrawled[slug] = [];
      continue;
    }

    if (state.dryRun) {
      console.log(`  [DRY-RUN] Giả lập crawl "${slug}" (${slugFiles.length} topics)...`);
      newlyCrawled[slug] = slugFiles.map((f) => ({
        filename: f.filename,
        topicName: f.topicName,
        nodeId: f.nodeId,
        content: `# ${f.topicName}\n\nMô tả tóm tắt giả lập cho ${f.topicName}.\n\nVisit the following resources to learn more:\n\n- [@article@Official Guide](https://roadmap.sh/${slug})\n`,
        size: f.size,
      }));
      continue;
    }

    process.stdout.write(`  📥 Đang tải "${slug}" (${slugFiles.length} topics): `);
    const topicsPromise = client.fetchRoadmapFiles(slugFiles, (done, total) => {
      process.stdout.write(`\r  📥 Đang tải "${slug}" (${done}/${total} topics)...`);
    });

    // Gọi song song lấy Graph Topology từ roadmap.sh API
    const topologyPromise = client.fetchRoadmapTopology(slug);

    const [topics, topology] = await Promise.all([topicsPromise, topologyPromise]);
    console.log(` ✅ Xong!`);

    newlyCrawled[slug] = topics;
    if (topology) {
      newlyGraphData[slug] = topology;
    }
  }

  return {
    crawledRaw: newlyCrawled,
    graphDataMap: newlyGraphData,
    pendingQueue: remainingAfter,
    rateLimitRemaining: client.rateLimitRemaining,
  };
};
