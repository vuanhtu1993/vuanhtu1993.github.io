import https from "node:https";
import { GITHUB_CONFIG } from "../config";
import { RawFileItem, RawTopic, RoadmapGraphData } from "../state";

/**
 * GitHub Client tích hợp cơ chế:
 * 1. Rate Limit Tracking & Smart Wait: Theo dõi sát sao quota từ GitHub API header
 * 2. Exponential Backoff: Tự động retry khi gặp lỗi mạng tạm thời hoặc 429
 * 3. CDN Fast Download: Ưu tiên tải raw markdown từ CDN (không tốn quota REST API)
 * 4. Concurrent Pool: Giới hạn số kết nối đồng thời để không gây quá tải
 */
export class GitHubClient {
  private token: string | null = null;
  public rateLimitRemaining: number = 60;
  public rateLimitReset: number = Math.floor(Date.now() / 1000) + 3600;

  constructor() {
    // Tự động nhận diện token từ các biến môi trường phổ biến
    this.token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null;
    if (this.token) {
      console.log("🔑 Đã tìm thấy GitHub Token, nâng giới hạn lên 5,000 requests/giờ.");
    }
  }

  /**
   * Tạo headers cho request
   */
  private getHeaders(isRaw: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      "User-Agent": "RoadmapCrawler-AhaMind/1.0",
    };

    if (this.token && !isRaw) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Cập nhật thông tin rate limit từ response headers (hỗ trợ cả Headers và Record)
   */
  private updateRateLimit(headers: Record<string, any> | Headers): void {
    let remaining: string | null = null;
    let reset: string | null = null;

    if (typeof (headers as any).get === "function") {
      remaining = (headers as Headers).get("x-ratelimit-remaining");
      reset = (headers as Headers).get("x-ratelimit-reset");
    } else {
      remaining = (headers as Record<string, any>)["x-ratelimit-remaining"] ?? null;
      reset = (headers as Record<string, any>)["x-ratelimit-reset"] ?? null;
    }

    if (remaining !== null) {
      this.rateLimitRemaining = parseInt(String(remaining), 10);
    }
    if (reset !== null) {
      this.rateLimitReset = parseInt(String(reset), 10);
    }
  }

