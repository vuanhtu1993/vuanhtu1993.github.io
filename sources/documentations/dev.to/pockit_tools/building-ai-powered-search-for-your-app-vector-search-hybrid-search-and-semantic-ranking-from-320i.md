---
title: "Building AI-Powered Search for Your App: Vector Search, Hybrid Search, and Semantic Ranking from Scratch"
source_url: "https://dev.to/pockit_tools/building-ai-powered-search-for-your-app-vector-search-hybrid-search-and-semantic-ranking-from-320i"
crawled_at: "2026-08-07T09:31:16.911Z"
---

Your users are searching "how to fix the login thing when it's stuck" and your search engine returns zero results because no document contains the phrase "login thing stuck." Meanwhile, there's a perfectly relevant knowledge base article titled "Resolving Authentication Token Expiry Issues" sitting right there — invisible to keyword search.

This is the fundamental failure of traditional search: **it matches words, not meaning.** And in 2026, users expect search that understands intent.

The good news? Building AI-powered search is no longer a PhD project. With modern embedding models, vector databases, and a few clever patterns, you can build a search system that genuinely understands what users mean — not just what they type.

In this guide, we'll build a production-ready AI search system step by step. We'll start with the basics of vector search, evolve to hybrid search (the sweet spot for most applications), add semantic reranking for precision, and cover the production gotchas that tutorials skip. All with TypeScript code you can actually ship.

## [](#the-three-generations-of-search)The Three Generations of Search

Before diving into code, let's understand where we are and why each generation exists.

### [](#generation-1-keyword-search-bm25tfidf)Generation 1: Keyword Search (BM25/TF-IDF)

This is what most apps still use. PostgreSQL's `tsvector`, Elasticsearch's default mode, or even SQL `LIKE` queries.  

```
-- The classic approach
SELECT * FROM articles 
WHERE to_tsvector('english', title || ' ' || body) 
  @@ to_tsquery('english', 'authentication & token & expiry');
```

 

**How it works:** Count how many times query terms appear in documents, weight by rarity (IDF), and rank by relevance score.

**Where it works great:**

-   Exact term matching ("ERROR 0x80070005")
-   Known-item search (searching for a specific document by name)
-   Structured queries with boolean operators
-   Domain-specific jargon that embedding models may not understand

**Where it fails:**

-   Synonym handling ("car" vs "automobile" vs "vehicle")
-   Intent understanding ("how to make my site faster" → should match "web performance optimization")
-   Typo tolerance (though fuzzy matching helps partially)
-   Multi-lingual queries

### [](#generation-2-vector-search-semantic)Generation 2: Vector Search (Semantic)

Vector search converts text into numerical representations (embeddings) that capture _meaning_. Similar concepts end up close together in vector space, regardless of the exact words used.  

```
// "fix login issue" and "resolve authentication problem" 
// end up as nearby vectors
const embedding1 = await embed("fix login issue");
const embedding2 = await embed("resolve authentication problem");

cosineSimilarity(embedding1, embedding2); // ~0.92 (very similar!)
```

 

