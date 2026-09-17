const fs = require('fs');
const path = require('path');
const { getDb } = require('./mongo');

const CATEGORY_LABELS = {
  'role-based': { vi: 'Theo Vị Trí (Role-based)', en: 'Role-based Roadmaps' },
  'skill-based': { vi: 'Theo Kỹ Năng (Skill-based)', en: 'Skill-based Roadmaps' },
  'tool-platform': { vi: 'Công Cụ & Nền Tảng (Tool/Platform)', en: 'Tools & Platforms' },
  'best-practice': { vi: 'Thực Hành Tốt Nhất (Best Practices)', en: 'Best Practices' },
};

/**
 * Middleware phân tích body JSON đơn giản dùng native Node streams
 */
function jsonBodyParser(req, res, next) {
  if (req.body) return next();
  if (req.method === 'GET' || req.method === 'HEAD') return next();

  let raw = '';
  req.on('data', (chunk) => {
    raw += chunk;
  });
  req.on('end', () => {
    if (raw) {
      try {
        req.body = JSON.parse(raw);
      } catch (e) {
        req.body = {};
      }
    } else {
      req.body = {};
    }
    next();
  });
}

/**
 * Hàm đồng bộ dữ liệu từ MongoDB sang thư mục tĩnh sources/roadmap-data
 * Dùng cho cả loadContent() lúc build và sau khi edit trên dev
 */
async function syncMongoToStaticFiles() {
  const db = await getDb();
  const roadmapsCol = db.collection('roadmaps');
  const topicsCol = db.collection('topics');

  const roadmaps = await roadmapsCol.find({}).toArray();
  const allTopics = await topicsCol.find({}).toArray();

  const baseDir = path.resolve(process.cwd(), 'sources/roadmap-data');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  // Bản đồ tra cứu nhanh theo [roadmapSlug:nodeId] để giải quyết live reference
  const topicBySourceKey = new Map();
  for (const t of allTopics) {
    topicBySourceKey.set(`${t.roadmapSlug}:${t.nodeId}`, t);
  }

  // Hàm resolve nội dung mới nhất cho topic nếu là ref node
  function resolveTopicContent(t) {
    if (t.ref && t.ref.isRef && t.ref.sourceRoadmapSlug && t.ref.sourceNodeId) {
      const source = topicBySourceKey.get(`${t.ref.sourceRoadmapSlug}:${t.ref.sourceNodeId}`);
      if (source) {
        return {
          ...t,
          title: t.title || source.title,
          description: source.description,
          content: source.content,
          resources: source.resources,
        };
      }
    }
    return t;
  }

  // Gom topics theo roadmapSlug và moduleId
  const topicsByRoadmap = new Map();
  for (const rawTopic of allTopics) {
    const topic = resolveTopicContent(rawTopic);
    if (!topicsByRoadmap.has(topic.roadmapSlug)) {
      topicsByRoadmap.set(topic.roadmapSlug, []);
    }
    topicsByRoadmap.get(topic.roadmapSlug).push(topic);
  }

  const categorized = {
    'role-based': [],
    'skill-based': [],
    'tool-platform': [],
    'best-practice': [],
  };

  let totalModules = 0;
  let totalTopics = 0;

  for (const rm of roadmaps) {
    const rmTopics = topicsByRoadmap.get(rm.slug) || [];
    totalTopics += rmTopics.length;

    // Phục hồi subtopics vào từng module để tương thích hoàn toàn với schema hiển thị
    const topicsByModule = new Map();
    for (const t of rmTopics) {
      if (!topicsByModule.has(t.moduleId)) {
        topicsByModule.set(t.moduleId, []);
      }
      topicsByModule.get(t.moduleId).push(t);
    }

    const reconstructedModules = (rm.modules || []).map((mod) => {
      const subtopics = (topicsByModule.get(mod.id) || []).sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );
      return {
        ...mod,
        subtopics,
      };
    });

    totalModules += reconstructedModules.length || 1;

    const fullRoadmap = {
      ...rm,
      modules: reconstructedModules,
      topicCount: rmTopics.length,
      moduleCount: reconstructedModules.length,
    };

    // Ghi file JSON theo category
    const cat = rm.category || 'skill-based';
    const catDir = path.join(baseDir, cat);
    if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(catDir, `${rm.slug}.json`),
      JSON.stringify(fullRoadmap, null, 2),
      'utf-8'
    );

    if (!categorized[cat]) categorized[cat] = [];
    categorized[cat].push(fullRoadmap);
  }

  // Ghi master index.json
  const masterIndex = {
    generatedAt: new Date().toISOString(),
    source: 'MongoDB Atlas (Database: stories)',
    totalRoadmaps: roadmaps.length,
    totalModules,
    totalTopics,
    categories: Object.entries(categorized).map(([catKey, list]) => ({
      key: catKey,
      nameVi: CATEGORY_LABELS[catKey]?.vi || catKey,
      nameEn: CATEGORY_LABELS[catKey]?.en || catKey,
      count: list.length,
      roadmaps: list.map((rm) => ({
        slug: rm.slug,
        title: rm.title,
        moduleCount: rm.moduleCount || rm.modules?.length || 1,
        topicCount: rm.topicCount || 0,
        filePath: `${rm.category}/${rm.slug}.json`,
      })),
    })),
  };

  fs.writeFileSync(
    path.join(baseDir, 'index.json'),
    JSON.stringify(masterIndex, null, 2),
    'utf-8'
  );

  return masterIndex;
}

