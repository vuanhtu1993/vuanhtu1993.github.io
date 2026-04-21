import * as fs from "fs";
import * as path from "path";
import { AhaMindState } from "../state";

export const fileWriterNode = async (state: AhaMindState): Promise<Partial<AhaMindState>> => {
  if (!state.finalMdxContent || !state.articleToProcess) {
    console.log("[Writer] No content to write. Skipping.");
    return {};
  }

  // Thư mục output đầu ra (blog/aha-mind) của docusaurus
  const outputDir = path.join(process.cwd(), "blog", "aha-mind");
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const slug = state.articleToProcess.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const dateStr = new Date(state.articleToProcess.pubDate).toISOString().split("T")[0];
  const fileName = `${dateStr}-${slug}.mdx`;
  const filePath = path.join(outputDir, fileName);

  fs.writeFileSync(filePath, state.finalMdxContent, "utf-8");

  console.log(`[Writer] Success! Wrote MDX content to: ${filePath}`);

  return {};
};
