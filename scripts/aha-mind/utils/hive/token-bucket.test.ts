import test from "node:test";
import assert from "node:assert";
import { TokenBucket } from "./token-bucket";

test("TokenBucket - cấp phát token ngay khi thùng còn token", async () => {
  const bucket = new TokenBucket(5, 200);
  assert.strictEqual(bucket.getAvailableTokens(), 5);

  await bucket.acquireToken();
  assert.strictEqual(bucket.getAvailableTokens(), 4);
  bucket.destroy();
});

test("TokenBucket - xếp hàng khi thùng cạn token và tự giải phóng sau interval", async () => {
  const bucket = new TokenBucket(2, 50); // Dung lượng 2, hồi mỗi 50ms
  await bucket.acquireToken();
  await bucket.acquireToken();
  assert.strictEqual(bucket.getAvailableTokens(), 0);

  const start = Date.now();
  await bucket.acquireToken(); // Chờ refill
  const elapsed = Date.now() - start;

  assert.ok(elapsed >= 40, `Elapsed should be at least 40ms, got ${elapsed}ms`);
  bucket.destroy();
});
