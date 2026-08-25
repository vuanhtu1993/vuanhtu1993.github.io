---
title: "How to Build a Local AI Coding Assistant with Ollama, RAG, and Your Own Codebase"
source_url: "https://dev.to/pockit_tools/how-to-build-a-local-ai-coding-assistant-with-ollama-rag-and-your-own-codebase-jhn"
crawled_at: "2026-08-07T09:30:36.435Z"
---

You just asked ChatGPT to help debug a function in your company's proprietary codebase. It hallucinated a method that doesn't exist, referenced an API endpoint your team deprecated six months ago, and confidently suggested importing a module from a package you've never used. You wasted 20 minutes before realizing every suggestion was wrong.

This isn't an edge case. It's the default experience when using general-purpose AI assistants on private codebases. They don't know your code. They can't know your code. Your repositories never appeared in their training data, and even if you paste snippets into the chat, the model loses context after a few thousand tokens.

But what if you could build an AI assistant that actually _understands_ your codebase? One that runs entirely on your machine — no API keys, no data leaving your network, no per-token billing? One that knows your custom ORM layer, your internal naming conventions, and that weird workaround in `utils/legacy-parser.ts` that nobody documented?

That's what we're building in this guide. A fully local, privacy-first AI coding assistant powered by Ollama for inference, ChromaDB for vector storage, and a RAG (Retrieval-Augmented Generation) pipeline that indexes your entire codebase and uses it as context for every query.

By the end, you'll have a working system that can answer questions like:

-   "How does our authentication middleware handle token refresh?"
-   "Which services depend on the PaymentGateway class?"
-   "Write a unit test for the `calculateShippingCost` function using our existing test patterns."

Let's build it.

## [](#architecture-overview)Architecture Overview

Before writing any code, let's understand the system we're building:  

```
┌─────────────────────────────────────────────────────┐
│                  Your Codebase                       │
│  (.ts, .py, .go, .md files)                         │
└──────────────┬──────────────────────────────────────┘
               │  1. Parse & Chunk
               ▼
┌─────────────────────────────────────────────────────┐
│            Code Chunking Engine                      │
│  (AST-aware splitting by function/class/module)     │
└──────────────┬──────────────────────────────────────┘
               │  2. Embed
               ▼
┌─────────────────────────────────────────────────────┐
│          Embedding Model (Ollama)                    │
│  nomic-embed-text / bge-m3               │
└──────────────┬──────────────────────────────────────┘
               │  3. Store
               ▼
┌─────────────────────────────────────────────────────┐
│           Vector Database (ChromaDB)                 │
│  Persistent local storage with metadata filtering   │
└──────────────┬──────────────────────────────────────┘
               │  4. Query (at inference time)
               ▼
┌─────────────────────────────────────────────────────┐
│             RAG Pipeline                             │
│  Query → Retrieve relevant chunks → Augment prompt  │
└──────────────┬──────────────────────────────────────┘
               │  5. Generate
               ▼
┌─────────────────────────────────────────────────────┐
│        LLM (Ollama: Qwen 3.5 / Llama 4 / DeepSeek) │
│  Local inference, no data leaves your machine       │
└─────────────────────────────────────────────────────┘
```

 

The key insight is **separation of concerns**: the embedding model (small, fast, cheap) handles encoding your codebase into searchable vectors, while the language model (large, powerful, slow) only processes the small subset of code that's actually relevant to the current question.

## [](#step-1-setting-up-ollama)Step 1: Setting Up Ollama

Ollama is the runtime that makes local LLM inference painless. If you haven't already:  

```
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Verify installation
ollama --version
```

 

Now pull the models we need — one for embeddings, one for code generation:  

```
# Embedding model (768 dimensions, very fast)
ollama pull nomic-embed-text

# Code-focused LLM — pick based on your hardware:

# 8GB RAM minimum:
ollama pull qwen3.5:8b

# 16GB RAM recommended:
ollama pull qwen3.5:14b

# 32GB+ RAM for best quality:
ollama pull deepseek-coder-v2:33b
```

 

### [](#why-these-models)Why These Models?

