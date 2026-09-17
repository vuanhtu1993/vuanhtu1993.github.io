const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

let client = null;
let db = null;
const DB_NAME = 'stories';

/**
 * MongoDB Client dành cho Docusaurus Plugin (CommonJS runtime)
 */
async function getDb() {
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
  return db;
}

async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = { getDb, closeDb, DB_NAME };
