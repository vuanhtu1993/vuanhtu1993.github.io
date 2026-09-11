/**
 * Cấu hình danh mục và hằng số cho Roadmap Crawler Agent
 * Phân loại theo 4 nhóm chính tương tự cách tổ chức của roadmap.sh
 */

export const ROADMAP_CATEGORIES = {
  "role-based": [
    "frontend",
    "frontend-beginner",
    "backend",
    "backend-beginner",
    "full-stack",
    "devops",
    "devops-beginner",
    "devsecops",
    "android",
    "ios",
    "ai-engineer",
    "ai-data-scientist",
    "data-engineer",
    "data-analyst",
    "bi-analyst",
    "machine-learning",
    "mlops",
    "product-design",
    "ux-design",
    "product-manager",
    "engineering-manager",
    "devrel",
    "game-developer",
    "server-side-game-developer",
    "network-engineer",
    "qa",
    "software-architect",
    "technical-writer",
    "forward-deployed-engineer",
    "ai-product-builder",
    "postgresql-dba",
  ],
  "skill-based": [
    // Ngôn ngữ lập trình
    "javascript",
    "typescript",
    "python",
    "java",
    "golang",
    "rust",
    "cpp",
    "c",
    "kotlin",
    "php",
    "ruby",
    "r",
    "r-programming",
    "scala",
    "shell-bash",
    "sql",
    "html",
    "css",
    // Frameworks & Thư viện
    "react",
    "react-native",
    "vue",
    "angular",
    "nextjs",
    "nodejs",
    "django",
    "laravel",
    "spring-boot",
    "ruby-on-rails",
    "flutter",
    "swift-ui",
    "aspnet-core",
    "graphql",
    "python-data-analysis",
  ],
  "tool-platform": [
    "aws",
    "docker",
    "kubernetes",
    "terraform",
    "linux",
    "git-github",
    "git-github-beginner",
    "mongodb",
    "redis",
    "elasticsearch",
    "cloudflare",
    "power-bi",
    "wordpress",
    "claude-code",
    "openclaw",
  ],
  "best-practice": [
    "api-design",
    "code-review",
    "design-system",
    "cyber-security",
    "computer-science",
    "datastructures-and-algorithms",
    "blockchain",
    "system-design",
    "software-design-architecture",
    "ai-agents",
    "prompt-engineering",
    "ai-red-teaming",
    "leetcode",
    "vibe-coding",
  ],
} as const;

export type CategoryKey = keyof typeof ROADMAP_CATEGORIES;

/**
 * Tên hiển thị tiếng Việt và tiếng Anh cho từng nhóm
 */
export const CATEGORY_LABELS: Record<CategoryKey, { vi: string; en: string }> = {
  "role-based": {
    vi: "Lộ trình theo Vị trí Công việc (Role-based)",
    en: "Role-based Roadmaps",
  },
  "skill-based": {
    vi: "Lộ trình theo Kỹ năng & Ngôn ngữ (Skill-based)",
    en: "Skill-based Roadmaps",
  },
  "tool-platform": {
    vi: "Lộ trình theo Công cụ & Nền tảng (Tool & Platform)",
    en: "Tool & Platform Roadmaps",
  },
  "best-practice": {
    vi: "Quy chuẩn & Thực hành Tốt nhất (Best Practices & Architecture)",
    en: "Best Practices & Methodologies",
  },
};

/**
 * Tra cứu category của một slug
 */
export function getCategoryForSlug(slug: string): CategoryKey {
  for (const [category, slugs] of Object.entries(ROADMAP_CATEGORIES)) {
    if ((slugs as readonly string[]).includes(slug)) {
      return category as CategoryKey;
    }
  }
  // Mặc định nếu xuất hiện roadmap mới
  return "skill-based";
}

/**
 * Map tùy chỉnh tên hiển thị cho các từ viết tắt hoặc tên đặc biệt
 */
const SPECIAL_TITLES: Record<string, string> = {
  aws: "AWS (Amazon Web Services)",
  cpp: "C++",
  c: "C Language",
  css: "CSS",
  html: "HTML",
  sql: "SQL",
  r: "R Programming",
  qa: "QA (Quality Assurance)",
  bi: "BI Analyst",
  ux: "UX Design",
  nextjs: "Next.js",
  nodejs: "Node.js",
  vue: "Vue.js",
  react: "React",
  "react-native": "React Native",
  "aspnet-core": "ASP.NET Core",
  "ruby-on-rails": "Ruby on Rails",
  "spring-boot": "Spring Boot",
  "swift-ui": "SwiftUI",
  "git-github": "Git and GitHub",
  "git-github-beginner": "Git and GitHub (Beginner)",
  "frontend-beginner": "Frontend (Beginner)",
  "backend-beginner": "Backend (Beginner)",
  "devops-beginner": "DevOps (Beginner)",
  "ai-agents": "AI Agents",
  "ai-engineer": "AI Engineer",
  "ai-data-scientist": "AI Data Scientist",
  "ai-red-teaming": "AI Red Teaming",
  "ai-product-builder": "AI Product Builder",
  "datastructures-and-algorithms": "Data Structures & Algorithms",
  "power-bi": "Power BI",
  "postgresql-dba": "PostgreSQL DBA",
  "claude-code": "Claude Code",
};

/**
 * Chuyển đổi slug thành Tiêu đề chuẩn hóa, dễ đọc
 * @param slug Ví dụ: "data-structures-and-algorithms" -> "Data Structures & Algorithms"
 */
export function slugToTitle(slug: string): string {
  if (SPECIAL_TITLES[slug]) {
    return SPECIAL_TITLES[slug];
  }

  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Các cấu hình hằng số API GitHub & Raw Content
 */
export const GITHUB_CONFIG = {
  API_BASE: "https://api.github.com",
  // nilbuild là tên tổ chức mới chứa repo developer-roadmap
  OWNER: "nilbuild",
  REPO: "developer-roadmap",
  BRANCH: "master",
  ROADMAPS_PATH: "roadmaps",
  // CDN phục vụ file raw, không bị ảnh hưởng bởi REST API rate limit
  RAW_BASE: "https://raw.githubusercontent.com/nilbuild/developer-roadmap/master/roadmaps",
  // Số roadmaps xử lý đồng thời trong 1 batch
  BATCH_SIZE: 5,
  // Số request song song khi tải file trong 1 roadmap
  CONCURRENCY_PER_ROADMAP: 8,
  // Delay giữa các đợt request để đảm bảo an toàn kết nối mạng
  REQUEST_DELAY_MS: 150,
  // Số lần retry tối đa khi gặp lỗi mạng tạm thời
  MAX_RETRIES: 3,
};
