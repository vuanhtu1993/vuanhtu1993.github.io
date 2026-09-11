import { Annotation } from "@langchain/langgraph";

/**
 * Thông tin metadata cơ bản của một Roadmap
 */
export interface RoadmapMeta {
  slug: string;
  title: string;
  category: "role-based" | "skill-based" | "tool-platform" | "best-practice" | "other";
  treeSha: string;
  fileCount: number;
}

/**
 * Metadata của file markdown trong git tree
 */
export interface RawFileItem {
  path: string;
  slug: string;
  filename: string;
  topicName: string;
  nodeId: string;
  sha: string;
  size: number;
}

/**
 * Dữ liệu raw markdown tải về từ GitHub
 */
export interface RawTopic {
  filename: string;
  topicName: string;
  nodeId: string;
  content: string;
  size: number;
}

/**
 * Resource liên kết học tập (bài viết, video, official docs...)
 */
export interface ParsedResource {
  type: string;
  title: string;
  url: string;
}

/**
 * Cấu trúc đồ thị React Flow từ API roadmap.sh
 */
export interface GraphNode {
  id: string;
  type: string; // "topic", "subtopic", "section", "title", etc.
  position: { x: number; y: number };
  data?: {
    label?: string;
  };
  parentId?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  data?: {
    edgeStyle?: "solid" | "dashed" | string;
  };
}

export interface RoadmapGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Một topic đã được chuẩn hóa và bổ sung thứ tự, quan hệ đồ thị
 */
export interface ParsedTopic {
  name: string;
  nodeId: string;
  title: string;
  description: string;
  content: string;
  resources: ParsedResource[];
  order: string; // Số thứ tự phân cấp, vd: "1.0", "1.1", "2.1"
  parentTopic?: { id: string; title: string };
  prerequisites?: { id: string; title: string }[];
  nextTopics?: { id: string; title: string }[];
}

/**
 * Module/Chủ đề chính trong lộ trình học tập tuần tự
 */
export interface RoadmapModule {
  order: number; // Thứ tự module chính: 1, 2, 3...
  id: string;
  name: string;
  title: string;
  description: string;
  resources: ParsedResource[];
  prerequisites: { id: string; title: string }[];
  nextModules: { id: string; title: string }[];
  subtopics: ParsedTopic[];
}

/**
 * Toàn bộ roadmap hoàn chỉnh sau khi parse và cấu trúc hóa đồ thị
 */
export interface ParsedRoadmap {
  slug: string;
  title: string;
  category: string;
  topicCount: number;
  moduleCount: number;
  modules: RoadmapModule[];
  topics: ParsedTopic[];
  graph: {
    edges: { source: string; target: string; type: "flow" | "subtopic" }[];
  };
  updatedAt: string;
}

/**
 * LangGraph State Definition cho Roadmap Crawler Agent
 * Quản lý vòng đời dữ liệu từ lúc fetch tree, phân loại, crawl batch, topology graph, parse đến save output.
 */
export const RoadmapCrawlerState = Annotation.Root({
  // Danh sách slugs người dùng muốn crawl (rỗng = crawl tất cả)
  targetSlugs: Annotation<string[]>({
    reducer: (x, y) => y ?? x ?? [],
    default: () => [],
  }),

  // Thư mục lưu dữ liệu
  outputDir: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "./sources/roadmap-data",
    default: () => "./sources/roadmap-data",
  }),

  // Chế độ dry-run: chỉ crawl và in log, không ghi file ra đĩa
  dryRun: Annotation<boolean>({
    reducer: (x, y) => (y !== undefined ? y : x ?? false),
    default: () => false,
  }),

  // Master index các roadmap tìm thấy
  roadmapIndex: Annotation<RoadmapMeta[]>({
    reducer: (x, y) => y ?? x ?? [],
    default: () => [],
  }),

  // Toàn bộ file items từ Git Tree của repo
  allTreeItems: Annotation<RawFileItem[]>({
    reducer: (x, y) => y ?? x ?? [],
    default: () => [],
  }),

  // Bản đồ phân loại theo 4 nhóm
  classifiedMap: Annotation<Record<string, RoadmapMeta[]>>({
    reducer: (x, y) => y ?? x ?? {},
    default: () => ({}),
  }),

  // Hàng đợi các slugs còn chờ crawl
  pendingQueue: Annotation<string[]>({
    reducer: (x, y) => y ?? x ?? [],
    default: () => [],
  }),

  // Map lưu raw topics theo slug
  crawledRaw: Annotation<Record<string, RawTopic[]>>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),

  // Map lưu graph topology (nodes & edges) theo slug từ roadmap.sh API
  graphDataMap: Annotation<Record<string, RoadmapGraphData>>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),

  // Rate limit còn lại từ GitHub API header
  rateLimitRemaining: Annotation<number>({
    reducer: (x, y) => y ?? x ?? 60,
    default: () => 60,
  }),

  // Kết quả sau khi parse và chuẩn hóa cấu trúc
  parsedRoadmaps: Annotation<ParsedRoadmap[]>({
    reducer: (x, y) => y ?? x ?? [],
    default: () => [],
  }),

  // Danh sách đường dẫn file đã ghi
  outputPaths: Annotation<string[]>({
    reducer: (x, y) => y ?? x ?? [],
    default: () => [],
  }),

  // Danh sách lỗi phát sinh trong quá trình chạy
  errors: Annotation<string[]>({
    reducer: (x, y) => [...(x ?? []), ...(y ?? [])],
    default: () => [],
  }),
});

export type RoadmapCrawlerStateType = typeof RoadmapCrawlerState.State;