**How it works:** An embedding model (like OpenAI's `text-embedding-3-small` or open-source `nomic-embed-text`) converts text into a high-dimensional vector (typically 256-1536 dimensions). Search becomes finding the nearest neighbors in vector space.

**Where it excels:**

-   Understanding intent behind vague queries
-   Cross-lingual search (embeddings transcend language barriers)
-   Finding semantically related content even with zero word overlap

**Where it struggles:**

-   Exact keyword matching (ironically!)
-   Rare technical terms the embedding model hasn't seen
-   Recency bias — embeddings don't know what's "new"
-   Filter/facet queries ("articles tagged React published after 2025")

### [](#generation-3-hybrid-search-reranking-the-2026-sweet-spot)Generation 3: Hybrid Search + Reranking (The 2026 Sweet Spot)

The insight: keyword search and vector search fail in _complementary_ ways. Combine them, and you cover each other's blind spots.  

```
User Query
    ↓
┌──────────────────────┐
│  Parallel Retrieval   │
│  ┌─────────────────┐ │
│  │ BM25 (keywords)  │──→ Top 20 keyword results
│  └─────────────────┘ │
│  ┌─────────────────┐ │
│  │ Vector (semantic)│──→ Top 20 semantic results
│  └─────────────────┘ │
└──────────────────────┘
    ↓
Reciprocal Rank Fusion (merge + deduplicate)
    ↓
Top 40 candidates (merged)
    ↓
LLM Reranker (optional, but powerful)
    ↓
Final Top 10 results
```

 

This is what we're building. Let's go.

## [](#step-1-setting-up-vector-search-with-pgvector)Step 1: Setting Up Vector Search with pgvector

You don't need a specialized vector database to start. PostgreSQL with the `pgvector` extension handles millions of vectors with excellent performance and gives you the benefit of keeping everything in one database.

### [](#database-setup)Database Setup

```
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the documents table with embedding column
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),  -- OpenAI text-embedding-3-small dimension
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create HNSW index for fast approximate nearest neighbor search
-- This is the key to performance at scale
CREATE INDEX ON documents 
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Also create a full-text search index for BM25
ALTER TABLE documents ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED;

CREATE INDEX ON documents USING gin(search_vector);
```

 

### [](#generating-embeddings)Generating Embeddings

```
import OpenAI from 'openai';

const openai = new OpenAI();

async function generateEmbedding(text: string): Promise<number[]> {
  // Truncate to model's max token limit
  const truncated = text.slice(0, 8000);

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: truncated,
    dimensions: 1536,
  });

  return response.data[0].embedding;
}

// Batch embedding for efficiency (up to 2048 inputs per call)
async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const batchSize = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch.map(t => t.slice(0, 8000)),
      dimensions: 1536,
    });

    allEmbeddings.push(
      ...response.data.map(d => d.embedding)
    );

    // Respect rate limits
    if (i + batchSize < texts.length) {
      await new Promise(r => setTimeout(r, 100));
    }
  }

  return allEmbeddings;
}
```

 

### [](#basic-vector-search)Basic Vector Search

```
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function vectorSearch(
  query: string, 
  limit: number = 10
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query);

  const result = await pool.query(`
    SELECT 
      id, title, content, metadata,
      1 - (embedding <=> $1::vector) AS similarity
    FROM documents
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> $1::vector
    LIMIT $2
  `, [JSON.stringify(queryEmbedding), limit]);

  return result.rows;
}
```

 

The `<=>` operator computes cosine distance. We subtract from 1 to get cosine similarity (higher = more similar).

### [](#performance-tuning)Performance Tuning

With HNSW indexes, there's a critical parameter: `ef_search`. It controls the trade-off between speed and recall (accuracy).  

```
-- Default: ef_search = 40 (fast, ~95% recall)
SET hnsw.ef_search = 40;

-- Higher accuracy: ef_search = 100 (~99% recall, 2-3x slower)
SET hnsw.ef_search = 100;

-- For production, set per-query based on use case
```

 

**Benchmarks on 1M documents (1536 dimensions):**

| ef\_search | Recall@10 | Latency (p50) | Latency (p99) |
| --- | --- | --- | --- |
| 40 | 95.2% | 5ms | 15ms |
| 100 | 98.8% | 12ms | 30ms |
| 200 | 99.5% | 25ms | 55ms |

For most applications, `ef_search = 100` is the sweet spot.

## [](#step-2-adding-keyword-search-bm25)Step 2: Adding Keyword Search (BM25)

Vector search alone isn't enough. When a user searches for "ERROR-4012" or "RFC 7519", keyword search is objectively better. Let's add BM25-style full-text search.  

```
async function keywordSearch(
  query: string, 
  limit: number = 10
): Promise<SearchResult[]> {
  // Convert user query to tsquery, handling special characters
  const sanitized = query.replace(/[^\w\s]/g, ' ').trim();
  const tsQuery = sanitized.split(/\s+/).join(' & ');

  const result = await pool.query(`
    SELECT 
      id, title, content, metadata,
      ts_rank_cd(search_vector, to_tsquery('english', $1)) AS rank
    FROM documents
    WHERE search_vector @@ to_tsquery('english', $1)
    ORDER BY rank DESC
    LIMIT $2
  `, [tsQuery, limit]);

  return result.rows;
}
```

 

## [](#step-3-hybrid-search-with-reciprocal-rank-fusion)Step 3: Hybrid Search with Reciprocal Rank Fusion

Now the magic: combining keyword and vector results. The standard approach is **Reciprocal Rank Fusion (RRF)**, which merges ranked lists without needing to normalize scores from different systems.

### [](#how-rrf-works)How RRF Works

```
RRF Score = Σ (1 / (k + rank_i))
```

 

Where `k` is a constant (typically 60) and `rank_i` is the document's position in each result list. A document that appears at rank 1 in both lists gets a higher fused score than one at rank 1 in only one list.

### [](#implementation)Implementation

```
interface SearchResult {
  id: number;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  score: number;
}

interface HybridSearchOptions {
  limit?: number;
  keywordWeight?: number;  // 0-1, weight for keyword results
  vectorWeight?: number;   // 0-1, weight for vector results
  rrfK?: number;           // RRF constant, default 60
}

async function hybridSearch(
  query: string, 
  options: HybridSearchOptions = {}
): Promise<SearchResult[]> {
  const {
    limit = 10,
    keywordWeight = 0.3,
    vectorWeight = 0.7,
    rrfK = 60,
  } = options;

  // Run both searches in parallel
  const candidateCount = limit * 4; // Over-fetch for better fusion

  const [keywordResults, vectorResults] = await Promise.all([
    keywordSearch(query, candidateCount),
    vectorSearch(query, candidateCount),
  ]);

  // Build rank maps
  const rrfScores = new Map<number, { 
    score: number; 
    doc: SearchResult;
  }>();

  // Score keyword results
  keywordResults.forEach((doc, index) => {
    const rank = index + 1;
    const rrfScore = keywordWeight * (1 / (rrfK + rank));

    rrfScores.set(doc.id, { 
      score: rrfScore, 
      doc,
    });
  });

  // Score vector results (add to existing or create new)
  vectorResults.forEach((doc, index) => {
    const rank = index + 1;
    const rrfScore = vectorWeight * (1 / (rrfK + rank));

    const existing = rrfScores.get(doc.id);
    if (existing) {
      existing.score += rrfScore; // Document appears in both — boost!
    } else {
      rrfScores.set(doc.id, { 
        score: rrfScore, 
        doc,
      });
    }
  });

  // Sort by fused score and return top results
  return Array.from(rrfScores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ doc, score }) => ({ ...doc, score }));
}
```

 

### [](#when-to-adjust-weights)When to Adjust Weights

The `keywordWeight` and `vectorWeight` parameters are powerful tuning knobs:

| Use Case | Keyword Weight | Vector Weight | Why |
| --- | --- | --- | --- |
| General Q&A | 0.3 | 0.7 | Intent matters more |
| Code search | 0.6 | 0.4 | Exact symbols matter |
| Error lookup | 0.7 | 0.3 | Error codes are exact |
| Conversational | 0.2 | 0.8 | Natural language queries |
| Multi-lingual | 0.1 | 0.9 | Embeddings carry language |

## [](#step-4-semantic-reranking-the-quality-multiplier)Step 4: Semantic Reranking (The Quality Multiplier)

Hybrid search gets you 80% of the way there. Reranking gets you the last 20% — and often that last 20% is the difference between "good search" and "magic search."

### [](#what-reranking-does)What Reranking Does

Retrieval (vector + keyword) is optimized for **recall** — casting a wide net. Reranking is optimized for **precision** — looking at each candidate carefully and scoring how relevant it truly is to the query.

A reranker takes the query and each candidate document as a pair and produces a relevance score. Unlike embeddings (which encode query and document independently), rerankers see both together and can capture fine-grained relevance.

### [](#using-a-crossencoder-reranker)Using a Cross-Encoder Reranker

```
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface RerankedResult extends SearchResult {
  rerankerScore: number;
  relevanceReason: string;
}

async function rerank(
  query: string,
  candidates: SearchResult[],
  topK: number = 10
): Promise<RerankedResult[]> {
  // Format candidates for the reranker prompt
  const candidateList = candidates
    .map((c, i) => `[${i}] Title: ${c.title}\nContent: ${c.content.slice(0, 500)}`)
    .join('\n\n');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are a search relevance judge. Given a query and candidate documents, score each document's relevance from 0.0 to 1.0.

Query: "${query}"

Candidates:
${candidateList}

Return JSON array: [{"index": 0, "score": 0.95, "reason": "directly answers the query"}, ...]
Score criteria:
- 1.0: Directly and completely answers the query
- 0.7-0.9: Highly relevant, addresses the core intent
- 0.4-0.6: Partially relevant, related topic
- 0.1-0.3: Tangentially related
- 0.0: Not relevant at all

Return ONLY the JSON array, no other text.`,
    }],
  });

  const scores = JSON.parse(
    (response.content[0] as { text: string }).text
  ) as { index: number; score: number; reason: string }[];

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => ({
      ...candidates[s.index],
      rerankerScore: s.score,
      relevanceReason: s.reason,
    }));
}
```

 

### [](#dedicated-reranker-models-cheaper-alternative)Dedicated Reranker Models (Cheaper Alternative)

LLM reranking is powerful but expensive. For high-volume search, use a dedicated reranker model:  

```
// Using Cohere Rerank (or similar dedicated reranker)
import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

