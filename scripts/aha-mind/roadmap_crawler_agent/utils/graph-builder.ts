import {
  GraphNode,
  ParsedResource,
  ParsedTopic,
  RawTopic,
  RoadmapGraphData,
  RoadmapModule,
} from "../state";
import { parseTopicMarkdown } from "./markdown-parser";
import { slugToTitle } from "../config";

export interface HierarchicalBuildResult {
  modules: RoadmapModule[];
  topics: ParsedTopic[];
  graph: {
    edges: { source: string; target: string; type: "flow" | "subtopic" }[];
  };
}

/**
 * Hàm so sánh chuỗi số thứ tự phân cấp: "1.0" < "1.1" < "1.2" < "2.0" < "2.10"
 */
export function compareOrders(a: string, b: string): number {
  const partsA = a.split(".").map((n) => parseInt(n, 10) || 0);
  const partsB = b.split(".").map((n) => parseInt(n, 10) || 0);

  const len = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < len; i++) {
    const numA = partsA[i] ?? 0;
    const numB = partsB[i] ?? 0;
    if (numA !== numB) {
      return numA - numB;
    }
  }
  return 0;
}

/**
 * Xây dựng cây phân cấp (Hierarchy) và thứ tự học tập tuyến tính (Linear Order)
 * từ Graph Topology của roadmap.sh kết hợp với nội dung markdown đã crawl.
 */