  /**
   * Helper tải JSON qua Node https native chống ECONNRESET khi payload lớn
   */
  private httpsGetJson<T>(
    url: string,
    headers: Record<string, string>
  ): Promise<{ status: number; headers: Record<string, any>; data: T }> {
    return new Promise((resolve, reject) => {
      const req = https.get(url, { headers }, (res) => {
        let rawData = "";
        res.on("data", (chunk) => (rawData += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({
              status: res.statusCode || 200,
              headers: res.headers as Record<string, any>,
              data: parsed,
            });
          } catch (err) {
            reject(new Error(`JSON parse error từ ${url}: ${err}`));
          }
        });
      });
      req.on("error", reject);
      req.setTimeout(20000, () => {
        req.destroy(new Error(`Hết thời gian chờ (Timeout) khi tải: ${url}`));
      });
    });
  }

  /**
   * Chờ đợi khi quota GitHub API gần cạn kiệt (dưới ngưỡng an toàn 5 requests)
   */
  private async checkAndDelayRateLimit(): Promise<void> {
    if (this.rateLimitRemaining <= 3) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const waitSeconds = Math.max(this.rateLimitReset - nowSeconds + 2, 5);

      console.warn(
        `⚠️  GitHub API rate limit sắp hết (còn ${this.rateLimitRemaining} reqs). Đang tạm dừng ${waitSeconds}s chờ reset...`
      );
      await this.sleep(waitSeconds * 1000);
      this.rateLimitRemaining = 60; // Reset dự phòng
    }
  }

  /**
   * Helper sleep
   */
  public sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Lấy toàn bộ cây thư mục roadmaps thông qua 1 request duy nhất đến Git Trees API
   */
  public async fetchRoadmapsTree(): Promise<{ items: RawFileItem[]; rateLimitRemaining: number }> {
    await this.checkAndDelayRateLimit();

    const url = `${GITHUB_CONFIG.API_BASE}/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/git/trees/${GITHUB_CONFIG.BRANCH}:${GITHUB_CONFIG.ROADMAPS_PATH}?recursive=1`;

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= GITHUB_CONFIG.MAX_RETRIES; attempt++) {
      try {
        const response = await this.httpsGetJson<{
          sha: string;
          truncated: boolean;
          tree: Array<{
            path: string;
            type: string;
            sha: string;
            size?: number;
          }>;
        }>(url, this.getHeaders(false));

        this.updateRateLimit(response.headers);

        if (response.status === 429) {
          const waitTime = attempt * 3000;
          console.warn(`⏳ Bị rate limit (429). Chờ ${waitTime}ms trước khi thử lại (lần ${attempt})...`);
          await this.sleep(waitTime);
          continue;
        }

        if (response.status >= 400) {
          throw new Error(`GitHub API error ${response.status}`);
        }

        const data = response.data;

        if (data.truncated) {
          console.warn("⚠️  Cảnh báo: Git tree bị cắt ngắn do repo quá lớn.");
        }

        // Lọc ra các file markdown nội dung (định dạng: <slug>/content/<topic>@<nodeId>.md)
        const items: RawFileItem[] = [];
        for (const node of data.tree) {
          if (node.type === "blob" && node.path.includes("/content/") && node.path.endsWith(".md")) {
            const parts = node.path.split("/");
            if (parts.length >= 3) {
              const slug = parts[0];
              const filename = parts.slice(2).join("/"); // Tránh trường hợp có sub-sub-path
              const nameWithoutExt = filename.replace(/\.md$/, "");
              const atIndex = nameWithoutExt.lastIndexOf("@");

              let topicName = nameWithoutExt;
              let nodeId = "";

              if (atIndex !== -1) {
                topicName = nameWithoutExt.substring(0, atIndex);
                nodeId = nameWithoutExt.substring(atIndex + 1);
              }

              items.push({
                path: node.path,
                slug,
                filename,
                topicName,
                nodeId,
                sha: node.sha,
                size: node.size || 0,
              });
            }
          }
        }

        return { items, rateLimitRemaining: this.rateLimitRemaining };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`⚠️ Lần thử ${attempt}/${GITHUB_CONFIG.MAX_RETRIES} thất bại khi lấy tree: ${lastError.message}`);
        await this.sleep(attempt * 1500);
      }
    }

    throw lastError || new Error("Không thể lấy Git Tree từ GitHub");
  }

  /**
   * Tải nội dung markdown của 1 file cụ thể
   * Ưu tiên tải qua CDN raw.githubusercontent.com, nếu lỗi fallback sang GitHub Blob API
   */
  public async fetchRawFileContent(path: string, sha?: string): Promise<string> {
    // 1. Thử tải qua CDN Raw
    const rawUrl = `${GITHUB_CONFIG.RAW_BASE}/${path}`;
    try {
      const response = await fetch(rawUrl, {
        headers: this.getHeaders(true),
      });

      if (response.ok) {
        return await response.text();
      }
    } catch {
      // Bỏ qua lỗi CDN để fallback sang Blob API
    }

    // 2. Fallback sang GitHub Git Blob API nếu có SHA
    if (sha) {
      await this.checkAndDelayRateLimit();
      const blobUrl = `${GITHUB_CONFIG.API_BASE}/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/git/blobs/${sha}`;

      const response = await fetch(blobUrl, {
        headers: this.getHeaders(false),
      });

      this.updateRateLimit(response.headers);

      if (response.ok) {
        const data = (await response.json()) as { content: string; encoding: string };
        if (data.encoding === "base64") {
          return Buffer.from(data.content, "base64").toString("utf-8");
        }
        return data.content;
      }
    }

    throw new Error(`Không thể tải nội dung file: ${path}`);
  }

  /**
   * Tải danh sách file của một roadmap theo luồng song song có kiểm soát (Concurrency Pool)
   */
  public async fetchRoadmapFiles(
    items: RawFileItem[],
    onProgress?: (done: number, total: number) => void
  ): Promise<RawTopic[]> {
    const results: RawTopic[] = [];
    const total = items.length;
    let completed = 0;

    // Concurrency limit: xử lý từng cụm
    const poolSize = GITHUB_CONFIG.CONCURRENCY_PER_ROADMAP;
    for (let i = 0; i < items.length; i += poolSize) {
      const chunk = items.slice(i, i + poolSize);

      const chunkResults = await Promise.all(
        chunk.map(async (item) => {
          try {
            const content = await this.fetchRawFileContent(item.path, item.sha);
            return {
              filename: item.filename,
              topicName: item.topicName,
              nodeId: item.nodeId,
              content,
              size: item.size || content.length,
            };
          } catch (err) {
            console.error(`❌ Lỗi tải topic ${item.slug}/${item.filename}: ${err}`);
            return null;
          } finally {
            completed++;
            if (onProgress) {
              onProgress(completed, total);
            }
          }
        })
      );

      for (const res of chunkResults) {
        if (res !== null) {
          results.push(res);
        }
      }

      // Delay nhẹ giữa các chunk
      await this.sleep(GITHUB_CONFIG.REQUEST_DELAY_MS);
    }

    return results;
  }

  /**
   * Tải cấu trúc Graph Topology (React Flow nodes & edges) từ roadmap.sh API
   * Endpoint: https://roadmap.sh/api/v1-official-roadmap/${slug}
   */
  public async fetchRoadmapTopology(slug: string): Promise<RoadmapGraphData | null> {
    const url = `https://roadmap.sh/api/v1-official-roadmap/${slug}`;
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "RoadmapCrawler-AhaMind/1.0",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as {
        nodes?: any[];
        edges?: any[];
      };

      if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
        return null;
      }

      return {
        nodes: data.nodes.map((n: any) => ({
          id: n.id,
          type: n.type || "topic",
          position: n.position || { x: 0, y: 0 },
          data: { label: n.data?.label || "" },
          parentId: n.parentId,
        })),
        edges: data.edges.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          data: { edgeStyle: e.data?.edgeStyle || "solid" },
        })),
      };
    } catch {
      // Graceful degradation nếu có lỗi mạng
      return null;
    }
  }
}