async function cohereRerank(
  query: string,
  candidates: SearchResult[],
  topK: number = 10
): Promise<RerankedResult[]> {
  const response = await cohere.v2.rerank({
    model: 'rerank-v3.5',  // or 'rerank-v4.0-pro' for latest
    query,
    documents: candidates.map(c => ({
      text: `${c.title}\n${c.content.slice(0, 1000)}`,
    })),
    topN: topK,
  });

  return response.results.map(r => ({
    ...candidates[r.index],
    rerankerScore: r.relevanceScore,
    relevanceReason: '',
  }));
}
```

 

**Cost comparison for 1,000 reranking queries/day (20 candidates each):**

| Reranker | Latency | Cost/month |
| --- | --- | --- |
| Claude Sonnet (LLM) | ~800ms | ~$90 |
| Cohere Rerank v4.0 | ~180ms | ~$6 |
| Cohere Rerank v3.5 | ~200ms | ~$5 |
| Jina Reranker v2 | ~150ms | ~$4 |
| Self-hosted (cross-encoder) | ~100ms | Server cost only |

For most applications, a dedicated reranker model is the best choice. Reserve LLM reranking for cases where you need the reasoning capability (e.g., explaining _why_ results are relevant).

## [](#step-5-putting-it-all-together)Step 5: Putting It All Together

Here's the complete search pipeline as a single, production-ready function:  

```
interface SearchConfig {
  limit: number;
  keywordWeight: number;
  vectorWeight: number;
  useReranker: boolean;
  rerankerType: 'llm' | 'cohere' | 'none';
  candidateMultiplier: number;
}