export function buildHierarchicalRoadmap(
  slug: string,
  rawTopics: RawTopic[],
  graphData: RoadmapGraphData | null
): HierarchicalBuildResult {
  // 1. Phân tích trước toàn bộ file raw markdown thành ParsedTopic
  const topicByNodeId = new Map<string, ParsedTopic>();
  for (const raw of rawTopics) {
    const parsed = parseTopicMarkdown(raw);
    if (raw.nodeId) {
      topicByNodeId.set(raw.nodeId, parsed);
    }
  }

  // --- TRƯỜNG HỢP A: Không có dữ liệu Graph Topology (Fallback) ---
  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    const fallbackTopics: ParsedTopic[] = rawTopics.map((raw, idx) => {
      const parsed = parseTopicMarkdown(raw);
      return {
        ...parsed,
        order: `1.${idx + 1}`,
      };
    });

    const fallbackModule: RoadmapModule = {
      order: 1,
      id: `${slug}-core`,
      name: slug,
      title: slugToTitle(slug),
      description: `Lộ trình học tập tổng quan cho ${slugToTitle(slug)}`,
      resources: [],
      prerequisites: [],
      nextModules: [],
      subtopics: fallbackTopics,
    };

    return {
      modules: [fallbackModule],
      topics: fallbackTopics,
      graph: { edges: [] },
    };
  }

  // --- TRƯỜNG HỢP B: Có Graph Topology từ roadmap.sh API ---
  const nodeMap = new Map<string, GraphNode>();
  for (const n of graphData.nodes) {
    nodeMap.set(n.id, n);
  }

  const solidEdges = graphData.edges.filter(
    (e) => e.data?.edgeStyle === "solid" || !e.data?.edgeStyle
  );
  const dashedEdges = graphData.edges.filter(
    (e) => e.data?.edgeStyle === "dashed"
  );

  const flowOut = new Map<string, string[]>();
  const flowIn = new Map<string, string[]>();
  for (const e of solidEdges) {
    if (!flowOut.has(e.source)) flowOut.set(e.source, []);
    flowOut.get(e.source)!.push(e.target);

    if (!flowIn.has(e.target)) flowIn.set(e.target, []);
    flowIn.get(e.target)!.push(e.source);
  }

  const childrenOf = new Map<string, string[]>();
  const parentOf = new Map<string, string>();

  for (const e of dashedEdges) {
    if (!childrenOf.has(e.source)) childrenOf.set(e.source, []);
    childrenOf.get(e.source)!.push(e.target);
    parentOf.set(e.target, e.source);
  }

  // Ghi nhận thêm các node có trường parentId
  for (const n of graphData.nodes) {
    if (n.parentId) {
      if (!childrenOf.has(n.parentId)) childrenOf.set(n.parentId, []);
      if (!childrenOf.get(n.parentId)!.includes(n.id)) {
        childrenOf.get(n.parentId)!.push(n.id);
      }
      parentOf.set(n.id, n.parentId);
    }
  }

  // Xác định các Node chính làm Module:
  // Là các node có con, hoặc node kiểu "topic" không phải là con của node khác
  const mainNodes = graphData.nodes
    .filter((n) => {
      if (
        n.type === "title" ||
        n.type === "paragraph" ||
        n.type === "button" ||
        n.type === "section"
      ) {
        return false;
      }
      // Node có subtopics con
      if (childrenOf.has(n.id) && childrenOf.get(n.id)!.length > 0) {
        return true;
      }
      // Node chủ đề chính không bị ai nhận làm con
      if (n.type === "topic" && !parentOf.has(n.id)) {
        return true;
      }
      return false;
    })
    // Sắp xếp thứ tự học theo toạ độ Y từ trên xuống dưới
    .sort((a, b) => a.position.y - b.position.y);

  // Gom các subtopics chưa có cạnh dashed vào module gần nhất về mặt toạ độ Y (Spatial Proximity)
  const unassignedNodes = graphData.nodes.filter((n) => {
    if (n.type !== "subtopic" && n.type !== "topic") return false;
    if (mainNodes.some((m) => m.id === n.id)) return false;
    if (parentOf.has(n.id)) return false;
    return true;
  });

  for (const u of unassignedNodes) {
    let closestMain: GraphNode | null = null;
    let minDy = Infinity;

    for (const m of mainNodes) {
      const dy = Math.abs(m.position.y - u.position.y);
      if (dy < minDy && dy <= 160) {
        minDy = dy;
        closestMain = m;
      }
    }

    if (closestMain) {
      if (!childrenOf.has(closestMain.id)) childrenOf.set(closestMain.id, []);
      childrenOf.get(closestMain.id)!.push(u.id);
      parentOf.set(u.id, closestMain.id);
    }
  }

  const assignedNodeIds = new Set<string>();
  const modules: RoadmapModule[] = [];
  const allEnrichedTopics: ParsedTopic[] = [];

  // Duyệt qua từng mainNode để tạo Module và các Subtopics
  mainNodes.forEach((mainNode, mIdx) => {
    const moduleOrder = mIdx + 1;
    const moduleTitle = mainNode.data?.label || slugToTitle(mainNode.id);

    // Lấy điều kiện tiên quyết và các module tiếp theo
    const prereqs = (flowIn.get(mainNode.id) || [])
      .map((id) => ({ id, title: nodeMap.get(id)?.data?.label || id }))
      .filter((p) => p.title !== moduleTitle);

    const nextMods = (flowOut.get(mainNode.id) || [])
      .map((id) => ({ id, title: nodeMap.get(id)?.data?.label || id }))
      .filter((n) => n.title !== moduleTitle);

    let moduleDescription = "";
    let moduleResources: ParsedResource[] = [];

    // Nếu mainNode có file markdown riêng
    if (topicByNodeId.has(mainNode.id)) {
      const parsedMain = topicByNodeId.get(mainNode.id)!;
      moduleDescription = parsedMain.description;
      moduleResources = parsedMain.resources;
      assignedNodeIds.add(mainNode.id);

      // Thêm chính main topic này vào danh sách tổng hợp với order là `${moduleOrder}.0`
      const mainTopicEnriched: ParsedTopic = {
        ...parsedMain,
        order: `${moduleOrder}.0`,
        prerequisites: prereqs,
        nextTopics: nextMods,
      };
      allEnrichedTopics.push(mainTopicEnriched);
    }

    // Lấy danh sách subtopics con
    const rawChildIds = childrenOf.get(mainNode.id) || [];
    // Sắp xếp các subtopics theo toạ độ Y rồi tới X
    const sortedChildNodes = rawChildIds
      .map((id) => nodeMap.get(id))
      .filter((n): n is GraphNode => Boolean(n))
      .sort((a, b) => {
        if (Math.abs(a.position.y - b.position.y) > 10) {
          return a.position.y - b.position.y;
        }
        return a.position.x - b.position.x;
      });

    const subtopics: ParsedTopic[] = [];

    sortedChildNodes.forEach((cNode, cIdx) => {
      const subOrder = `${moduleOrder}.${cIdx + 1}`;
      const childTitle = cNode.data?.label || slugToTitle(cNode.id);

      if (topicByNodeId.has(cNode.id)) {
        const pTopic = topicByNodeId.get(cNode.id)!;
        const enriched: ParsedTopic = {
          ...pTopic,
          title: pTopic.title || childTitle,
          order: subOrder,
          parentTopic: { id: mainNode.id, title: moduleTitle },
        };
        subtopics.push(enriched);
        allEnrichedTopics.push(enriched);
        assignedNodeIds.add(cNode.id);
      } else {
        // Node có trong graph nhưng chưa có markdown tương ứng
        const stubTopic: ParsedTopic = {
          name: childTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          nodeId: cNode.id,
          title: childTitle,
          description: "",
          content: "",
          resources: [],
          order: subOrder,
          parentTopic: { id: mainNode.id, title: moduleTitle },
        };
        subtopics.push(stubTopic);
        allEnrichedTopics.push(stubTopic);
        assignedNodeIds.add(cNode.id);
      }
    });

    modules.push({
      order: moduleOrder,
      id: mainNode.id,
      name: mainNode.id,
      title: moduleTitle,
      description: moduleDescription,
      resources: moduleResources,
      prerequisites: prereqs,
      nextModules: nextMods,
      subtopics,
    });
  });

  // Kiểm tra nếu còn các topic đã crawl trong GitHub nhưng chưa nằm trong bất kỳ module nào
  const remainingTopics: ParsedTopic[] = [];
  for (const [nodeId, topic] of topicByNodeId.entries()) {
    if (!assignedNodeIds.has(nodeId)) {
      remainingTopics.push(topic);
    }
  }

  if (remainingTopics.length > 0) {
    const extraModuleOrder = modules.length + 1;
    const extraModuleTitle = "Các Chủ Đề Mở Rộng & Bổ Trợ";

    const extraSubtopics: ParsedTopic[] = remainingTopics.map((t, idx) => ({
      ...t,
      order: `${extraModuleOrder}.${idx + 1}`,
      parentTopic: { id: "extra-topics", title: extraModuleTitle },
    }));

    modules.push({
      order: extraModuleOrder,
      id: "extra-topics",
      name: "additional-topics",
      title: extraModuleTitle,
      description: "Các chủ đề chuyên sâu mở rộng bổ trợ cho lộ trình chính",
      resources: [],
      prerequisites: [],
      nextModules: [],
      subtopics: extraSubtopics,
    });

    allEnrichedTopics.push(...extraSubtopics);
  }

  // Sắp xếp lại toàn bộ topics theo thứ tự phân cấp học tập
  allEnrichedTopics.sort((a, b) => compareOrders(a.order, b.order));

  // Tạo danh sách edges chuẩn hóa cho đồ thị
  const graphEdges = [
    ...solidEdges.map((e) => ({
      source: e.source,
      target: e.target,
      type: "flow" as const,
    })),
    ...dashedEdges.map((e) => ({
      source: e.source,
      target: e.target,
      type: "subtopic" as const,
    })),
  ];

  return {
    modules,
    topics: allEnrichedTopics,
    graph: {
      edges: graphEdges,
    },
  };
}