module.exports = function roadmapApiPlugin(context, options) {
  return {
    name: 'roadmap-api',

    /**
     * Build-time pre-fetch (Option A):
     * Khi chạy build cho production (GitHub Pages), plugin kéo data từ MongoDB
     * và ghi ra static JSON trong sources/roadmap-data, đảm bảo website chạy 100% offline.
     */
    async loadContent() {
      console.log('\n[roadmap-api] 🔄 Đang nạp dữ liệu từ MongoDB Atlas...');
      try {
        const masterIndex = await syncMongoToStaticFiles();
        console.log(
          `[roadmap-api] ✅ Đã đồng bộ thành công ${masterIndex.totalRoadmaps} roadmaps từ MongoDB sang static files.`
        );
        return masterIndex;
      } catch (err) {
        console.warn(
          '[roadmap-api] ⚠️ Không thể kết nối MongoDB Atlas lúc build. Sử dụng static files dự phòng hiện có.',
          err.message
        );
        return null;
      }
    },

    /**
     * Webpack Dev Server Middleware:
     * Cung cấp REST API trực tiếp cho Frontend và Edit Mode trên môi trường Dev
     */
    configureWebpack(config, isServer) {
      if (isServer) return {};

      return {
        devServer: {
          setupMiddlewares(middlewares, devServer) {
            if (!devServer) {
              throw new Error('webpack-dev-server is not defined');
            }

            const app = devServer.app;
            app.use('/api/roadmap', jsonBodyParser);

            // 1. GET /api/roadmap/list
            app.get('/api/roadmap/list', async (req, res) => {
              try {
                const db = await getDb();
                const roadmapsCol = db.collection('roadmaps');
                const topicsCol = db.collection('topics');

                const roadmaps = await roadmapsCol.find({}).sort({ category: 1, title: 1 }).toArray();
                const totalTopics = await topicsCol.countDocuments({});

                const categorized = {
                  'role-based': [],
                  'skill-based': [],
                  'tool-platform': [],
                  'best-practice': [],
                };

                let totalModules = 0;
                for (const rm of roadmaps) {
                  const cat = rm.category || 'skill-based';
                  if (!categorized[cat]) categorized[cat] = [];
                  categorized[cat].push(rm);
                  totalModules += rm.moduleCount || rm.modules?.length || 0;
                }

                res.json({
                  generatedAt: new Date().toISOString(),
                  totalRoadmaps: roadmaps.length,
                  totalModules,
                  totalTopics,
                  categories: Object.entries(categorized).map(([catKey, list]) => ({
                    key: catKey,
                    nameVi: CATEGORY_LABELS[catKey]?.vi || catKey,
                    nameEn: CATEGORY_LABELS[catKey]?.en || catKey,
                    count: list.length,
                    roadmaps: list.map((rm) => ({
                      slug: rm.slug,
                      title: rm.title,
                      moduleCount: rm.moduleCount || rm.modules?.length || 1,
                      topicCount: rm.topicCount || 0,
                      filePath: `${rm.category}/${rm.slug}.json`,
                    })),
                  })),
                });
              } catch (e) {
                res.status(500).json({ error: e.message });
              }
            });

            // 1.5. GET /api/roadmap/search-topics
            app.get('/api/roadmap/search-topics', async (req, res) => {
              const query = (req.query.q || '').trim();
              const excludeNodeId = req.query.excludeNodeId || '';

              try {
                const db = await getDb();
                const topicsCol = db.collection('topics');
                const roadmapsCol = db.collection('roadmaps');

                let filter = {};
                let regex = null;
                if (query) {
                  // Tìm kiếm không phân biệt hoa thường theo title, name hoặc description
                  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  regex = new RegExp(escaped, 'i');
                  filter = {
                    $or: [{ title: regex }, { name: regex }, { description: regex }],
                  };
                }

                if (excludeNodeId) {
                  filter.nodeId = { $ne: excludeNodeId };
                }

                // 1. Tìm các topic từ topicsCol
                const matches = await topicsCol
                  .find(filter)
                  .limit(25)
                  .project({
                    nodeId: 1,
                    title: 1,
                    description: 1,
                    roadmapSlug: 1,
                    moduleId: 1,
                    ref: 1,
                  })
                  .toArray();

                // Lấy thông tin roadmaps để gắn badge và tìm kiếm cả trong modules
                const roadmaps = await roadmapsCol.find({}).project({ slug: 1, title: 1, category: 1, modules: 1 }).toArray();
                const rmMap = new Map(roadmaps.map((r) => [r.slug, r]));

                const results = matches.map((m) => {
                  const rm = rmMap.get(m.roadmapSlug);
                  return {
                    nodeId: m.nodeId,
                    title: m.title,
                    description: m.description,
                    roadmapSlug: m.roadmapSlug,
                    roadmapTitle: rm ? rm.title : m.roadmapSlug,
                    category: rm ? rm.category : 'skill-based',
                    isRef: Boolean(m.ref?.isRef),
                    isModule: false,
                  };
                });

                // 2. Tìm kiếm trong danh sách modules của các roadmaps (đặc biệt là các module độc lập như Routing Terminology)
                const existingKeys = new Set(results.map((r) => `${r.roadmapSlug}-${r.nodeId}`));
                const moduleResults = [];

                for (const rm of roadmaps) {
                  const modules = rm.modules || [];
                  for (const mod of modules) {
                    if (excludeNodeId && (mod.id === excludeNodeId || mod.name === excludeNodeId)) {
                      continue;
                    }
                    const key = `${rm.slug}-${mod.id}`;
                    if (existingKeys.has(key)) continue;

                    let isMatch = false;
                    if (!query) {
                      // Nếu không có query, lấy một vài module tiêu biểu làm gợi ý
                      isMatch = moduleResults.length < 5;
                    } else if (regex) {
                      isMatch =
                        regex.test(mod.title || '') ||
                        regex.test(mod.name || '') ||
                        regex.test(mod.description || '');
                    }

                    if (isMatch) {
                      existingKeys.add(key);
                      moduleResults.push({
                        nodeId: mod.id,
                        title: mod.title || mod.name,
                        description: mod.description || '',
                        roadmapSlug: rm.slug,
                        roadmapTitle: rm.title || rm.slug,
                        category: rm.category || 'skill-based',
                        isRef: false,
                        isModule: true,
                      });
                    }
                  }
                }

                // Gộp kết quả topic và module, ưu tiên topic match trực tiếp rồi đến module
                const combined = [...results, ...moduleResults].slice(0, 30);

                res.json(combined);
              } catch (e) {
                res.status(500).json({ error: e.message });
              }
            });

            // 2. GET /api/roadmap/:slug
            app.get('/api/roadmap/:slug', async (req, res) => {
              const { slug } = req.params;
              try {
                const db = await getDb();
                const roadmap = await db.collection('roadmaps').findOne({ slug });
                if (!roadmap) {
                  return res.status(404).json({ error: `Không tìm thấy lộ trình ${slug}` });
                }

                // Lấy topics của roadmap này
                const rawTopics = await db.collection('topics').find({ roadmapSlug: slug }).toArray();

                // Live resolve nội dung cho các topic là ref node
                const refTopics = rawTopics.filter((t) => t.ref && t.ref.isRef);
                let sourceMap = new Map();
                if (refTopics.length > 0) {
                  const sourceKeys = refTopics.map((t) => ({
                    roadmapSlug: t.ref.sourceRoadmapSlug,
                    nodeId: t.ref.sourceNodeId,
                  }));
                  const sources = await db.collection('topics').find({ $or: sourceKeys }).toArray();
                  sourceMap = new Map(sources.map((s) => [`${s.roadmapSlug}:${s.nodeId}`, s]));

                  // Với các ref node mà source là module trong roadmaps, tìm trong roadmapsCol
                  const missingKeys = refTopics.filter(
                    (t) => !sourceMap.has(`${t.ref.sourceRoadmapSlug}:${t.ref.sourceNodeId}`)
                  );
                  if (missingKeys.length > 0) {
                    const slugs = [...new Set(missingKeys.map((t) => t.ref.sourceRoadmapSlug))];
                    const refRoadmaps = await db.collection('roadmaps').find({ slug: { $in: slugs } }).toArray();
                    for (const rm of refRoadmaps) {
                      for (const mod of rm.modules || []) {
                        sourceMap.set(`${rm.slug}:${mod.id}`, {
                          nodeId: mod.id,
                          title: mod.title || mod.name,
                          description: mod.description || '',
                          content: mod.description ? `# ${mod.title || mod.name}\n\n${mod.description}` : '',
                          resources: mod.resources || [],
                        });
                      }
                    }
                  }
                }

                const topics = rawTopics.map((t) => {
                  if (t.ref && t.ref.isRef) {
                    const source = sourceMap.get(`${t.ref.sourceRoadmapSlug}:${t.ref.sourceNodeId}`);
                    if (source) {
                      return {
                        ...t,
                        title: t.title || source.title,
                        description: source.description || t.description,
                        content: source.content || t.content,
                        resources: source.resources || t.resources || [],
                      };
                    }
                  }
                  return t;
                });

                const topicsByModule = new Map();
                for (const t of topics) {
                  if (!topicsByModule.has(t.moduleId)) {
                    topicsByModule.set(t.moduleId, []);
                  }
                  topicsByModule.get(t.moduleId).push(t);
                }

                const reconstructedModules = (roadmap.modules || []).map((mod) => {
                  const subtopics = (topicsByModule.get(mod.id) || []).sort(
                    (a, b) => (a.order ?? 0) - (b.order ?? 0)
                  );
                  return {
                    ...mod,
                    subtopics,
                  };
                });

                res.json({
                  ...roadmap,
                  modules: reconstructedModules,
                  topics: topics,
                });
              } catch (e) {
                res.status(500).json({ error: e.message });
              }
            });

            // 3. GET /api/roadmap/:slug/topics
            app.get('/api/roadmap/:slug/topics', async (req, res) => {
              const { slug } = req.params;
              try {
                const db = await getDb();
                const topics = await db
                  .collection('topics')
                  .find({ roadmapSlug: slug })
                  .sort({ order: 1 })
                  .toArray();
                res.json(topics);
              } catch (e) {
                res.status(500).json({ error: e.message });
              }
            });

            // 4. PUT /api/roadmap/:slug/topic/:nodeId (Dev-only Write)
            app.put('/api/roadmap/:slug/topic/:nodeId', async (req, res) => {
              const { slug, nodeId } = req.params;
              const updates = req.body;
              try {
                const db = await getDb();
                const topicsCol = db.collection('topics');

                // Bỏ qua _id nếu có trong body updates
                delete updates._id;

                const result = await topicsCol.updateOne(
                  { roadmapSlug: slug, nodeId },
                  { $set: { ...updates, updatedAt: new Date().toISOString() } }
                );

                if (result.matchedCount === 0) {
                  return res.status(404).json({ error: `Không tìm thấy topic với nodeId: ${nodeId}` });
                }

                const updatedTopic = await topicsCol.findOne({ roadmapSlug: slug, nodeId });

                // Đồng bộ ngầm ra file static json để dev & build luôn cập nhật
                syncMongoToStaticFiles().catch((err) =>
                  console.warn('[roadmap-api] Sync static warning:', err.message)
                );

                res.json({ success: true, topic: updatedTopic });
              } catch (e) {
                res.status(500).json({ error: e.message });
              }
            });

            // 5. DELETE /api/roadmap/:slug/topic/:nodeId (Dev-only Write)
            app.delete('/api/roadmap/:slug/topic/:nodeId', async (req, res) => {
              const { slug, nodeId } = req.params;
              try {
                const db = await getDb();
                const topicsCol = db.collection('topics');
                const roadmapsCol = db.collection('roadmaps');

                const deleteRes = await topicsCol.deleteOne({ roadmapSlug: slug, nodeId });
                if (deleteRes.deletedCount === 0) {
                  return res.status(404).json({ error: `Không tìm thấy topic với nodeId: ${nodeId}` });
                }

                // Giảm topicCount trong roadmaps
                await roadmapsCol.updateOne({ slug }, { $inc: { topicCount: -1 } });

                // Đồng bộ ngầm ra file static
                syncMongoToStaticFiles().catch((err) =>
                  console.warn('[roadmap-api] Sync static warning:', err.message)
                );

                res.json({ success: true });
              } catch (e) {
                res.status(500).json({ error: e.message });
              }
            });

            // 6. PUT /api/roadmap/:slug/module/:moduleId (Dev-only Write)
            app.put('/api/roadmap/:slug/module/:moduleId', async (req, res) => {
              const { slug, moduleId } = req.params;
              const { title, description, resources } = req.body;
              try {
                const db = await getDb();
                const roadmapsCol = db.collection('roadmaps');

                const setFields = {};
                if (title !== undefined) setFields['modules.$.title'] = title;
                if (description !== undefined) setFields['modules.$.description'] = description;
                if (resources !== undefined) setFields['modules.$.resources'] = resources;

                const result = await roadmapsCol.updateOne(
                  { slug, 'modules.id': moduleId },
                  { $set: setFields }
                );

                if (result.matchedCount === 0) {
                  return res.status(404).json({ error: `Không tìm thấy module với id: ${moduleId}` });
                }

                syncMongoToStaticFiles().catch((err) =>
                  console.warn('[roadmap-api] Sync static warning:', err.message)
                );

                res.json({ success: true });
              } catch (e) {
                res.status(500).json({ error: e.message });
              }
            });

            // 7. DELETE /api/roadmap/:slug/module/:moduleId (Dev-only Write)
            app.delete('/api/roadmap/:slug/module/:moduleId', async (req, res) => {
              const { slug, moduleId } = req.params;
              try {
                const db = await getDb();
                const roadmapsCol = db.collection('roadmaps');
                const topicsCol = db.collection('topics');

                // Đếm số topic thuộc module này để giảm tổng số
                const topicCountToRemove = await topicsCol.countDocuments({
                  roadmapSlug: slug,
                  moduleId,
                });

                // Xoá các topics thuộc module
                await topicsCol.deleteMany({ roadmapSlug: slug, moduleId });

                // Xoá module khỏi mảng modules của roadmap
                await roadmapsCol.updateOne(
                  { slug },
                  {
                    $pull: { modules: { id: moduleId } },
                    $inc: {
                      moduleCount: -1,
                      topicCount: -topicCountToRemove,
                    },
                  }
                );

                syncMongoToStaticFiles().catch((err) =>
                  console.warn('[roadmap-api] Sync static warning:', err.message)
                );

                res.json({ success: true, deletedTopics: topicCountToRemove });
              } catch (e) {
                res.status(500).json({ error: e.message });
              }
            });

            // 8. POST /api/roadmap/:slug/topic/:parentNodeId/ref-child (Dev-only Write)
            app.post('/api/roadmap/:slug/topic/:parentNodeId/ref-child', async (req, res) => {
              const { slug, parentNodeId } = req.params;
              const { sourceRoadmapSlug, sourceNodeId, moduleId } = req.body;

              if (!sourceRoadmapSlug || !sourceNodeId) {
                return res.status(400).json({ error: 'sourceRoadmapSlug và sourceNodeId là bắt buộc' });
              }

              try {
                const db = await getDb();
                const topicsCol = db.collection('topics');
                const roadmapsCol = db.collection('roadmaps');

                // 1. Tìm topic nguồn trong DB (topicsCol hoặc modules trong roadmapsCol)
                let sourceTopic = await topicsCol.findOne({
                  roadmapSlug: sourceRoadmapSlug,
                  nodeId: sourceNodeId,
                });

                if (!sourceTopic) {
                  const sRoadmap = await roadmapsCol.findOne({ slug: sourceRoadmapSlug });
                  const matchedMod = (sRoadmap?.modules || []).find(
                    (m) => m.id === sourceNodeId || m.name === sourceNodeId
                  );
                  if (matchedMod) {
                    sourceTopic = {
                      nodeId: matchedMod.id,
                      name: matchedMod.name || matchedMod.id,
                      title: matchedMod.title || matchedMod.name,
                      description: matchedMod.description || '',
                      content: matchedMod.description ? `# ${matchedMod.title || matchedMod.name}\n\n${matchedMod.description}` : '',
                      resources: matchedMod.resources || [],
                      roadmapSlug: sourceRoadmapSlug,
                    };
                  }
                }

                if (!sourceTopic) {
                  return res.status(404).json({ error: 'Không tìm thấy topic nguồn trong database' });
                }

                // 2. Tìm topic cha trong roadmap này (hỗ trợ cả nodeId, name, hoặc module cha)
                let parentTopic = await topicsCol.findOne({
                  roadmapSlug: slug,
                  $or: [{ nodeId: parentNodeId }, { name: parentNodeId }],
                });

                let parentTitle = parentTopic?.title;
                let targetModuleId = moduleId || parentTopic?.moduleId;

                if (!parentTopic) {
                  const roadmapDoc = await roadmapsCol.findOne({ slug });
                  const matchedMod = (roadmapDoc?.modules || []).find(
                    (m) => m.id === parentNodeId || m.name === parentNodeId || m.title === parentNodeId
                  );
                  if (matchedMod) {
                    parentTitle = matchedMod.title || matchedMod.name;
                    targetModuleId = matchedMod.id;
                  } else if (req.body.parentTitle) {
                    parentTitle = req.body.parentTitle;
                  } else {
                    return res.status(404).json({ error: 'Không tìm thấy topic hoặc module cha trong roadmap này' });
                  }
                }

                // 3. Tạo Ref Node document mới
                const refNodeId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
                const refDoc = {
                  roadmapSlug: slug,
                  moduleId: targetModuleId,
                  nodeId: refNodeId,
                  name: sourceTopic.name || refNodeId,
                  title: sourceTopic.title,
                  description: sourceTopic.description,
                  content: sourceTopic.content,
                  resources: sourceTopic.resources || [],
                  parentTopic: {
                    id: parentNodeId,
                    title: parentTitle || 'Chủ đề cha',
                  },
                  ref: {
                    isRef: true,
                    sourceRoadmapSlug,
                    sourceNodeId,
                  },
                  order: 999,
                  createdAt: new Date().toISOString(),
                };

                await topicsCol.insertOne(refDoc);

                // Tăng topicCount trong roadmaps
                await roadmapsCol.updateOne({ slug }, { $inc: { topicCount: 1 } });

                // Đồng bộ ngầm static files
                syncMongoToStaticFiles().catch((err) =>
                  console.warn('[roadmap-api] Sync static warning:', err.message)
                );

                res.json({ success: true, refTopic: refDoc });
              } catch (e) {
                res.status(500).json({ error: e.message });
              }
            });

            // 9. DELETE /api/roadmap/:slug/topic/:refNodeId/unlink (Dev-only Write)
            app.delete('/api/roadmap/:slug/topic/:refNodeId/unlink', async (req, res) => {
              const { slug, refNodeId } = req.params;
              try {
                const db = await getDb();
                const topicsCol = db.collection('topics');
                const roadmapsCol = db.collection('roadmaps');

                const deleteRes = await topicsCol.deleteOne({
                  roadmapSlug: slug,
                  nodeId: refNodeId,
                });

                if (deleteRes.deletedCount === 0) {
                  return res.status(404).json({ error: `Không tìm thấy topic với nodeId: ${refNodeId}` });
                }

                // Giảm topicCount trong roadmaps
                await roadmapsCol.updateOne({ slug }, { $inc: { topicCount: -1 } });

                syncMongoToStaticFiles().catch((err) =>
                  console.warn('[roadmap-api] Sync static warning:', err.message)
                );

                res.json({ success: true });
              } catch (e) {
                res.status(500).json({ error: e.message });
              }
            });

            return middlewares;
          },
        },
      };
    },
  };
};