const DEFAULT_CONFIG: SearchConfig = {
  limit: 10,
  keywordWeight: 0.3,
  vectorWeight: 0.7,
  useReranker: true,
  rerankerType: 'cohere',
  candidateMultiplier: 4,
};

async function search(
  query: string, 
  config: Partial<SearchConfig> = {}
): Promise<SearchResult[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const candidateCount = cfg.limit * cfg.candidateMultiplier;

  // Stage 1: Parallel retrieval
  const [keywordResults, vectorResults] = await Promise.all([
    keywordSearch(query, candidateCount),
    vectorSearch(query, candidateCount),
  ]);

  // Stage 2: Reciprocal Rank Fusion
  const fused = reciprocalRankFusion(
    keywordResults, 
    vectorResults, 
    cfg
  );

  // Stage 3: Reranking (optional)
  if (cfg.useReranker && fused.length > 0) {
    const rerankerInput = fused.slice(0, cfg.limit * 2);

    if (cfg.rerankerType === 'llm') {
      return rerank(query, rerankerInput, cfg.limit);
    } else if (cfg.rerankerType === 'cohere') {
      return cohereRerank(query, rerankerInput, cfg.limit);
    }
  }

  return fused.slice(0, cfg.limit);
}
```

 

## [](#production-considerations)Production Considerations

Building the pipeline is the easy part. Making it reliable, fast, and cost-effective at scale is where the real engineering happens.

### [](#1-embedding-freshness)1\. Embedding Freshness

When documents change, their embeddings go stale. You need a strategy:  

```
// Option 1: Sync on write (simple, adds write latency)
async function updateDocument(id: number, content: string) {
  const embedding = await generateEmbedding(content);

  await pool.query(`
    UPDATE documents 
    SET content = $1, embedding = $2::vector, updated_at = NOW()
    WHERE id = $3
  `, [content, JSON.stringify(embedding), id]);
}

// Option 2: Async embedding queue (recommended for production)
import { Queue } from 'bullmq';

const embeddingQueue = new Queue('embeddings', {
  connection: { host: 'localhost', port: 6379 },
});

