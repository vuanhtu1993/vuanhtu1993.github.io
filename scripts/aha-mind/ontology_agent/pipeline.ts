import "dotenv/config";
import { Command } from "commander";
import path from "path";
import { generateOntology } from "./generate.js";

const program = new Command();

program
  .name("aha-mind:ontology")
  .description("🧠 Ontology Generator — Xây dựng JSON ontology từ source docs")
  .version("1.0.0");

program
  .command("generate")
  .description("Parse source directory and generate ontology JSON")
  .requiredOption("-s, --source <dir>", "Thư mục chứa source docs (.md)")
  .requiredOption("-d, --domain <name>", "Tên domain (kebab-case)")
  .option("-l, --depth <number>", "Độ sâu tối đa (level)", "4")
  .option("-o, --output <file>", "File output JSON")
  .action(async (options) => {
    const sourceDir = path.resolve(process.cwd(), options.source);
    const domain = options.domain;
    const depth = parseInt(options.depth, 10);
    const outputFile = options.output ? path.resolve(process.cwd(), options.output) : path.resolve(process.cwd(), `static/ontology/${domain}.json`);

    console.log("\n🧠 Aha-Mind Ontology Generator");
    console.log("━".repeat(50));
    console.log(`📂 Source : ${sourceDir}`);
    console.log(`🌐 Domain : ${domain}`);
    console.log(`📉 Depth  : ${depth}`);
    console.log(`📁 Output : ${outputFile}`);
    console.log("━".repeat(50));
    console.log("🚀 Đang phân tích docs...\n");

    try {
      await generateOntology({ sourceDir, domain, depth, outputFile });
      console.log("\n✅ Tạo Ontology JSON thành công!");
    } catch (err) {
      console.error("\n❌ Lỗi:", err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program.parse(process.argv);
