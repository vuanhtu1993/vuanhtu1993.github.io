import test from "node:test";
import assert from "node:assert";
import { z } from "zod";
import { HiveService } from "./hive-service";

test("HiveService - Singleton instance", () => {
  const instance1 = HiveService.getInstance();
  const instance2 = HiveService.getInstance();
  assert.strictEqual(instance1, instance2);
});

test("HiveService - Postel Auto-healing sửa mảng trần thành object có field items", () => {
  const service = HiveService.getInstance();
  const schema = z.object({
    items: z.array(z.object({ name: z.string() })),
  });

  const rawArray = [{ name: "Topic 1" }, { name: "Topic 2" }];
  const healed = (service as any).healStructuredOutput(schema, rawArray);

  assert.deepStrictEqual(healed, {
    items: [{ name: "Topic 1" }, { name: "Topic 2" }],
  });
});

test("HiveService - Sanitization loại bỏ markdown backticks ```json ... ```", () => {
  const service = HiveService.getInstance();
  const input = "```json\n{\"key\": \"value\"}\n```";
  const cleaned = (service as any).sanitizeJsonContent(input);
  assert.strictEqual(cleaned, '{"key": "value"}');
});