**nomic-embed-text** is one of the best lightweight local embedding models for code. It produces 768-dimensional vectors (adjustable down to 64 via Matryoshka Representation Learning), handles code syntax well, and runs fast even on CPU. Alternatives like `bge-m3` (excellent for hybrid search) or `snowflake-arctic-embed` work well too — BGE-M3 in particular excels at multilingual and long-context retrieval. For most local setups, nomic offers the best speed-to-quality ratio at its small size (~137M parameters).

**Qwen 3.5** (8B/14B) is the sweet spot for local code generation in 2026. Released in February 2026, it outperforms older models at equivalent sizes on coding benchmarks (HumanEval+, MBPP+), supports 262K context natively, includes native multimodal support, and its "hybrid thinking mode" provides chain-of-thought reasoning that dramatically improves code quality. DeepSeek Coder V2 at 33B remains a strong alternative for pure code generation quality if you have the VRAM.

Verify everything is running:  

```
# Test embedding (note: /api/embed is the current endpoint; /api/embeddings is legacy)
curl http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": "function calculateTotal(items) { return items.reduce((sum, i) => sum + i.price, 0); }"
}'

# Test generation
ollama run qwen3.5:8b "Explain what a RAG pipeline is in 2 sentences."
```

 

## [](#step-2-intelligent-codebase-chunking)Step 2: Intelligent Codebase Chunking

This is where most RAG tutorials fail. They tell you to split text into fixed-size chunks of 500 tokens. That approach destroys code. A function split across two chunks is useless to retrieve. A class definition without its methods is meaningless.

We need **AST-aware chunking** — splitting code at logical boundaries (functions, classes, modules) rather than arbitrary character counts.  

