import * as dotenv from "dotenv";
dotenv.config();

import { Command } from "commander";
import fs from "fs";
import path from "path";
import { buildGraph } from "./graph";

const program = new Command();

program
  .name("aha-mind:roadmap-crawler")
  .description("🗺️  Roadmap.sh Crawler Agent — Thu thập dữ liệu lộ trình phát triển kỹ thuật từ GitHub")
  .version("1.0.0");

// Lệnh chính: Crawl roadmaps
program
  .argument("[slugs]", "Chỉ crawl các roadmap cụ thể, phân cách bằng dấu phẩy (vd: react hoặc frontend,backend)")
  .option("-s, --slug <slugs>", "Chỉ crawl các roadmap cụ thể, phân cách bằng dấu phẩy (vd: frontend,backend,nextjs)", "")
  .option("-o, --output <dir>", "Đường dẫn thư mục lưu trữ dữ liệu", "./sources/roadmap-data")
  .option("--dry-run", "Chạy thử kiểm tra luồng đồ thị (chỉ log, không ghi file ra đĩa)", false)
  .action(async (slugsArg, options) => {
    console.log("================================================================================");
    console.log("🚀 KHỞI ĐỘNG ROADMAP.SH CRAWLER AGENT (LangGraph StateGraph)");
    console.log("================================================================================");

    const rawSlugs = slugsArg || options.slug || "";
    const targetSlugs = rawSlugs
      ? rawSlugs
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];

    const outputDir = options.output;
    const dryRun = Boolean(options.dryRun);

    if (targetSlugs.length > 0) {
      console.log(`🎯 Chỉ định crawl: ${targetSlugs.join(", ")}`);
    } else {
      console.log("🌐 Chế độ: Crawl toàn bộ các Roadmaps trong repository");
    }

    if (dryRun) {
      console.log("🧪 Đang ở chế độ DRY-RUN (không ghi file)");
    }
    console.log(`📁 Thư mục output: ${path.resolve(process.cwd(), outputDir)}\n`);

    const app = buildGraph();

    try {
      const startTime = Date.now();
      const finalState = await app.invoke(
        {
          targetSlugs,
          outputDir,
          dryRun,
        },
        {
          configurable: {
            thread_id: `roadmap-crawler-${Date.now()}`,
          },
        }
      );

      const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log("================================================================================");
      console.log(`✨ HOÀN TẤT TRONG ${durationSec} GIÂY!`);
      console.log(`📦 Tổng số roadmaps đã xử lý: ${finalState.parsedRoadmaps?.length || 0}`);
      console.log(`📄 Số file đã tạo: ${finalState.outputPaths?.length || 0}`);
      if (finalState.errors && finalState.errors.length > 0) {
        console.warn(`⚠️ Có ${finalState.errors.length} cảnh báo/lỗi trong quá trình chạy.`);
      }
      console.log("================================================================================");
    } catch (err) {
      console.error("❌ Đã xảy ra lỗi nghiêm trọng trong luồng thực thi:", err);
      process.exit(1);
    }
  });

// Lệnh phụ: Liệt kê dữ liệu đã crawl từ MongoDB Atlas
program
  .command("list")
  .description("Liệt kê các roadmaps đã lưu trong MongoDB Atlas")
  .action(async () => {
    try {
      const { getDb, closeDb } = await import("../lib/mongo");
      const db = await getDb();
      const roadmapsCol = db.collection("roadmaps");
      const topicsCol = db.collection("topics");

      const roadmaps = await roadmapsCol.find({}).sort({ category: 1, title: 1 }).toArray();
      const totalTopics = await topicsCol.countDocuments({});

      if (roadmaps.length === 0) {
        console.log("📭 Chưa tìm thấy dữ liệu roadmap trong MongoDB Atlas (database: stories).");
        console.log("👉 Hãy chạy: pnpm aha-mind:roadmap-crawler để bắt đầu crawl.");
        await closeDb();
        return;
      }

      console.log("\n================================================================================");
      console.log("📚 DANH SÁCH ROADMAPS TRONG MONGODB ATLAS (Database: stories)");
      console.log(`📊 Tổng số: ${roadmaps.length} roadmaps | ${totalTopics} topics`);
      console.log("================================================================================");

      // Nhóm theo category
      const categories: Record<string, any[]> = {};
      for (const rm of roadmaps) {
        const cat = rm.category || "other";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(rm);
      }

      for (const [cat, list] of Object.entries(categories)) {
        console.log(`\n📂 [${cat}] - ${list.length} roadmaps:`);
        for (const rm of list) {
          console.log(`  - 🗺️  ${(rm.title || rm.slug).padEnd(30)} (slug: ${rm.slug}, ${rm.modules?.length || 0} modules, ${rm.topicCount || 0} topics)`);
        }
      }
      console.log("\n");
      await closeDb();
    } catch (e) {
      console.error("❌ Lỗi khi truy vấn MongoDB Atlas:", e);
    }
  });

program.parse(process.argv);