async function updateDocumentAsync(id: number, content: string) {
  // Update content immediately
  await pool.query(
    'UPDATE documents SET content = $1, updated_at = NOW() WHERE id = $2',
    [content, id]
  );

  // Queue embedding generation
  await embeddingQueue.add('generate', { 
    documentId: id, 
    content,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
}
```

 

### [](#2-query-understanding)2\. Query Understanding

Raw user queries often need preprocessing before hitting the search pipeline:  

```
async function preprocessQuery(rawQuery: string): Promise<{
  processedQuery: string;
  searchConfig: Partial<SearchConfig>;
}> {
  // 1. Detect if the query is an exact code/error lookup
  const isExactMatch = /^[A-Z]+-\d+$|^ERROR|^0x|^HTTP \d{3}/.test(rawQuery);
  if (isExactMatch) {
    return {
      processedQuery: rawQuery,
      searchConfig: { keywordWeight: 0.9, vectorWeight: 0.1, useReranker: false },
    };
  }

  // 2. Expand abbreviated queries (optional LLM step)
  // "k8s OOM pod restart" → "Kubernetes out of memory pod restart troubleshooting"

  // 3. Detect language for multi-lingual support
  // Embeddings handle cross-lingual naturally, but BM25 needs language-specific config

  return {
    processedQuery: rawQuery,
    searchConfig: {},
  };
}
```

 

### [](#3-caching-strategy)3\. Caching Strategy

Embedding generation is the most expensive operation. Cache aggressively:  

```
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCachedEmbedding(text: string): Promise<number[] | null> {
  const key = `emb:${simpleHash(text)}`;
  const cached = await redis.get(key);

  if (cached) return JSON.parse(cached);
  return null;
}

async function cacheEmbedding(text: string, embedding: number[]): Promise<void> {
  const key = `emb:${simpleHash(text)}`;
  await redis.set(key, JSON.stringify(embedding), 'EX', 86400); // 24h TTL
}

// Wrapper with caching
async function getEmbedding(text: string): Promise<number[]> {
  const cached = await getCachedEmbedding(text);
  if (cached) return cached;

  const embedding = await generateEmbedding(text);
  await cacheEmbedding(text, embedding);
  return embedding;
}
```

 

### [](#4-monitoring-and-quality-measurement)4\. Monitoring and Quality Measurement

You can't improve what you don't measure. Track these metrics:  

```
interface SearchMetrics {
  // Performance
  totalLatencyMs: number;
  embeddingLatencyMs: number;
  retrievalLatencyMs: number;
  rerankLatencyMs: number;

  // Quality (requires user feedback or implicit signals)
  clickThroughRate: number;      // % of searches with a click
  meanReciprocalRank: number;    // average 1/rank of first clicked result
  noResultsRate: number;         // % of searches with 0 results

  // Cost
  embeddingTokensUsed: number;
  rerankerCallsMade: number;
}
```

 

### [](#5-scaling-beyond-postgresql)5\. Scaling Beyond PostgreSQL

pgvector works surprisingly well up to ~5M vectors. Beyond that, consider:

| Scale | Recommendation | Why |
| --- | --- | --- |
| < 100K vectors | pgvector | Keep it simple, same DB |
| 100K - 5M | pgvector + HNSW tuning | Still works, tune m and ef |
| 5M - 50M | Dedicated vector DB | Pinecone, Weaviate, Qdrant |
| 50M+ | Distributed vector DB | Milvus, Vespa, custom |

The migration path from pgvector to a dedicated vector DB is straightforward — the embedding generation and search API stay the same; you just swap the storage/query layer.

## [](#choosing-an-embedding-model)Choosing an Embedding Model

The embedding model is the most important decision in your search system. Here's the current landscape:

| Model | Dimensions | Max Tokens | Quality (MTEB) | Cost/1M tokens | Best For |
| --- | --- | --- | --- | --- | --- |
| OpenAI text-embedding-3-small | 1536 | 8191 | 62.3 | $0.02 | Cost-effective default |
| OpenAI text-embedding-3-large | 3072 | 8191 | 64.6 | $0.13 | Highest quality (API) |
| Cohere embed-v4.0 | 256–1536 | 128,000 | 66.2 | $0.10 | Multi-lingual, multimodal |
| Voyage AI voyage-3 | 256–2048 | 32,000 | 67.1 | $0.06 | Long documents |
| nomic-embed-text (open) | 64–768 | 8192 | 62.4 | Free (self-host) | Privacy, no API costs |
| BGE-M3 (open) | 1024 | 8192 | 63.0 | Free (self-host) | Multi-lingual, self-hosted |

**Recommendations:**

-   **Starting out:** OpenAI `text-embedding-3-small` — cheap, good enough, easy API
-   **Multi-lingual:** Cohere `embed-v4.0` or BGE-M3
-   **Privacy-sensitive:** nomic-embed-text (run locally)
-   **Maximum quality:** Voyage AI `voyage-3`

> **Important:** Once you choose an embedding model, switching later requires re-embedding your entire corpus. Choose carefully, and consider starting with a model that handles your future scale.

## [](#common-pitfalls-and-how-to-avoid-them)Common Pitfalls (and How to Avoid Them)

### [](#pitfall-1-chunking-too-aggressively)Pitfall 1: Chunking Too Aggressively

If you split documents into tiny chunks, you lose context. The embedding of "It handles this by caching the response" means nothing without knowing what "it" and "this" refer to.  

```
// ❌ Bad: Fixed 200-token chunks lose context
const chunks = splitByTokenCount(document, 200);

// ✅ Better: Semantic chunking with overlap
function semanticChunk(text: string): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if (current.length + para.length > 1500) {
      if (current) chunks.push(current);
      current = para;
    } else {
      current += '\n\n' + para;
    }
  }
  if (current) chunks.push(current);

  // Add overlap: prepend last sentence of previous chunk
  return chunks.map((chunk, i) => {
    if (i === 0) return chunk;
    const prevLastSentence = chunks[i - 1].split(/\. /).pop();
    return `${prevLastSentence}. ${chunk}`;
  });
}
```

 

### [](#pitfall-2-ignoring-metadata-filtering)Pitfall 2: Ignoring Metadata Filtering

Vector search should **not** be your only filter. Pre-filter by metadata before vector search for both performance and relevance:  

```
-- ❌ Bad: Search all documents, then filter
SELECT * FROM documents
ORDER BY embedding <=> $1::vector
LIMIT 10;
-- Then filter in application code