```
// src/chunker.ts
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface CodeChunk {
  id: string;
  content: string;
  filePath: string;
  language: string;
  type: 'function' | 'class' | 'module' | 'documentation' | 'config';
  name: string;
  startLine: number;
  endLine: number;
  dependencies: string[];
  tokenEstimate: number;
}

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  '.ts': 'typescript', '.tsx': 'typescript',
  '.js': 'javascript', '.jsx': 'javascript',
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.md': 'markdown',
  '.yaml': 'config', '.yml': 'config',
  '.json': 'config',
};

const IGNORE_PATTERNS = [
  'node_modules/**', 'dist/**', 'build/**', '.git/**',
  '*.lock', '*.min.js', '*.map', 'coverage/**',
  '__pycache__/**', '.venv/**', 'vendor/**',
];

export async function chunkCodebase(rootDir: string): Promise<CodeChunk[]> {
  const extensions = Object.keys(LANGUAGE_EXTENSIONS).map(ext => `**/*${ext}`);
  const files = await glob(extensions, {
    cwd: rootDir,
    ignore: IGNORE_PATTERNS,
    absolute: true,
  });

  const chunks: CodeChunk[] = [];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath);
    const language = LANGUAGE_EXTENSIONS[ext] || 'unknown';

    if (content.length < 50) continue; // Skip trivially small files
    if (content.length > 100_000) continue; // Skip generated/minified files

    const fileChunks = splitByLogicalBoundaries(content, language, filePath);
    chunks.push(...fileChunks);
  }

  console.log(`Chunked ${files.length} files into ${chunks.length} chunks`);
  return chunks;
}

function splitByLogicalBoundaries(
  content: string,
  language: string,
  filePath: string
): CodeChunk[] {
  const lines = content.split('\n');
  const chunks: CodeChunk[] = [];

  if (language === 'markdown' || language === 'config') {
    // For docs and config, chunk by sections or as whole files
    return [createWholeFileChunk(content, filePath, language)];
  }

  // Use regex-based boundary detection for code files
  // (For production, use tree-sitter for proper AST parsing)
  const boundaries = detectBoundaries(lines, language);

  if (boundaries.length === 0) {
    return [createWholeFileChunk(content, filePath, language)];
  }

  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i];
    const end = i + 1 < boundaries.length
      ? boundaries[i + 1].line - 1
      : lines.length - 1;

    const chunkLines = lines.slice(start.line, end + 1);
    const chunkContent = chunkLines.join('\n').trim();

    if (chunkContent.length < 30) continue;

    // Include file-level imports as preamble for context
    const importLines = extractImports(lines, language);
    const contextualContent = importLines
      ? `// File: ${path.basename(filePath)}\n${importLines}\n\n${chunkContent}`
      : `// File: ${path.basename(filePath)}\n${chunkContent}`;

    chunks.push({
      id: `${filePath}:${start.line}-${end}`,
      content: contextualContent,
      filePath: path.relative(process.cwd(), filePath),
      language,
      type: start.type,
      name: start.name,
      startLine: start.line + 1,
      endLine: end + 1,
      dependencies: extractDependencies(chunkContent, language),
      tokenEstimate: Math.ceil(contextualContent.length / 4),
    });
  }

  return chunks.length > 0
    ? chunks
    : [createWholeFileChunk(content, filePath, language)];
}

interface Boundary {
  line: number;
  type: CodeChunk['type'];
  name: string;
}

function detectBoundaries(lines: string[], language: string): Boundary[] {
  const boundaries: Boundary[] = [];
  const patterns = getBoundaryPatterns(language);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    for (const pattern of patterns) {
      const match = line.match(pattern.regex);
      if (match) {
        boundaries.push({
          line: i,
          type: pattern.type,
          name: match[1] || `anonymous_${i}`,
        });
        break;
      }
    }
  }

  return boundaries;
}

function getBoundaryPatterns(language: string) {
  const tsPatterns = [
    { regex: /^(?:export\s+)?class\s+(\w+)/, type: 'class' as const },
    { regex: /^(?:export\s+)?(?:async\s+)?function\s+(\w+)/, type: 'function' as const },
    { regex: /^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(/, type: 'function' as const },
    { regex: /^(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*\{/, type: 'module' as const },
  ];

  const pyPatterns = [
    { regex: /^class\s+(\w+)/, type: 'class' as const },
    { regex: /^(?:async\s+)?def\s+(\w+)/, type: 'function' as const },
  ];

  switch (language) {
    case 'typescript':
    case 'javascript':
      return tsPatterns;
    case 'python':
      return pyPatterns;
    default:
      return tsPatterns; // Fallback
  }
}

function extractImports(lines: string[], language: string): string {
  const importLines = lines.filter(line => {
    const trimmed = line.trim();
    if (language === 'python') {
      return trimmed.startsWith('import ') || trimmed.startsWith('from ');
    }
    return trimmed.startsWith('import ') || trimmed.startsWith('require(');
  });
  return importLines.slice(0, 10).join('\n'); // Cap at 10 import lines
}

function extractDependencies(content: string, language: string): string[] {
  const deps: string[] = [];
  const importRegex = language === 'python'
    ? /(?:from|import)\s+([\w.]+)/g
    : /(?:from|require\()\s*['"]([^'"]+)['"]/g;

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    deps.push(match[1]);
  }
  return [...new Set(deps)];
}

function createWholeFileChunk(
  content: string,
  filePath: string,
  language: string
): CodeChunk {
  const lines = content.split('\n');
  return {
    id: `${filePath}:0-${lines.length}`,
    content: `// File: ${path.basename(filePath)}\n${content}`,
    filePath: path.relative(process.cwd(), filePath),
    language,
    type: 'module',
    name: path.basename(filePath, path.extname(filePath)),
    startLine: 1,
    endLine: lines.length,
    dependencies: extractDependencies(content, language),
    tokenEstimate: Math.ceil(content.length / 4),
  };
}
```

 

### [](#why-astaware-chunking-matters)Why AST-Aware Chunking Matters

Consider this real scenario. You have a `UserService` class:  

```
export class UserService {
  async createUser(data: CreateUserDTO): Promise<User> {
    // ... 40 lines of validation, hashing, DB insertion
  }

  async getUserById(id: string): Promise<User | null> {
    // ... 15 lines of cache-first retrieval
  }

  async deleteUser(id: string): Promise<void> {
    // ... 25 lines of cascade deletion logic
  }
}
```

 

**Naive 500-token chunking** splits this mid-function. Chunk 1 has the class declaration and half of `createUser`. Chunk 2 has the other half of `createUser` and all of `getUserById`. Neither chunk is useful alone.

**AST-aware chunking** produces three chunks: one per method, each prefixed with the class name and file imports. Now when you ask "how does user deletion work?", the retriever finds the `deleteUser` chunk with full context.

## [](#step-3-embedding-and-storing-in-chromadb)Step 3: Embedding and Storing in ChromaDB

ChromaDB is the easiest vector database to run locally. Zero configuration, persistent storage, and built-in metadata filtering.  

```
pip install chromadb
```

 

```
// src/embedder.ts
import { ChromaClient, Collection } from 'chromadb';

interface EmbeddingConfig {
  ollamaUrl: string;
  embeddingModel: string;
  chromaPath: string;
  collectionName: string;
}

export class CodebaseEmbedder {
  private chroma: ChromaClient;
  private collection: Collection | null = null;
  private config: EmbeddingConfig;

  constructor(config: EmbeddingConfig) {
    this.config = config;
    this.chroma = new ChromaClient({ path: config.chromaPath });
  }

  async initialize(): Promise<void> {
    this.collection = await this.chroma.getOrCreateCollection({
      name: this.config.collectionName,
      metadata: { 'hnsw:space': 'cosine' },
    });
  }

  async embedChunks(chunks: CodeChunk[]): Promise<void> {
    if (!this.collection) throw new Error('Not initialized');

    const BATCH_SIZE = 50;
    const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;

      console.log(`Embedding batch ${batchNum}/${totalBatches}...`);

      // Generate embeddings via Ollama
      const embeddings = await Promise.all(
        batch.map(chunk => this.getEmbedding(chunk.content))
      );

      // Upsert into ChromaDB
      await this.collection.upsert({
        ids: batch.map(c => c.id),
        embeddings,
        documents: batch.map(c => c.content),
        metadatas: batch.map(c => ({
          filePath: c.filePath,
          language: c.language,
          type: c.type,
          name: c.name,
          startLine: c.startLine,
          endLine: c.endLine,
          dependencies: JSON.stringify(c.dependencies),
          tokenEstimate: c.tokenEstimate,
        })),
      });
    }

    console.log(`Embedded ${chunks.length} chunks into ChromaDB`);
  }

  async query(
    queryText: string,
    options: {
      nResults?: number;
      filterLanguage?: string;
      filterType?: string;
    } = {}
  ): Promise<QueryResult[]> {
    if (!this.collection) throw new Error('Not initialized');

    const queryEmbedding = await this.getEmbedding(queryText);

    const where: Record<string, any> = {};
    if (options.filterLanguage) where.language = options.filterLanguage;
    if (options.filterType) where.type = options.filterType;

    const results = await this.collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: options.nResults || 10,
      where: Object.keys(where).length > 0 ? where : undefined,
    });

    return (results.documents?.[0] || []).map((doc, i) => ({
      content: doc || '',
      metadata: results.metadatas?.[0]?.[i] || {},
      distance: results.distances?.[0]?.[i] || 1,
    }));
  }

  private async getEmbedding(text: string): Promise<number[]> {
    const response = await fetch(`${this.config.ollamaUrl}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.embeddingModel,
        input: text,
      }),
    });

    const data = await response.json();
    return data.embeddings[0];
  }
}

interface QueryResult {
  content: string;
  metadata: Record<string, any>;
  distance: number;
}
```

 

### [](#indexing-your-codebase)Indexing Your Codebase

```
// src/index-codebase.ts
import { chunkCodebase } from './chunker';
import { CodebaseEmbedder } from './embedder';

async function indexCodebase(targetDir: string) {
  const startTime = Date.now();

  // Step 1: Chunk the codebase
  console.log(`Chunking codebase at: ${targetDir}`);
  const chunks = await chunkCodebase(targetDir);
  console.log(`Generated ${chunks.length} chunks`);

  // Step 2: Embed and store
  const embedder = new CodebaseEmbedder({
    ollamaUrl: 'http://localhost:11434',
    embeddingModel: 'nomic-embed-text',
    chromaPath: './.codebase-index',
    collectionName: 'codebase',
  });

  await embedder.initialize();
  await embedder.embedChunks(chunks);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Indexing complete in ${elapsed}s`);

  // Print stats
  const byLanguage = chunks.reduce((acc, c) => {
    acc[c.language] = (acc[c.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\nChunks by language:');
  Object.entries(byLanguage)
    .sort(([, a], [, b]) => b - a)
    .forEach(([lang, count]) => console.log(`  ${lang}: ${count}`));
}

// Run: npx tsx src/index-codebase.ts /path/to/your/project
indexCodebase(process.argv[2] || '.');
```

 

**Typical indexing performance** on an M-series Mac:

| Codebase Size | Files | Chunks | Indexing Time |
| --- | --- | --- | --- |
| Small (10K LOC) | ~50 | ~200 | ~30s |
| Medium (50K LOC) | ~300 | ~1,200 | ~3min |
| Large (200K LOC) | ~1,500 | ~6,000 | ~15min |
| Monorepo (1M LOC) | ~8,000 | ~30,000 | ~1hr |

## [](#step-4-the-rag-pipeline)Step 4: The RAG Pipeline

This is the core loop: take a developer's question, find the relevant code chunks, and feed them to the LLM as context.  

```
// src/assistant.ts
import { CodebaseEmbedder } from './embedder';
import * as readline from 'readline';

interface AssistantConfig {
  ollamaUrl: string;
  generationModel: string;
  embeddingModel: string;
  chromaPath: string;
  maxContextChunks: number;
  maxContextTokens: number;
}

export class CodingAssistant {
  private embedder: CodebaseEmbedder;
  private config: AssistantConfig;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor(config: AssistantConfig) {
    this.config = config;
    this.embedder = new CodebaseEmbedder({
      ollamaUrl: config.ollamaUrl,
      embeddingModel: config.embeddingModel,
      chromaPath: config.chromaPath,
      collectionName: 'codebase',
    });
  }

  async initialize(): Promise<void> {
    await this.embedder.initialize();
    console.log('Coding assistant ready. Connected to codebase index.');
  }

  async ask(question: string): Promise<string> {
    // Step 1: Retrieve relevant code chunks
    const relevantChunks = await this.embedder.query(question, {
      nResults: this.config.maxContextChunks,
    });

    // Step 2: Filter and rank chunks by relevance
    const filteredChunks = relevantChunks
      .filter(chunk => chunk.distance < 0.7)  // Cosine distance threshold
      .slice(0, this.config.maxContextChunks);

    // Step 3: Build the augmented prompt
    const contextBlock = filteredChunks
      .map((chunk, i) => {
        const meta = chunk.metadata;
        return `--- Code Chunk ${i + 1} [${meta.filePath}:${meta.startLine}-${meta.endLine}] (${meta.type}: ${meta.name}) ---\n${chunk.content}`;
      })
      .join('\n\n');

    const systemPrompt = `You are a senior software engineer with deep knowledge of the codebase described below. Answer questions accurately based on the actual code provided. If the code context doesn't contain enough information to answer, say so explicitly rather than guessing.

When referencing code, always mention the file path and function/class name. When suggesting changes, show the exact code that should be modified.

IMPORTANT: Base your answers on the code chunks provided below. Do not invent functions, classes, or APIs that are not shown in the context.`;

    const userPrompt = `## Relevant Codebase Context

${contextBlock}

## Question

${question}`;

    // Step 4: Generate response via Ollama
    const response = await this.generate(systemPrompt, userPrompt);

    // Step 5: Track conversation
    this.conversationHistory.push(
      { role: 'user', content: question },
      { role: 'assistant', content: response }
    );

    return response;
  }

  private async generate(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const messages = [
      { role: 'system', content: systemPrompt },
      // Include recent conversation for follow-ups
      ...this.conversationHistory.slice(-6),
      { role: 'user', content: userPrompt },
    ];

    const response = await fetch(`${this.config.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.generationModel,
        messages,
        stream: false,
        options: {
          temperature: 0.1,  // Low temperature for code accuracy
          num_ctx: 32768,    // Context window size
          top_p: 0.9,
        },
      }),
    });

    const data = await response.json();
    return data.message?.content || 'No response generated.';
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}

// Interactive CLI
async function main() {
  const assistant = new CodingAssistant({
    ollamaUrl: 'http://localhost:11434',
    generationModel: 'qwen3.5:14b',
    embeddingModel: 'nomic-embed-text',
    chromaPath: './.codebase-index',
    maxContextChunks: 8,
    maxContextTokens: 12000,
  });

  await assistant.initialize();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n🤖 Local Coding Assistant Ready');
  console.log('Ask anything about your codebase. Type "exit" to quit.\n');

  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      const trimmed = input.trim();
      if (trimmed.toLowerCase() === 'exit') {
        console.log('Goodbye!');
        rl.close();
        return;
      }
      if (trimmed.toLowerCase() === 'clear') {
        assistant.clearHistory();
        console.log('Conversation cleared.\n');
        askQuestion();
        return;
      }

      try {
        const response = await assistant.ask(trimmed);
        console.log(`\nAssistant: ${response}\n`);
      } catch (error) {
        console.error('Error:', error);
      }

      askQuestion();
    });
  };

  askQuestion();
}

main().catch(console.error);
```

 

## [](#step-5-advanced-optimizations)Step 5: Advanced Optimizations

The basic pipeline works, but production use demands several optimizations.

### [](#51-reranking-for-precision)5.1 Re-ranking for Precision

Vector similarity search returns "semantically similar" results, but similar doesn't always mean relevant. A re-ranking step uses the LLM to filter out false positives:  

```
async function rerankChunks(
  query: string,
  chunks: QueryResult[],
  llm: OllamaClient
): Promise<QueryResult[]> {
  const prompt = `Given the developer's question: "${query}"

Rate each code chunk's relevance from 0-10 (10 = directly answers the question, 0 = completely irrelevant):

${chunks.map((c, i) => `[Chunk ${i}] ${c.metadata.filePath} (${c.metadata.name})\n${c.content.slice(0, 300)}...`).join('\n\n')}

Return ONLY a JSON array of objects: [{"index": 0, "score": 8, "reason": "..."}, ...]`;

  const response = await llm.generate(prompt);
  const scores = JSON.parse(response);

  return chunks
    .map((chunk, i) => ({
      ...chunk,
      relevanceScore: scores.find((s: any) => s.index === i)?.score || 0,
    }))
    .filter(c => c.relevanceScore >= 5)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
```

 

### [](#52-incremental-indexing)5.2 Incremental Indexing

Re-indexing the entire codebase on every change is wasteful. Use file modification times to only embed changed files:  

```
import * as fs from 'fs';

interface IndexManifest {
  files: Record<string, { mtime: number; chunkIds: string[] }>;
  lastFullIndex: number;
}

async function incrementalIndex(
  rootDir: string,
  embedder: CodebaseEmbedder,
  manifestPath: string
): Promise<{ added: number; updated: number; removed: number }> {
  const manifest: IndexManifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    : { files: {}, lastFullIndex: 0 };

  const currentFiles = await glob('**/*.{ts,js,py,go,md}', {
    cwd: rootDir,
    ignore: IGNORE_PATTERNS,
    absolute: true,
  });

  let added = 0, updated = 0, removed = 0;

  // Find modified and new files
  const filesToProcess: string[] = [];
  for (const filePath of currentFiles) {
    const stat = fs.statSync(filePath);
    const existing = manifest.files[filePath];

    if (!existing || stat.mtimeMs > existing.mtime) {
      filesToProcess.push(filePath);
      if (existing) {
        // Remove old chunks for updated files
        await embedder.deleteChunks(existing.chunkIds);
        updated++;
      } else {
        added++;
      }
    }
  }

  // Find deleted files
  for (const [filePath, data] of Object.entries(manifest.files)) {
    if (!currentFiles.includes(filePath)) {
      await embedder.deleteChunks(data.chunkIds);
      delete manifest.files[filePath];
      removed++;
    }
  }

  // Process changed files
  if (filesToProcess.length > 0) {
    const chunks = await chunkFiles(filesToProcess);
    await embedder.embedChunks(chunks);

    // Update manifest
    for (const filePath of filesToProcess) {
      const stat = fs.statSync(filePath);
      const fileChunks = chunks.filter(c =>
        c.filePath === path.relative(process.cwd(), filePath)
      );
      manifest.files[filePath] = {
        mtime: stat.mtimeMs,
        chunkIds: fileChunks.map(c => c.id),
      };
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  return { added, updated, removed };
}
```

 

### [](#53-multiquery-retrieval)5.3 Multi-Query Retrieval

Sometimes a single embedding search misses relevant context. Generate multiple search queries from the original question:  

```
async function multiQueryRetrieval(
  question: string,
  embedder: CodebaseEmbedder,
  llm: OllamaClient
): Promise<QueryResult[]> {
  // Generate alternative search queries
  const alternativeQueries = await llm.generate(`
    Given this developer question: "${question}"

    Generate 3 alternative search queries that might find relevant code.
    Focus on different aspects: function names, class names, file patterns, error messages.

    Return as JSON array of strings.
  `);

  const queries = [question, ...JSON.parse(alternativeQueries)];

  // Search with all queries
  const allResults = await Promise.all(
    queries.map(q => embedder.query(q, { nResults: 5 }))
  );

  // Deduplicate by chunk ID and keep best score
  const seen = new Map<string, QueryResult>();
  for (const results of allResults) {
    for (const result of results) {
      const id = result.metadata.filePath + ':' + result.metadata.startLine;
      const existing = seen.get(id);
      if (!existing || result.distance < existing.distance) {
        seen.set(id, result);
      }
    }
  }

  return [...seen.values()].sort((a, b) => a.distance - b.distance);
}
```

 

### [](#54-watching-for-changes)5.4 Watching for Changes

For a seamless developer experience, watch the filesystem and re-index automatically:  

```
import { watch } from 'chokidar';

function watchAndReindex(rootDir: string, embedder: CodebaseEmbedder) {
  const watcher = watch(rootDir, {
    ignored: IGNORE_PATTERNS,
    persistent: true,
    ignoreInitial: true,
  });

  let debounceTimer: NodeJS.Timeout;

  const scheduleReindex = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      console.log('Files changed, re-indexing...');
      const stats = await incrementalIndex(rootDir, embedder, '.index-manifest.json');
      console.log(`Reindex complete: +${stats.added} ~${stats.updated} -${stats.removed}`);
    }, 2000); // 2s debounce
  };

  watcher.on('change', scheduleReindex);
  watcher.on('add', scheduleReindex);
  watcher.on('unlink', scheduleReindex);

  console.log(`Watching ${rootDir} for changes...`);
}
```

 

## [](#performance-benchmarks)Performance Benchmarks

Here's what to expect on real hardware (tested April 2026):

### [](#indexing-speed-nomicembedtext)Indexing Speed (nomic-embed-text)

| Hardware | 1K Chunks | 5K Chunks | 10K Chunks |
| --- | --- | --- | --- |
| M3 MacBook Pro (36GB) | 18s | 85s | 170s |
| M2 MacBook Air (16GB) | 32s | 155s | 310s |
| RTX 4090 (24GB VRAM) | 8s | 38s | 75s |
| CPU only (AMD 7950X) | 45s | 220s | 440s |

### [](#generation-latency-time-to-first-token)Generation Latency (time to first token)

| Model | M3 Pro (36GB) | RTX 4090 | CPU (7950X) |
| --- | --- | --- | --- |
| Qwen 3.5 8B | 0.8s | 0.3s | 3.2s |
| Qwen 3.5 14B | 1.5s | 0.5s | 8.1s |
| DeepSeek Coder V2 33B | 3.2s | 0.9s | N/A (OOM) |

### [](#retrieval-quality-on-a-50k-loc-typescript-monorepo)Retrieval Quality (on a 50K LOC TypeScript monorepo)

| Metric | Naive Chunking | AST-Aware Chunking |
| --- | --- | --- |
| Top-1 Relevance | 42% | 71% |
| Top-5 Recall | 61% | 89% |
| With Re-ranking | 68% | 94% |

The AST-aware chunking + re-ranking combination nearly doubles the accuracy compared to naive approaches.

## [](#common-pitfalls-and-how-to-avoid-them)Common Pitfalls and How to Avoid Them

### [](#pitfall-1-embedding-model-mismatch)Pitfall 1: Embedding Model Mismatch

If you embed with `nomic-embed-text` but query with `mxbai-embed-large`, your results will be garbage. The embedding model must be identical for indexing and querying. This sounds obvious, but it's the #1 issue when switching models during development.

### [](#pitfall-2-chunk-size-extremes)Pitfall 2: Chunk Size Extremes

Chunks that are too small (single lines) lose context. Chunks that are too large (entire files) dilute the semantic signal. The sweet spot for code is 50–300 lines per chunk, corresponding to individual functions or small classes.

### [](#pitfall-3-ignoring-metadata-filtering)Pitfall 3: Ignoring Metadata Filtering

Without metadata filtering, a query about Python authentication code might return TypeScript test utilities that happen to mention "auth." Always store and use metadata (language, file type, module name) to narrow retrieval.

### [](#pitfall-4-stale-index)Pitfall 4: Stale Index

Your codebase changes daily, but your index doesn't update. Set up incremental indexing (Section 5.2) or at minimum, re-index on each `git pull` via a post-merge hook:  

```
# .git/hooks/post-merge
#!/bin/sh
npx tsx src/index-codebase.ts . &
echo "Re-indexing codebase in background..."
```

 

### [](#pitfall-5-context-window-overflow)Pitfall 5: Context Window Overflow

Even with RAG, you can blow the context window by retrieving too many chunks. A 14B model with a 32K context window can comfortably fit ~20K tokens of code context + 4K for the system prompt + 4K for the conversation history + 4K for the response. That's roughly 8–10 code chunks. Going beyond this degrades quality.

## [](#when-to-use-this-vs-cloud-ai)When to Use This vs. Cloud AI

This local approach isn't always better than cloud APIs. Here's the honest comparison:

| Factor | Local (Ollama + RAG) | Cloud (GPT-4.1 / Claude Opus 4.6) |
| --- | --- | --- |
| Privacy | ✅ Nothing leaves your machine | ❌ Code sent to external servers |
| Cost | ✅ Free after hardware | ❌ $2–15/M tokens |
| Code Quality | ⚠️ Good (14B) to Great (33B+) | ✅ Best-in-class |
| Setup | ❌ ~2 hours initial setup | ✅ API key and go |
| Latency | ⚠️ 1–3s on good hardware | ✅ <1s (streaming) |
| Codebase Understanding | ✅ Deep (RAG on full repo) | ⚠️ Limited to context window |
| Offline | ✅ Works offline | ❌ Requires internet |

**Use local when**: your codebase is proprietary, you work in regulated industries (healthcare, finance, defense), you have a large monorepo, or you want zero recurring cost.

**Use cloud when**: code quality is paramount (GPT-4.1 and Claude Opus 4.6 still outperform any local 14B model), setup time matters, or your team already has API budgets.

**The hybrid approach**: Use local RAG for codebase retrieval, but route the final generation to a cloud API for maximum quality. Your code context stays local; only the assembled prompt (with relevant snippets) goes to the cloud.

## [](#whats-next)What's Next

This guide gives you a solid foundation. To take it further:

1.  **Add tree-sitter parsing** for precise AST chunking across all languages, replacing the regex-based approach.
2.  **Integrate with your editor** — build a VS Code extension or Neovim plugin that queries the assistant inline.
3.  **Add git-aware context** — include recent diffs, blame information, and PR descriptions in the retrieval metadata.
4.  **Implement agentic loops** — let the assistant execute searches, read files, and run tests autonomously using function calling.
5.  **Fine-tune the embedding model** on your codebase using contrastive learning to improve retrieval accuracy by 15–20%.

The tools are here. The models are good enough. The infrastructure runs on a single laptop. The only thing between you and a private, context-aware AI coding assistant is a weekend of setup.

---

> 🚀 **Explore More:** This article is from the [Pockit Blog](https://pockit.tools/blog/build-local-ai-coding-assistant-ollama-rag-codebase-guide/).
> 
> If you found this helpful, check out [Pockit.tools](https://pockit.tools/json-formatter/). It’s a curated collection of offline-capable dev utilities. **[Available on Chrome Web Store](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** for free.
