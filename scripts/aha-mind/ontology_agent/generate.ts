import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

// 1. Zod Schema
const FlatOntologyNodeSchema = z.object({
  id: z.string().describe("Unique identifier in kebab-case. Example: 'mcp-authentication'"),
  label: z.string().describe("Tên hiển thị. Example: 'MCP Authentication'"),
  level: z.number().int().describe("0=Domain (Root), 1=Category, 2=Topic, 3=Sub-topic, 4=Detail"),
  parentId: z.string().nullable().describe("ID của node cha. Null nếu đây là Root node (level 0)."),
  description: z.string().describe("Mô tả ngắn gọn 1-2 câu về concept này"),
  docLink: z.string().optional().describe("Relative link tới bài docs (nếu tìm thấy). Ví dụ: '/docs/azure-ai-agent/overview'"),
  sourceRef: z.string().optional().describe("Path gốc của file chứa thông tin này"),
  tags: z.array(z.string()).optional().describe("Tags phân loại (tối đa 3 tags)"),
  relations: z.array(
    z.object({
      targetId: z.string(),
      type: z.enum(["depends-on", "related-to", "alternative-to", "part-of"])
    })
  ).optional().describe("Cross-references với các node khác")
});

const OntologyOutputSchema = z.object({
  nodes: z.array(FlatOntologyNodeSchema).describe("Danh sách các nodes được tạo ra trong batch này")
});

// 2. Tree Builder
function buildTree(flatNodes: any[], rootId: string) {
  const nodeMap = new Map();

  // Clone nodes
  flatNodes.forEach(node => {
    nodeMap.set(node.id, { ...node, children: [] });
  });

  let root = null;

  flatNodes.forEach(node => {
    if (node.id === rootId || !node.parentId) {
      if (!root) root = nodeMap.get(node.id);
    } else {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children.push(nodeMap.get(node.id));
      } else {
        // Fallback if parent missing due to chunking issues
        if (root) root.children.push(nodeMap.get(node.id));
      }
    }
  });

  function cleanTree(n: any) {
    delete n.parentId;
    if (n.children && n.children.length === 0) {
      delete n.children;
    } else if (n.children) {
      n.children.forEach(cleanTree);
    }
  }

  if (root) cleanTree(root);
  return root || flatNodes[0];
}

// 3. Scanner
function scanFolderContent(dir: string, baseDir: string = dir): string {
  let content = '';
  if (!fs.existsSync(dir)) return content;

  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      content += scanFolderContent(fullPath, baseDir);
    } else if (file.name.endsWith('.md') || file.name.endsWith('.mdx')) {
      const text = fs.readFileSync(fullPath, 'utf8');
      const relativePath = path.relative(baseDir, fullPath);
      const snippet = text.substring(0, 3000);
      content += `\n\n=== FILE: ${relativePath} ===\n${snippet}\n`;
    }
  }
  return content;
}

