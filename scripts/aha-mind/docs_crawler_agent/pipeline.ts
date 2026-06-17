/**
 * pipeline.ts — CLI Entry Point cho aha-mind:docs-crawler
 *
 * Cách dùng:
 *   pnpm aha-mind:docs-crawler crawl https://docs.example.com/guide --output ./output
 *   pnpm aha-mind:docs-crawler list ./output
 *
 * WHY dùng commander.js?
 * - Standard library cho CLI Node.js: type-safe, tự generate --help
 * - Hỗ trợ sub-commands (crawl, list) giúp UX rõ ràng
 */

import { Command } from "commander";
import path from "path";
import { crawl } from "./crawler.js";
import { listCrawledFiles } from "./file-writer.js";

const program = new Command();

program
  .name("aha-mind:docs-crawler")
  .description(
    "🕷️  Documentation Crawler Agent — Crawl docs website thành Markdown files"
  )
  .version("1.0.0");

program
  .argument("[url]", "Crawl một URL và tất cả trang con cùng path prefix")
  .option(
    "-o, --output <dir>",
    "Thư mục lưu output markdown files",
    "/documentations"
  )
  .option(
    "-m, --max-pages <number>",
    "Số lượng trang tối đa cần crawl",
    "200"
  )
  .option(
    "-d, --delay <ms>",
    "Delay giữa các request (milliseconds)",
    "1000"
  )
  .option(
    "-t, --timeout <ms>",
    "Timeout mỗi page load (milliseconds)",
    "15000"
  )
  .action(async (url: string | undefined, options) => {
    if (!url) {
      program.help();
      return;
    }
    const outputDir = path.resolve(process.cwd(), options.output);
    const maxPages = parseInt(options.maxPages, 10);
    const delayMs = parseInt(options.delay, 10);
    const timeout = parseInt(options.timeout, 10);

    console.log("\n🕷️  Aha-Mind Docs Crawler");
    console.log("━".repeat(50));
    console.log(`📍 Start URL : ${url}`);
    console.log(`📁 Output   : ${outputDir}`);
    console.log(`📄 Max pages: ${maxPages}`);
    console.log(`⏱️  Delay    : ${delayMs}ms`);
    console.log("━".repeat(50));
    console.log("🚀 Bắt đầu crawl...\n");

    const startTime = Date.now();

    try {
      const result = await crawl(
        { startUrl: url, outputDir, maxPages, delayMs, timeout },
        (progress) => {
          // Progress bar đơn giản
          const percent = Math.round(
            (progress.current / Math.max(progress.total, 1)) * 100
          );
          const bar = "█".repeat(Math.floor(percent / 5)) + "░".repeat(20 - Math.floor(percent / 5));

          if (progress.skipped) {
            process.stdout.write(
              `\r⚠️  [${bar}] ${progress.current}/${progress.total} SKIP: ${truncate(progress.currentUrl, 50)}`
            );
          } else if (progress.savedPath) {
            process.stdout.write(
              `\r✅ [${bar}] ${progress.current}/${progress.total} → ${truncate(progress.savedPath, 50)}`
            );
          } else {
            process.stdout.write(
              `\r🔍 [${bar}] ${progress.current}/${progress.total} ${truncate(progress.currentUrl, 50)}`
            );
          }
        }
      );

      // Clear progress line
      process.stdout.write("\n");

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log("\n" + "━".repeat(50));
      console.log("✅ Crawl hoàn thành!");
      console.log(`📄 Đã crawl : ${result.totalCrawled} trang`);
      console.log(`⚠️  Đã skip  : ${result.totalSkipped} trang`);
      console.log(`📁 Output   : ${outputDir}`);
      console.log(`⏱️  Thời gian: ${duration}s`);

      if (result.errors.length > 0) {
        console.log(`\n❌ Lỗi (${result.errors.length} trang):`);
        for (const err of result.errors.slice(0, 5)) {
          console.log(`   - ${err.url}: ${truncateError(err.error, 100)}`);
        }
        if (result.errors.length > 5) {
          console.log(`   ... và ${result.errors.length - 5} lỗi khác`);
        }
      }

      console.log("━".repeat(50));
      console.log("\n💡 Tip: Chạy lệnh sau để xem danh sách files:");
      console.log(`   pnpm aha-mind:docs-crawler list ${options.output}\n`);

    } catch (err) {
      console.error("\n❌ Crawl thất bại:", err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

// Sub-command: list
program
  .command("list <outputDir>")
  .description("Liệt kê tất cả file markdown đã crawl trong thư mục output")
  .action((outputDir: string) => {
    const absDir = path.resolve(process.cwd(), outputDir);
    const files = listCrawledFiles(absDir);

    if (files.length === 0) {
      console.log(`\n📭 Chưa có file nào trong ${absDir}\n`);
      return;
    }

    console.log(`\n📚 Danh sách files trong ${absDir}:`);
    console.log("━".repeat(60));

    for (const file of files) {
      console.log(`  📄 ${file}`);
    }

    console.log("━".repeat(60));
    console.log(`\nTổng cộng: ${files.length} files\n`);
  });

program.parse(process.argv);

// Helper: cắt ngắn string cho URL/Path (giữ phần đuôi)
function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return "..." + str.slice(str.length - maxLen + 3);
}

// Helper: cắt ngắn string cho Error (giữ phần đầu)
function truncateError(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}
