/**
 * Trình tải dữ liệu on-demand cho các roadmap
 * 
 * Kiến trúc Hybrid:
 * 1. Môi trường Dev: Ưu tiên tải live từ MongoDB qua REST API (/api/roadmap/:slug)
 *    để phản ánh tức thì các thay đổi từ Edit Mode và Crawler.
 * 2. Môi trường Prod (GitHub Pages): Tải static chunks từ sources/roadmap-data
 *    đã được đồng bộ sẵn từ MongoDB trong quá trình build (loadContent hook).
 */

// Cache client-side tránh fetch lại liên tục khi người dùng duyệt
const cache = new Map();

// Quét toàn bộ file .json trong sources/roadmap-data theo chế độ lazy chunk
const staticContext = require.context(
  '@site/sources/roadmap-data',
  true,
  /\.json$/,
  'lazy'
);

export async function loadRoadmapData(slug) {
  if (cache.has(slug)) {
    return cache.get(slug);
  }

  // 1. Nếu ở môi trường Dev, ưu tiên fetch live API từ MongoDB
  if (process.env.NODE_ENV === 'development') {
    try {
      const res = await fetch(`/api/roadmap/${slug}`);
      if (res.ok) {
        const data = await res.json();
        cache.set(slug, data);
        return data;
      }
    } catch (e) {
      console.warn('[dataLoader] Không thể kết nối /api/roadmap, dùng static data dự phòng:', e);
    }
  }

  // 2. Môi trường Production hoặc Fallback: Đọc từ static chunks
  const keys = staticContext.keys();
  const targetKey = keys.find(
    (k) => k.endsWith(`/${slug}.json`) && !k.endsWith('/index.json')
  );

  if (!targetKey) {
    throw new Error(`Lộ trình "${slug}" chưa có dữ liệu hoặc đang trong quá trình thu thập.`);
  }

  const module = await staticContext(targetKey);
  const data = module.default || module;
  cache.set(slug, data);
  return data;
}

export function isRoadmapAvailable(slug) {
  const keys = staticContext.keys();
  return keys.some(
    (k) => k.endsWith(`/${slug}.json`) && !k.endsWith('/index.json')
  );
}

/**
 * Xoá cache để buộc load lại dữ liệu mới nhất sau khi sửa hoặc xoá trong Edit Mode
 */
export function invalidateCache(slug) {
  if (slug) {
    cache.delete(slug);
  } else {
    cache.clear();
  }
}