-- ✅ Good: Filter first, then search within subset
SELECT * FROM documents
WHERE metadata->>'category' = 'engineering'
  AND created_at > NOW() - INTERVAL '90 days'
ORDER BY embedding <=> $1::vector
LIMIT 10;
```

 

### [](#pitfall-3-not-testing-with-real-queries)Pitfall 3: Not Testing with Real Queries

Build a test set from actual user queries (from search logs, support tickets, or feedback). Automated metrics like NDCG and MRR are useful, but nothing replaces eyeballing the results for your top 50 queries.  

```
// Build a golden test set
const testCases = [
  {
    query: "how to fix the login thing when stuck",
    expectedTopResult: "Resolving Authentication Token Expiry Issues",
    expectedInTop5: ["Auth Troubleshooting Guide", "Session Management"],
  },
  // ... 50 more real queries from your search logs
];

async function evaluateSearch() {
  let hits = 0;
  for (const tc of testCases) {
    const results = await search(tc.query, { limit: 5 });
    if (results.some(r => r.title === tc.expectedTopResult)) {
      hits++;
    }
  }
  console.log(`Recall@5: ${(hits / testCases.length * 100).toFixed(1)}%`);
}
```

 

### [](#pitfall-4-not-considering-cold-start)Pitfall 4: Not Considering Cold Start

When you launch, you have zero search logs. You don't know what users will search for. Start with a generous keyword weight (0.5/0.5 hybrid) and gradually shift toward vector as you collect query data to tune on.

## [](#conclusion-the-search-stack-decision-tree)Conclusion: The Search Stack Decision Tree

Building AI search isn't about choosing _one_ technique — it's about layering them correctly:

1.  **Start with hybrid search** (BM25 + vector). This alone beats either individual approach by 15-25% on most benchmarks.
    
2.  **Add reranking** when you need precision. A Cohere Rerank call adds ~200ms and costs pennies, but dramatically improves the top-3 result quality.
    
3.  **Use pgvector** unless you have a specific reason not to. Keeping vectors in your existing PostgreSQL database simplifies everything — ops, transactions, backups, joins.
    
4.  **Measure relentlessly.** Track click-through rates, no-results rates, and build a golden test set from real queries. Without measurement, you're tuning blind.
    
5.  **Don't over-engineer embeddings on day one.** Start with `text-embedding-3-small`, ship it, collect real user queries, and then decide if you need a more powerful (and expensive) model.
    

The gap between "keyword search" and "AI search" isn't a PhD thesis anymore. With the patterns in this guide, a single developer can build a search system in a weekend that would have taken a dedicated search team a quarter to build five years ago. The tools are mature. The patterns are proven. The only thing left is to build it.

---

> 🔒 **Privacy First:** This article was originally published on the [Pockit Blog](https://pockit.tools/blog/ai-powered-search-vector-hybrid-semantic-ranking-complete-guide/).
> 
> Stop sending your data to random servers. Use [Pockit.tools](https://pockit.tools/json-formatter/) for secure utilities, or **[install the Chrome Extension](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** to keep your files 100% private and offline.
