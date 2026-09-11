import fs from "fs";
import path from "path";
import { RoadmapCrawlerStateType } from "../state";
import { CATEGORY_LABELS, CategoryKey } from "../config";

/**
 * Node: saveOutput
 * 
 * Mục tiêu:
 * - Lưu toàn bộ dữ liệu ra thư mục output (mặc định: ./sources/roadmap-data)
 * - Tự động nạp và merge lũy kế các roadmap đã crawl trước đó
 * - Cấu trúc thư mục được tổ chức khoa học:
 *   + sources/roadmap-data/index.json: Bản đồ tổng thể tất cả roadmaps (kèm số modules và topics)
 *   + sources/roadmap-data/<category>/<slug>.json: Dữ liệu chi tiết từng roadmap (modules phân cấp, topics có order/parent, graph edges)
 *   + sources/roadmap-data/summary.md: Báo cáo tổng quan dạng Markdown kèm Mermaid diagram
 * - Tuân thủ quy tắc chân trang: "Made by Anh Tu - Share to be share"
 */
export const saveOutputNode = async (
  state: RoadmapCrawlerStateType
): Promise<Partial<RoadmapCrawlerStateType>> => {
  console.log("💾 [5/5] Đang lưu trữ dữ liệu ra đĩa...");

  if (state.dryRun) {
    console.log("⚡ [DRY-RUN] Bỏ qua việc ghi file ra đĩa.");
    return { outputPaths: [] };
  }

  const baseDir = path.resolve(process.cwd(), state.outputDir);
  const writtenPaths: string[] = [];

  // Đảm bảo thư mục gốc tồn tại
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  // 1. Quét và nạp các roadmap đã crawl trước đó trên đĩa để merge lũy kế
  const allRoadmapsMap = new Map<string, typeof state.parsedRoadmaps[0]>();
  const categoryKeys = ["role-based", "skill-based", "tool-platform", "best-practice"];

  for (const cat of categoryKeys) {
    const catDir = path.join(baseDir, cat);
    if (fs.existsSync(catDir)) {
      const files = fs.readdirSync(catDir).filter((f) => f.endsWith(".json"));
      for (const file of files) {
        try {
          const raw = fs.readFileSync(path.join(catDir, file), "utf-8");
          const existing = JSON.parse(raw);
          if (existing && existing.slug) {
            allRoadmapsMap.set(existing.slug, existing);
          }
        } catch {
          // Bỏ qua nếu file không hợp lệ
        }
      }
    }
  }

  // 2. Ghi từng file JSON cho mỗi roadmap trong đợt crawl này và cập nhật vào allRoadmapsMap
  for (const rm of state.parsedRoadmaps) {
    allRoadmapsMap.set(rm.slug, rm);

    const catDir = path.join(baseDir, rm.category);
    if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
    }

    const filePath = path.join(catDir, `${rm.slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(rm, null, 2), "utf-8");
    writtenPaths.push(filePath);
  }

  // 3. Phân nhóm toàn bộ roadmaps lũy kế theo category
  const categorizedRoadmaps: Record<string, typeof state.parsedRoadmaps> = {
    "role-based": [],
    "skill-based": [],
    "tool-platform": [],
    "best-practice": [],
  };

  let totalTopics = 0;
  let totalModules = 0;
  const allRoadmaps = Array.from(allRoadmapsMap.values()).sort((a, b) => a.slug.localeCompare(b.slug));

  for (const rm of allRoadmaps) {
    totalTopics += rm.topicCount;
    totalModules += rm.moduleCount || rm.modules?.length || 1;

    if (categorizedRoadmaps[rm.category]) {
      categorizedRoadmaps[rm.category].push(rm);
    } else {
      if (!categorizedRoadmaps["skill-based"]) {
        categorizedRoadmaps["skill-based"] = [];
      }
      categorizedRoadmaps["skill-based"].push(rm);
    }
  }

  // 4. Ghi master index.json
  const masterIndex = {
    generatedAt: new Date().toISOString(),
    sourceRepo: "kamranahmedse/developer-roadmap",
    totalRoadmaps: allRoadmaps.length,
    totalModules,
    totalTopics,
    categories: Object.entries(categorizedRoadmaps).map(([catKey, list]) => ({
      key: catKey,
      nameVi: CATEGORY_LABELS[catKey as CategoryKey]?.vi || catKey,
      nameEn: CATEGORY_LABELS[catKey as CategoryKey]?.en || catKey,
      count: list.length,
      roadmaps: list.map((rm) => ({
        slug: rm.slug,
        title: rm.title,
        moduleCount: rm.moduleCount || rm.modules?.length || 1,
        topicCount: rm.topicCount,
        filePath: `${rm.category}/${rm.slug}.json`,
      })),
    })),
  };

  const indexPath = path.join(baseDir, "index.json");
  fs.writeFileSync(indexPath, JSON.stringify(masterIndex, null, 2), "utf-8");
  writtenPaths.push(indexPath);

  // 5. Ghi file tổng quan Markdown (summary.md) với Mermaid Diagram
  const summaryLines: string[] = [
    "# Tổng Quan Dữ Liệu Lộ Trình Phát Triển (Developer Roadmaps)",
    "",
    "> Dữ liệu được thu thập tự động từ mã nguồn mở [roadmap.sh](https://github.com/kamranahmedse/developer-roadmap) nhằm phục vụ công tác đào tạo, xây dựng giáo trình và viết bài kỹ thuật chuyên sâu.",
    "",
    "## 1. Thống Kê Tổng Quan",
    "",
    `- **Tổng số Lộ trình (Roadmaps):** ${allRoadmaps.length}`,
    `- **Tổng số Modules (Phân cấp):** ${totalModules}`,
    `- **Tổng số Chủ đề (Topics):** ${totalTopics}`,
    `- **Thời gian tạo:** ${new Date().toLocaleString("vi-VN")}`,
    "",
    "## 2. Bản Đồ Phân Loại (Mermaid Graph)",
    "",
    "```mermaid",
    "graph TD",
    '    Root["Developer Roadmaps Knowledge Base"]',
  ];

  for (const [key, list] of Object.entries(categorizedRoadmaps)) {
    const label = CATEGORY_LABELS[key as CategoryKey]?.vi || key;
    const safeKey = key.replace(/[^a-zA-Z0-9]/g, "_");
    summaryLines.push(`    Root --> Node_${safeKey}["${label} (${list.length})"]`);
  }

  summaryLines.push("```", "", "## 3. Danh Sách Chi Tiết Theo Nhóm", "");

  for (const [key, list] of Object.entries(categorizedRoadmaps)) {
    const label = CATEGORY_LABELS[key as CategoryKey]?.vi || key;
    summaryLines.push(`### 🔹 ${label} (${list.length} roadmaps)`, "");
    summaryLines.push("| STT | Tên Lộ Trình (Title) | Slug | Số Modules | Số Topics | Đường Dẫn File JSON |");
    summaryLines.push("|:---:|:---|:---|:---:|:---:|:---|");

    list.forEach((rm, idx) => {
      summaryLines.push(
        `| ${idx + 1} | **${rm.title}** | \`${rm.slug}\` | ${rm.moduleCount || rm.modules?.length || 1} | ${rm.topicCount} | \`${rm.category}/${rm.slug}.json\` |`
      );
    });

    summaryLines.push("");
  }

  summaryLines.push("---", "", "*Made by Anh Tu - Share to be share*");

  const summaryPath = path.join(baseDir, "summary.md");
  fs.writeFileSync(summaryPath, summaryLines.join("\n"), "utf-8");
  writtenPaths.push(summaryPath);

  console.log(`\n🎉 Đã xuất thành công:`);
  console.log(`  📄 Master Index: ${indexPath}`);
  console.log(`  📊 Báo cáo Markdown: ${summaryPath}`);
  console.log(`  📁 Chi tiết ${state.parsedRoadmaps.length} roadmaps tại: ${baseDir}/\n`);

  return {
    outputPaths: writtenPaths,
  };
};
