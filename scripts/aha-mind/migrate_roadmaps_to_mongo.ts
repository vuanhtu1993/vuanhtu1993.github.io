import fs from 'fs';
import path from 'path';
import { getDb, closeDb } from './lib/mongo';

/**
 * Migration script: Đẩy toàn bộ dữ liệu roadmaps hiện có trong sources/roadmap-data vào MongoDB
 */
async function migrate() {
  console.log('🚀 Bắt đầu di chuyển dữ liệu Roadmap sang MongoDB Atlas...');
  const db = await getDb();
  const roadmapsCol = db.collection('roadmaps');
  const topicsCol = db.collection('topics');

  const baseDir = path.resolve(process.cwd(), 'sources/roadmap-data');
  const categories = ['skill-based', 'role-based', 'tool-platform', 'best-practice'];

  let totalRoadmaps = 0;
  let totalTopics = 0;

  for (const cat of categories) {
    const catDir = path.join(baseDir, cat);
    if (!fs.existsSync(catDir)) continue;

    const files = fs.readdirSync(catDir).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(catDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const rm = JSON.parse(content);

      if (!rm.slug) {
        console.warn(`Bỏ qua file ${file}: không có slug`);
        continue;
      }

      console.log(`📦 Đang xử lý lộ trình: ${rm.title || rm.slug} (${cat}/${file})...`);

      const topicDocs: any[] = [];
      const modulesWithoutSubtopics = (rm.modules || []).map((mod: any) => {
        const subtopics = mod.subtopics || [];
        for (let i = 0; i < subtopics.length; i++) {
          const t = subtopics[i];
          topicDocs.push({
            roadmapSlug: rm.slug,
            moduleId: mod.id,
            order: i,
            ...t,
          });
        }
        const { subtopics: _, ...modWithout } = mod;
        return modWithout;
      });

      // Đếm số lượng topic thực tế
      const actualTopicCount = topicDocs.length || rm.topicCount || 0;
      const actualModuleCount = modulesWithoutSubtopics.length || rm.moduleCount || 0;

      // Upsert roadmap document
      await roadmapsCol.updateOne(
        { slug: rm.slug },
        {
          $set: {
            ...rm,
            modules: modulesWithoutSubtopics,
            topicCount: actualTopicCount,
            moduleCount: actualModuleCount,
            category: rm.category || cat,
            updatedAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );

      // Cập nhật topics
      await topicsCol.deleteMany({ roadmapSlug: rm.slug });
      if (topicDocs.length > 0) {
        await topicsCol.insertMany(topicDocs);
      }

      totalRoadmaps++;
      totalTopics += topicDocs.length;
      console.log(`  ✅ Đã lưu ${actualModuleCount} modules, ${topicDocs.length} topics cho ${rm.slug}`);
    }
  }

  console.log(`\n🎉 Hoàn thành di chuyển: ${totalRoadmaps} roadmaps, ${totalTopics} topics vào MongoDB!`);
  await closeDb();
}

migrate().catch((err) => {
  console.error('❌ Lỗi di chuyển dữ liệu:', err);
  process.exit(1);
});
