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
  .option("-s, --slug <slugs>", "Chỉ crawl các roadmap cụ thể, phân cách bằng dấu phẩy (vd: frontend,backend,nextjs)", "")
  .option("-o, --output <dir>", "Đường dẫn thư mục lưu trữ dữ liệu", "./sources/roadmap-data")
  .option("--dry-run", "Chạy thử kiểm tra luồng đồ thị (chỉ log, không ghi file ra đĩa)", false)
  .action(async (options) => {
    console.log("================================================================================");
    console.log("🚀 KHỞI ĐỘNG ROADMAP.SH CRAWLER AGENT (LangGraph StateGraph)");
    console.log("================================================================================");

    const targetSlugs = options.slug
      ? options.slug
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

// Lệnh phụ: Liệt kê dữ liệu đã crawl
program
  .command("list")
  .description("Liệt kê các roadmaps đã crawl trong thư mục output")
  .option("-o, --output <dir>", "Đường dẫn thư mục lưu trữ dữ liệu", "./sources/roadmap-data")
  .action((options) => {
    const baseDir = path.resolve(process.cwd(), options.output);
    const indexPath = path.join(baseDir, "index.json");

    if (!fs.existsSync(indexPath)) {
      console.log(`📭 Chưa tìm thấy dữ liệu index tại: ${indexPath}`);
      console.log("👉 Hãy chạy: pnpm aha-mind:roadmap-crawler để bắt đầu crawl.");
      return;
    }

    try {
      const raw = fs.readFileSync(indexPath, "utf-8");
      const data = JSON.parse(raw);

      console.log("\n================================================================================");
      console.log(`📚 DANH SÁCH ROADMAPS ĐÃ CRAWL TẠI: ${baseDir}`);
      console.log(`⏰ Cập nhật lần cuối: ${data.generatedAt}`);
      console.log(`📊 Tổng số: ${data.totalRoadmaps} roadmaps | ${data.totalModules || 0} modules | ${data.totalTopics} topics`);
      console.log("================================================================================");

      for (const cat of data.categories || []) {
        console.log(`\n📂 [${cat.nameVi}] - ${cat.count} roadmaps:`);
        for (const rm of cat.roadmaps || []) {
          console.log(`  - 🗺️  ${rm.title.padEnd(30)} (slug: ${rm.slug}, ${rm.moduleCount || 1} modules, ${rm.topicCount} topics)`);
        }
      }
      console.log("\n");
    } catch (e) {
      console.error("❌ Lỗi khi đọc file index.json:", e);
    }
  });

program.parse(process.argv);
