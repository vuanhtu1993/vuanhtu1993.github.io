import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Đảm bảo env được load dù script được chạy từ bất kỳ thư mục nào
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

let client: MongoClient | null = null;
let db: Db | null = null;

const DB_NAME = 'stories';

/**
 * Singleton MongoDB Client & Database instance
 * Sử dụng chung cho các crawler agents và migration scripts
 */
export async function getDb(): Promise<Db> {
  if (db && client) {
    return db;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI không tìm thấy trong biến môi trường (.env)');
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(DB_NAME);

  // Tạo indexes cần thiết nếu chưa có
  await ensureIndexes(db);

  return db;
}

/**
 * Đảm bảo các indexes tối ưu cho truy vấn roadmaps và topics
 */
async function ensureIndexes(database: Db): Promise<void> {
  try {
    const roadmapsCol = database.collection('roadmaps');
    const topicsCol = database.collection('topics');

    // Index unique cho slug lộ trình
    await roadmapsCol.createIndex({ slug: 1 }, { unique: true });

    // Compound index cho truy vấn topic theo roadmap và module
    await topicsCol.createIndex({ roadmapSlug: 1, moduleId: 1 });
    await topicsCol.createIndex({ roadmapSlug: 1, nodeId: 1 });
    await topicsCol.createIndex({ roadmapSlug: 1, order: 1 });
  } catch (err) {
    // Không block flow nếu index đã tồn tại
    console.warn('Cảnh báo khi khởi tạo MongoDB indexes:', (err as Error).message);
  }
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
