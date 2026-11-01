import test from "node:test";
import assert from "node:assert";
import { Command } from "commander";

test("Interpreter CLI - chấp nhận flag --provider gemini hoặc --provider hive", () => {
  const program = new Command();
  program
    .option("--provider <type>", "LLM Provider: gemini hoặc hive", "hive")
    .option("--title <title>", "Tiêu đề sách");

  program.parse(["node", "test", "--provider", "hive", "--title", "Clean Code"]);
  const opts = program.opts();

  assert.strictEqual(opts.provider, "hive");
  assert.strictEqual(opts.title, "Clean Code");
});

test("Interpreter CLI - fallback sang gemini nếu chọn --provider gemini", () => {
  const program = new Command();
  program
    .option("--provider <type>", "LLM Provider: gemini hoặc hive", "hive")
    .option("--title <title>", "Tiêu đề sách");

  program.parse(["node", "test", "--provider", "gemini", "--title", "Clean Code"]);
  const opts = program.opts();

  assert.strictEqual(opts.provider, "gemini");
});