// 4. Main Generator
export async function generateOntology({ sourceDir, domain, depth, outputFile }: { sourceDir: string, domain: string, depth: number, outputFile: string }) {
  console.log(`\n🔍 Đang chuẩn bị Map-Reduce cho thư mục: ${sourceDir}`);

  if (!fs.existsSync(sourceDir)) {
    throw new Error("Không tìm thấy thư mục: " + sourceDir);
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  console.log(`🧠 Model sử dụng: ${modelName}`);

  const llm = new ChatGoogleGenerativeAI({
    model: modelName,
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.1,
    maxOutputTokens: 8192,
  });

  const structuredLlm = llm.withStructuredOutput(OntologyOutputSchema, { name: "Ontology" });

  // Thu thập các thư mục con cấp 1 (Categories)
  const items = fs.readdirSync(sourceDir, { withFileTypes: true });
  const folders = items.filter(item => item.isDirectory() && !item.name.startsWith('.'));
  const rootFiles = items.filter(item => item.isFile() && (item.name.endsWith('.md') || item.name.endsWith('.mdx')));

  let allNodes: any[] = [];

  // BƯỚC 1: Xử lý Root + Các file ở thư mục gốc
  console.log(`\n▶ BƯỚC 1: Xử lý Root Node và các file gốc...`);
  let rootContext = rootFiles.map(f => {
    const p = path.join(sourceDir, f.name);
    return `=== FILE: ${f.name} ===\n${fs.readFileSync(p, 'utf8').substring(0, 3000)}\n`;
  }).join('\n');

  if (!rootContext) rootContext = `Domain: ${domain}. No root files found.`;

  const rootPrompt = `
Bạn là Kiến trúc sư Thông tin. Nhiệm vụ: Tạo Root Node cho Knowledge Graph.
Domain gốc: ${domain}

Yêu cầu:
1. Tạo 1 Node gốc (Level 0) với id là "${domain}" và parentId là null.
2. Tạo các Topic Node (Level 2) nếu trong dữ liệu nguồn có thông tin, parentId trỏ về "${domain}".

Dữ liệu nguồn (Context):
${rootContext}
  `;

  try {
    const rootRes = await structuredLlm.invoke(rootPrompt);
    allNodes.push(...rootRes.nodes);
    console.log(`✔ Xong Root (tạo ${rootRes.nodes.length} nodes)`);
  } catch (e) {
    console.error("Lỗi khi tạo Root:", e);
  }

  // BƯỚC 2: Map-Reduce xử lý từng thư mục con (Category)
  console.log(`\n▶ BƯỚC 2: Xử lý ${folders.length} thư mục con (Categories)...`);

  for (const folder of folders) {
    console.log(`  Đang phân tích thư mục: [${folder.name}]...`);
    const folderPath = path.join(sourceDir, folder.name);
    const folderContext = scanFolderContent(folderPath, sourceDir);

    if (!folderContext.trim()) {
      console.log(`  -> Bỏ qua (thư mục rỗng hoặc không có file MD)`);
      continue;
    }

    const folderPrompt = `
Bạn là Kiến trúc sư Thông tin. Nhiệm vụ: Trích xuất các khái niệm thành Flat List Nodes cho thư mục: "${folder.name}".

Yêu cầu cực kỳ quan trọng:
1. TỐI ĐA 50 NODES. Chỉ lấy các khái niệm quan trọng nhất.
2. KHÔNG TẠO ROOT NODE (Level 0) ở đây. Root node ID là "${domain}".
3. BẮT BUỘC tạo 1 Category Node (Level 1) đại diện cho thư mục "${folder.name}". Thuộc tính parentId của Category Node này phải bằng "${domain}".
4. Các khái niệm khác trong bài viết phải là Topic (Level 2) hoặc Sub-topic (Level 3) và có parentId trỏ về Category Node vừa tạo ở trên (hoặc trỏ về Topic cha).
5. Nếu bài viết có URL hoặc dựa theo path, hãy điền vào "docLink".

Dữ liệu nguồn của thư mục này:
${folderContext}
    `;

    try {
      const folderRes = await structuredLlm.invoke(folderPrompt);
      allNodes.push(...folderRes.nodes);
      console.log(`  ✔ Xong [${folder.name}] (tạo ${folderRes.nodes.length} nodes)`);
    } catch (e) {
      console.error(`  ❌ Lỗi khi xử lý thư mục [${folder.name}]:`, e);
    }
  }

  // BƯỚC 3: Reduce & Build Tree
  console.log(`\n▶ BƯỚC 3: Ghép nối và Build Tree (Tổng số node: ${allNodes.length})`);
  const treeResult = buildTree(allNodes, domain);

  const outDir = path.dirname(outputFile);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(treeResult, null, 2), 'utf-8');
  console.log(`\n🎉 THÀNH CÔNG! File Ontology khổng lồ đã được lưu tại: ${outputFile}`);
}
