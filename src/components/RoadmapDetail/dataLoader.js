/**
 * Trình tải dữ liệu on-demand cho các roadmap
 * Sử dụng Webpack require.context với mode 'lazy' để:
 * 1. Tự động nhận diện mọi roadmap JSON hiện có trong thư mục sources/roadmap-data.
 * 2. Không bị crash lỗi "Module not found" khi file bị xoá hoặc đang trong quá trình crawl lại.
 * 3. Tối ưu bundle: Chỉ tải file JSON khi người học mở lộ trình tương ứng.
 */

// Quét toàn bộ file .json trong sources/roadmap-data theo chế độ lazy chunk
const roadmapContext = require.context(
  '@site/sources/roadmap-data',
  true,
  /\.json$/,
  'lazy'
);

export async function loadRoadmapData(slug) {
  const keys = roadmapContext.keys();
  const targetKey = keys.find(
    (k) => k.endsWith(`/${slug}.json`) && !k.endsWith('/index.json')
  );

  if (!targetKey) {
    throw new Error(`Lộ trình "${slug}" chưa có dữ liệu hoặc đang trong quá trình thu thập.`);
  }

  const module = await roadmapContext(targetKey);
  return module.default || module;
}

export function isRoadmapAvailable(slug) {
  const keys = roadmapContext.keys();
  return keys.some(
    (k) => k.endsWith(`/${slug}.json`) && !k.endsWith('/index.json')
  );
}
