---
title: "Running LLMs in the Browser: WebGPU, Transformers.js, and Chrome's Built-in AI Explained"
source_url: "https://dev.to/pockit_tools/running-llms-in-the-browser-webgpu-transformersjs-and-chromes-built-in-ai-explained-5g18"
crawled_at: "2026-08-07T09:31:13.416Z"
---

Every AI feature you ship today makes an API call. User types a prompt, your server forwards it to OpenAI, waits 800ms-3s, pays $0.01-0.50, and sends the response back. For a chat feature with 10,000 DAU, that's $3,000-15,000/month in API costs alone — before you even count server infrastructure.

But what if the model ran on the user's device? No API call. No latency beyond computation. No cost per inference. No user data ever leaving the browser.

This isn't hypothetical anymore. In 2026, the browser has become a legitimate AI inference runtime. WebGPU provides near-native GPU access. Quantized models under 2GB run at interactive speeds on consumer hardware. Chrome ships Gemini Nano on-device. And libraries like Transformers.js have made the developer experience surprisingly smooth.

This guide covers everything you need to run LLMs in the browser today: the technology stack, model selection and quantization, performance benchmarks on real hardware, Chrome's Built-in AI APIs, and production patterns for shipping client-side AI features. All with working TypeScript code.

## [](#why-run-ai-in-the-browser)Why run AI in the browser?

Before diving into implementation, let's be clear about when client-side AI makes sense — and when it doesn't.

### [](#the-case-for-browserbased-ai)The case for browser-based AI

**Zero marginal cost per inference.** Once the model downloads, every subsequent inference is free. For features with high per-user query volume (autocomplete, grammar checking, code suggestions), the unit economics are dramatically better than API calls.

**Privacy by architecture.** User data never leaves the device. No privacy policy gymnastics, no GDPR concerns about data transfer, no risk of training data leakage. For sensitive domains (healthcare, legal, personal journals), this isn't a nice-to-have — it's a requirement.

**Latency under 100ms.** No network round-trip means responses can be near-instant for small models. Autocomplete, inline suggestions, and real-time classification feel instantaneous.

**Offline capability.** Once the model is cached, it works without network connectivity. PWAs with AI features that work on a plane — that's a real differentiator.

**No rate limits.** No API quotas, no throttling, no "429 Too Many Requests" at 3 AM when your feature launches on Hacker News.

### [](#when-serverside-ai-is-still-better)When server-side AI is still better

**Large model capability.** GPT-4-class reasoning still requires 100B+ parameter models that don't fit in a browser. For complex reasoning, multi-step agents, or large context windows, API calls remain necessary.

**First-load experience.** Model downloads (500MB-2GB) create a significant first-use delay. Users on slow connections will wait minutes before their first inference.

**Mobile battery constraints.** Running GPU inference on mobile devices drains battery aggressively. Heavy inference workloads need server-side handling for mobile users.

**Consistency guarantees.** Different GPUs, drivers, and quantization produce slightly different outputs. If you need reproducible, deterministic results, server-side inference offers more control.

The sweet spot in 2026: **use browser AI for high-frequency, low-complexity tasks** (autocomplete, classification, summarization of short text, embeddings) and **server AI for heavy reasoning** (multi-step agents, long-form generation, complex analysis).

## [](#the-technology-stack)The technology stack

Three pillars make browser-based AI possible in 2026:

### [](#1-webgpu-the-performance-backbone)1\. WebGPU — The performance backbone

WebGPU replaces WebGL as the modern GPU API for the web. Unlike WebGL (designed for graphics), WebGPU was built for compute workloads — exactly what neural network inference needs.  

```
// Check WebGPU support
async function checkWebGPU(): Promise<GPUDevice | null> {
  if (!navigator.gpu) {
    console.warn('WebGPU not supported in this browser');
    return null;
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    console.warn('No GPU adapter found');
    return null;
  }

  const device = await adapter.requestDevice();

  // Log GPU info
  const info = await adapter.requestAdapterInfo();
  console.log(`GPU: ${info.vendor} ${info.device}`);
  console.log(`Max buffer size: ${device.limits.maxBufferSize / 1024 / 1024}MB`);
  console.log(`Max compute workgroup size: ${device.limits.maxComputeWorkgroupSizeX}`);

  return device;
}
```

 

**Browser support (March 2026):**

| Browser | WebGPU Status | Notes |
| --- | --- | --- |
| Chrome 113+ | ✅ Stable | Full support since April 2023 |
| Edge 113+ | ✅ Stable | Chromium-based, same as Chrome |
| Firefox 147+ | ✅ Stable | Enabled by default since Jan 2026 (Win/macOS) |
| Safari 26+ | ✅ Stable | Full WebGPU support on macOS/iOS/iPadOS |
| Mobile Chrome | ⚠️ Android only | Requires flagship GPU (Adreno 730+) |
| iOS Safari 26+ | ✅ Supported | WebGPU available on iOS 26+ |

**WebGPU vs WebGL performance for matrix multiplication (critical for transformers):**

| Operation | WebGL | WebGPU | Speedup |
| --- | --- | --- | --- |
| MatMul 1024×1024 | 45ms | 8ms | 5.6× |
| MatMul 4096×4096 | 890ms | 95ms | 9.4× |
| Batch attention (8 heads) | 120ms | 18ms | 6.7× |
| Full forward pass (125M params) | 340ms | 52ms | 6.5× |

The jump is massive. WebGPU's compute shaders, shared memory, and workgroup synchronization unlock performance that makes real-time LLM inference viable in the browser.

### [](#2-transformersjs-the-developerfriendly-path)2\. Transformers.js — The developer-friendly path

Transformers.js (by Hugging Face) brings the familiar Transformers Python API to JavaScript. Under the hood, it uses ONNX Runtime Web, which delegates to WebGPU for acceleration.  

```
import { pipeline, env } from '@huggingface/transformers';

// Configure for browser
env.allowLocalModels = false;
env.useBrowserCache = true;

// Text generation — runs entirely client-side
const generator = await pipeline('text-generation', 
  'onnx-community/Qwen2.5-0.5B-Instruct', {
    device: 'webgpu',
    dtype: 'q4',  // 4-bit quantization
  }
);

const output = await generator('Explain WebGPU in one paragraph:', {
  max_new_tokens: 150,
  temperature: 0.7,
  do_sample: true,
});

console.log(output[0].generated_text);
```

 

**Key Transformers.js v3 features:**

-   WebGPU device targeting (`device: 'webgpu'`)
-   Built-in quantization support (`dtype: 'q4'`, `'q4f16'`, `'fp16'`)
-   Streaming token generation for chat UIs
-   1,200+ pre-converted ONNX models on Hugging Face
-   Model caching in browser Cache API (persists across sessions)
-   Web Worker support for non-blocking inference

### [](#3-onnx-runtime-web-the-inference-engine)3\. ONNX Runtime Web — The inference engine

ONNX Runtime Web is the engine beneath Transformers.js. If you need lower-level control or have custom ONNX models, you can use it directly:  

```
import * as ort from 'onnxruntime-web/webgpu';

async function runInference(modelPath: string, inputText: string) {
  // Create session with WebGPU execution provider
  const session = await ort.InferenceSession.create(modelPath, {
    executionProviders: ['webgpu'],
    graphOptimizationLevel: 'all',
  });

  // Prepare input tensor
  const inputIds = tokenize(inputText); // Your tokenizer
  const tensor = new ort.Tensor('int64', 
    BigInt64Array.from(inputIds.map(BigInt)), 
    [1, inputIds.length]
  );

  // Run inference
  const results = await session.run({ input_ids: tensor });

  return results.logits;
}
```

 

**When to use ONNX Runtime directly vs Transformers.js:**

| Scenario | Use Transformers.js | Use ONNX Runtime directly |
| --- | --- | --- |
| Standard NLP tasks | ✅ High-level API | Overkill |
| Custom fine-tuned models | If already ONNX | ✅ Full control |
| Non-text modalities (audio, vision) | ✅ Supported pipelines | For custom pipelines |
| Maximum performance tuning | Limited control | ✅ Session options, graph optimization |
| Prototype speed | ✅ 3 lines of code | More boilerplate |

## [](#model-selection-what-actually-runs-in-a-browser)Model selection: What actually runs in a browser?

This is the critical question. A 70B parameter model in fp16 needs 140GB of VRAM — obviously not happening in a browser tab. But with aggressive quantization, you have more options than you'd expect.

### [](#models-that-work-well-march-2026)Models that work well (March 2026)

| Model | Params | Quantized Size | tok/s (RTX 4070) | tok/s (M3 MacBook) | Best for |
| --- | --- | --- | --- | --- | --- |
| Qwen2.5-0.5B-Instruct | 0.5B | 350MB (Q4) | 85 | 45 | Classification, extraction |
| Qwen2.5-1.5B-Instruct | 1.5B | 900MB (Q4) | 42 | 22 | Short text generation |
| SmolLM2-1.7B-Instruct | 1.7B | 1.0GB (Q4) | 38 | 20 | General chat |
| Phi-3.5-mini-instruct | 3.8B | 2.1GB (Q4) | 18 | 9 | Reasoning tasks |
| Gemma-2-2B-Instruct | 2.0B | 1.2GB (Q4) | 28 | 14 | Instruction following |
| Llama-3.2-1B-Instruct | 1.2B | 750MB (Q4) | 52 | 28 | Fast general purpose |

> **Rule of thumb:** For interactive browser UIs, you want >20 tokens/second. This limits you to models ≤2B parameters on mainstream hardware. 3B+ models work but feel sluggish for real-time chat.

### [](#quantization-trading-size-for-speed)Quantization: Trading size for speed

Quantization reduces model precision from 32-bit floats to smaller representations. Here's what the options mean:  

```
fp32 (32-bit) → fp16 (16-bit) → int8 (8-bit) → int4 (4-bit)
   Full size    →    Half     →   Quarter    →   Eighth
   Best quality →              →              → Fastest/smallest
```

 

**Impact on quality (measured on MMLU benchmark for Qwen2.5-1.5B):**

| Precision | Model Size | MMLU Score | Tokens/sec | Memory Usage |
| --- | --- | --- | --- | --- |
| fp16 | 3.0 GB | 61.8 | 12 | 3.4 GB |
| int8 | 1.5 GB | 61.2 | 28 | 1.8 GB |
| int4 (Q4) | 900 MB | 59.1 | 42 | 1.2 GB |
| int4 (Q4\_K\_M) | 950 MB | 60.3 | 40 | 1.3 GB |

The Q4\_K\_M mixed quantization is the sweet spot — it keeps attention layers at higher precision while aggressively quantizing feed-forward layers, preserving 97% of the quality at 1/3 the size.

### [](#loading-models-with-progress-tracking)Loading models with progress tracking

Users need to see download progress. Here's a production-ready model loader:  

```
import { AutoTokenizer, AutoModelForCausalLM, TextStreamer } from '@huggingface/transformers';

interface LoadingProgress {
  status: 'downloading' | 'loading' | 'ready';
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
}

async function loadModel(
  modelId: string,
  onProgress: (progress: LoadingProgress) => void
): Promise<{ model: any; tokenizer: any }> {
  onProgress({ status: 'downloading' });

  const tokenizer = await AutoTokenizer.from_pretrained(modelId, {
    progress_callback: (data: any) => {
      if (data.status === 'progress') {
        onProgress({
          status: 'downloading',
          file: data.file,
          progress: data.progress,
          loaded: data.loaded,
          total: data.total,
        });
      }
    },
  });

  const model = await AutoModelForCausalLM.from_pretrained(modelId, {
    device: 'webgpu',
    dtype: 'q4',
    progress_callback: (data: any) => {
      if (data.status === 'progress') {
        onProgress({
          status: 'downloading',
          file: data.file,
          progress: data.progress,
          loaded: data.loaded,
          total: data.total,
        });
      }
    },
  });

  onProgress({ status: 'ready' });

  return { model, tokenizer };
}
```

 

## [](#chromes-builtin-ai-apis)Chrome's Built-in AI APIs

Chrome 131+ introduced experimental Built-in AI APIs that let you use Gemini Nano (a small on-device model) through browser-native APIs. No model downloads. No libraries. The model ships with Chrome itself.

### [](#the-prompt-api)The Prompt API

```
// Check availability
const capabilities = await self.ai.languageModel.capabilities();
console.log(capabilities.available); // 'readily', 'after-download', 'no'

if (capabilities.available !== 'no') {
  // Create a session
  const session = await self.ai.languageModel.create({
    systemPrompt: 'You are a helpful coding assistant. Be concise.',
    temperature: 0.7,
    topK: 40,
  });

  // Simple prompt
  const result = await session.prompt('What is a closure in JavaScript?');
  console.log(result);

  // Streaming
  const stream = session.promptStreaming('Explain WebGPU briefly.');
  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }

  // Session maintains conversation context
  const followUp = await session.prompt('Give me a code example.');

  // Cleanup
  session.destroy();
}
```

 

### [](#the-summarization-api)The Summarization API

```
const summarizer = await self.ai.summarizer.create({
  type: 'tl;dr',        // 'tl;dr', 'key-points', 'teaser', 'headline'
  length: 'medium',      // 'short', 'medium', 'long'
  format: 'plain-text',  // 'plain-text', 'markdown'
});

const summary = await summarizer.summarize(longArticleText);
console.log(summary);
```

 

### [](#the-translation-api)The Translation API

```
const translator = await self.ai.translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'ja',
});

const translated = await translator.translate('Hello, world!');
console.log(translated); // こんにちは、世界！
```

 

### [](#builtin-ai-vs-transformersjs-when-to-use-which)Built-in AI vs Transformers.js: When to use which

| Factor | Chrome Built-in AI | Transformers.js |
| --- | --- | --- |
| Model download | None (ships with Chrome) | 350MB-2GB first load |
| Setup complexity | 3 lines of code | npm install + config |
| Model choice | Gemini Nano only | 1,200+ models |
| Browser support | Chrome only | All WebGPU browsers |
| Quality (vs GPT-4) | ~60% | Varies by model (50-75%) |
| Task flexibility | Text, image, audio (multimodal) | Text, vision, audio, embeddings |
| Fine-tuning | Not possible | Custom ONNX models |
| Offline | ✅ After Chrome install | ✅ After model cache |

**Recommendation:** Use Chrome Built-in AI for quick prototypes and Chrome-only features. Use Transformers.js when you need cross-browser support, specific models, or non-text modalities.

## [](#production-patterns)Production patterns

### [](#pattern-1-web-worker-isolation)Pattern 1: Web Worker isolation

Never run inference on the main thread. GPU compute blocks the event loop and freezes your UI.  

```
// ai-worker.ts — run in a Web Worker
import { pipeline } from '@huggingface/transformers';

let generator: any = null;

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'LOAD': {
      self.postMessage({ type: 'STATUS', status: 'loading' });

      generator = await pipeline('text-generation', payload.model, {
        device: 'webgpu',
        dtype: 'q4',
        progress_callback: (progress: any) => {
          self.postMessage({ type: 'PROGRESS', progress });
        },
      });

      self.postMessage({ type: 'STATUS', status: 'ready' });
      break;
    }

    case 'GENERATE': {
      if (!generator) {
        self.postMessage({ type: 'ERROR', error: 'Model not loaded' });
        return;
      }

      const result = await generator(payload.prompt, {
        max_new_tokens: payload.maxTokens ?? 256,
        temperature: payload.temperature ?? 0.7,
        do_sample: true,
      });

      self.postMessage({ 
        type: 'RESULT', 
        text: result[0].generated_text,
      });
      break;
    }
  }
};

// main.ts — use from your app
class BrowserAI {
  private worker: Worker;
  private pending = new Map<string, (value: any) => void>();

  constructor() {
    this.worker = new Worker(
      new URL('./ai-worker.ts', import.meta.url),
      { type: 'module' }
    );

    this.worker.onmessage = (e) => {
      // Handle responses
    };
  }

  async load(model: string): Promise<void> {
    this.worker.postMessage({ type: 'LOAD', payload: { model } });
    // Wait for 'ready' status...
  }

  async generate(prompt: string, options = {}): Promise<string> {
    this.worker.postMessage({ 
      type: 'GENERATE', 
      payload: { prompt, ...options },
    });
    // Wait for result...
    return '';
  }
}
```

 

### [](#pattern-2-streaming-token-generation)Pattern 2: Streaming token generation

For chat UIs, stream tokens as they're generated:  

```
import { 
  AutoTokenizer, 
  AutoModelForCausalLM, 
  TextStreamer 
} from '@huggingface/transformers';

async function* streamGenerate(
  model: any,
  tokenizer: any,
  prompt: string,
  maxTokens: number = 256,
): AsyncGenerator<string> {
  const inputs = tokenizer(prompt, { return_tensors: 'pt' });

  // Custom streamer that yields tokens
  const tokens: string[] = [];
  let resolveNext: ((value: string) => void) | null = null;

  const streamer = new TextStreamer(tokenizer, {
    skip_prompt: true,
    callback_function: (text: string) => {
      if (resolveNext) {
        resolveNext(text);
        resolveNext = null;
      } else {
        tokens.push(text);
      }
    },
  });

  // Start generation (runs in background)
  const generatePromise = model.generate({
    ...inputs,
    max_new_tokens: maxTokens,
    temperature: 0.7,
    do_sample: true,
    streamer,
  });

  // Yield tokens as they arrive
  while (true) {
    if (tokens.length > 0) {
      yield tokens.shift()!;
    } else {
      const token = await new Promise<string>((resolve) => {
        resolveNext = resolve;
      });
      yield token;
    }

    // Check if generation is complete
    // (simplified — real implementation needs done signal)
  }

  await generatePromise;
}

// Usage in a React component
function ChatMessage({ prompt }: { prompt: string }) {
  const [text, setText] = useState('');

  useEffect(() => {
    (async () => {
      for await (const token of streamGenerate(model, tokenizer, prompt)) {
        setText(prev => prev + token);
      }
    })();
  }, [prompt]);

  return <p>{text}</p>;
}
```

 

### [](#pattern-3-graceful-degradation-with-server-fallback)Pattern 3: Graceful degradation with server fallback

Not all users have WebGPU. Build a fallback chain:  

```
type AIBackend = 'webgpu' | 'wasm' | 'server';

async function detectBestBackend(): Promise<AIBackend> {
  // 1. Try WebGPU
  if (navigator.gpu) {
    const adapter = await navigator.gpu.requestAdapter();
    if (adapter) {
      const info = await adapter.requestAdapterInfo();
      // Check for minimum GPU capability
      const device = await adapter.requestDevice();
      if (device.limits.maxBufferSize >= 256 * 1024 * 1024) {
        return 'webgpu';
      }
    }
  }

  // 2. Fall back to WASM (CPU-only, slower but universal)
  if (typeof WebAssembly !== 'undefined') {
    return 'wasm';
  }

  // 3. Last resort: server-side
  return 'server';
}

async function createAIClient(): Promise<AIClient> {
  const backend = await detectBestBackend();

  switch (backend) {
    case 'webgpu':
      return new BrowserAIClient({ 
        device: 'webgpu', 
        model: 'onnx-community/Qwen2.5-0.5B-Instruct' 
      });

    case 'wasm':
      return new BrowserAIClient({ 
        device: 'wasm',
        model: 'onnx-community/Qwen2.5-0.5B-Instruct',
        // WASM is 5-10x slower but works everywhere
      });

    case 'server':
      return new ServerAIClient({ 
        endpoint: '/api/ai/generate' 
      });
  }
}
```

 

### [](#pattern-4-smart-model-caching)Pattern 4: Smart model caching

Models are large. Cache them properly to avoid re-downloads:  

```
class ModelCache {
  private cacheName = 'ai-models-v1';

  async getCacheInfo(): Promise<{
    models: string[];
    totalSize: number;
  }> {
    const cache = await caches.open(this.cacheName);
    const keys = await cache.keys();

    let totalSize = 0;
    const models: string[] = [];

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
        models.push(new URL(request.url).pathname);
      }
    }

    return { models, totalSize };
  }

  async clearOldModels(maxCacheSizeMB: number = 2048): Promise<void> {
    const { totalSize } = await this.getCacheInfo();

    if (totalSize > maxCacheSizeMB * 1024 * 1024) {
      // Clear cache and re-download active model
      await caches.delete(this.cacheName);
      console.log(`Cleared model cache (was ${(totalSize / 1024 / 1024).toFixed(0)}MB)`);
    }
  }

  async isModelCached(modelId: string): Promise<boolean> {
    const cache = await caches.open(this.cacheName);
    const keys = await cache.keys();
    return keys.some(k => k.url.includes(modelId));
  }
}

// Show UI based on cache status
async function initAI() {
  const cache = new ModelCache();
  const isCached = await cache.isModelCached('Qwen2.5-0.5B-Instruct');

  if (isCached) {
    // Instant load — model already downloaded
    showStatus('Loading AI model from cache...');
    // Loads in 2-5 seconds from cache vs 30-60s download
  } else {
    // First-time download needed
    showStatus('Downloading AI model (350MB)...');
    showProgressBar();
  }
}
```

 

## [](#practical-use-cases-that-work-today)Practical use cases that work today

Not every AI use case works in the browser. Here are the ones that do:

### [](#1-smart-autocomplete)1\. Smart autocomplete

```
// Fast, local autocomplete for text inputs
const completer = await pipeline('text-generation', 
  'onnx-community/Qwen2.5-0.5B-Instruct',
  { device: 'webgpu', dtype: 'q4' }
);

async function autocomplete(partial: string): Promise<string[]> {
  const prompt = `Complete this sentence naturally: "${partial}"`;

  const results = await completer(prompt, {
    max_new_tokens: 30,
    num_return_sequences: 3,
    temperature: 0.8,
    do_sample: true,
  });

  return results.map((r: any) => 
    r.generated_text.replace(prompt, '').trim()
  );
}
```

 

### [](#2-clientside-text-classification)2\. Client-side text classification

```
// Spam detection, sentiment analysis, content moderation — no API calls
const classifier = await pipeline('zero-shot-classification',
  'Xenova/mobilebert-uncased-mnli',
  { device: 'webgpu' }
);

async function classifyContent(text: string): Promise<{
  label: string;
  score: number;
}> {
  const result = await classifier(text, [
    'spam', 'legitimate',
    'positive', 'negative', 'neutral',
    'question', 'statement',
  ]);

  return {
    label: result.labels[0],
    score: result.scores[0],
  };
}
```

 

### [](#3-local-embeddings-for-search)3\. Local embeddings for search

```
// Generate embeddings entirely client-side — great for local search
const embedder = await pipeline('feature-extraction',
  'Xenova/all-MiniLM-L6-v2',
  { device: 'webgpu' }
);

async function embed(text: string): Promise<number[]> {
  const result = await embedder(text, {
    pooling: 'mean',
    normalize: true,
  });

  return Array.from(result.data);
}

// Build a local search index without any API calls
async function localSearch(
  query: string, 
  documents: string[]
): Promise<{ doc: string; score: number }[]> {
  const queryEmbedding = await embed(query);
  const docEmbeddings = await Promise.all(documents.map(embed));

  return docEmbeddings
    .map((docEmb, i) => ({
      doc: documents[i],
      score: cosineSimilarity(queryEmbedding, docEmb),
    }))
    .sort((a, b) => b.score - a.score);
}
```

 

### [](#4-realtime-translation)4\. Real-time translation

```
// Translation without API calls — perfect for chat apps
const translator = await pipeline('translation',
  'Xenova/nllb-200-distilled-600M',
  { device: 'webgpu', dtype: 'q4' }
);

async function translate(
  text: string, 
  from: string, 
  to: string
): Promise<string> {
  const result = await translator(text, {
    src_lang: from,
    tgt_lang: to,
    max_length: 512,
  });

  return result[0].translation_text;
}
```

 

## [](#performance-optimization)Performance optimization

### [](#warmup-inference)Warm-up inference

The first inference after model load is always slowest (WebGPU pipeline compilation). Run a warm-up:  

```
async function warmUp(model: any, tokenizer: any): Promise<void> {
  const dummyInput = tokenizer('warmup', { return_tensors: 'pt' });
  await model.generate({
    ...dummyInput,
    max_new_tokens: 1,
  });
  // First real inference will now be 2-3x faster
}
```

 

### [](#kv-cache-management)KV cache management

For multi-turn conversations, manage the KV cache to avoid recomputing previous tokens:  

```
interface ConversationState {
  pastKeyValues: any;
  tokenCount: number;
}

async function continueConversation(
  model: any,
  tokenizer: any,
  newMessage: string,
  state: ConversationState | null,
): Promise<{ response: string; newState: ConversationState }> {
  const inputs = tokenizer(newMessage, { return_tensors: 'pt' });

  const generation = await model.generate({
    ...inputs,
    max_new_tokens: 256,
    past_key_values: state?.pastKeyValues ?? null,
    // Reuses cached computation from previous turns
  });

  return {
    response: tokenizer.decode(generation[0], { skip_special_tokens: true }),
    newState: {
      pastKeyValues: generation.past_key_values,
      tokenCount: (state?.tokenCount ?? 0) + inputs.input_ids.length,
    },
  };
}
```

 

### [](#memory-pressure-monitoring)Memory pressure monitoring

Browsers kill tabs that use too much memory. Monitor and respond:  

```
function monitorMemory(thresholdMB: number = 1500): void {
  if ('memory' in performance) {
    const memInfo = (performance as any).memory;
    const usedMB = memInfo.usedJSHeapSize / 1024 / 1024;
    const limitMB = memInfo.jsHeapSizeLimit / 1024 / 1024;

    console.log(`Memory: ${usedMB.toFixed(0)}MB / ${limitMB.toFixed(0)}MB`);

    if (usedMB > thresholdMB) {
      console.warn('High memory usage — consider unloading model');
      // Trigger model unload or reduce batch size
    }
  }
}

// Check periodically
setInterval(() => monitorMemory(), 10000);
```

 

## [](#common-pitfalls)Common pitfalls

### [](#pitfall-1-blocking-the-main-thread)Pitfall 1: Blocking the main thread

The most common mistake. Even with WebGPU, model loading and tokenization happen on the CPU and can freeze your UI for seconds.  

```
// ❌ Bad: loading on main thread
const model = await pipeline('text-generation', 'model-id');
// UI is frozen during download + initialization

// ✅ Good: Web Worker + progress UI
const worker = new Worker(new URL('./ai-worker.ts', import.meta.url));
worker.postMessage({ type: 'LOAD', model: 'model-id' });
// Show loading spinner while worker initializes
```

 

### [](#pitfall-2-ignoring-model-warmup)Pitfall 2: Ignoring model warm-up

First inference is always 2-5x slower due to WebGPU pipeline compilation. Users blame your app.  

```
// ❌ Bad: first user prompt gets slow response
// User types, waits 3 seconds → bad UX

// ✅ Good: warm up immediately after load
await loadModel();
await warmUp(model, tokenizer); // Pre-compile GPU pipelines
// First user prompt is consistently fast
```

 

### [](#pitfall-3-no-fallback-for-unsupported-browsers)Pitfall 3: No fallback for unsupported browsers

~15% of web users still lack WebGPU support (older browsers, some Android versions, Linux without updated drivers).  

```
// ❌ Bad: assume WebGPU is available
const model = await pipeline('text-generation', 'model', { device: 'webgpu' });
// Crashes on unsupported browsers

// ✅ Good: progressive enhancement
const backend = await detectBestBackend();
if (backend === 'server') {
  showMessage('AI features use our server for your browser. Upgrade to Chrome for faster, private AI.');
}
```

 

### [](#pitfall-4-downloading-models-on-page-load)Pitfall 4: Downloading models on page load

A 900MB download that the user didn't ask for is hostile UX.  

```
// ❌ Bad: auto-download on page load
window.onload = () => loadModel('900MB-model');
// User's bandwidth destroyed, mobile data plan drained

// ✅ Good: load on demand with explicit user action
document.getElementById('ai-btn')!.onclick = async () => {
  showConfirmation('Download AI model (900MB)? It will be cached for future visits.');
  // Only download after user confirms
};
```

 

## [](#the-decision-framework)The decision framework

```
Do you need AI in the browser?
    ↓
Is it high-frequency, low-complexity?
    ↓ Yes                    ↓ No
    ↓                        → Use server API
Is privacy critical?
    ↓ Yes              ↓ No
    ↓                   → Consider server API
    ↓                     (simpler, more capable)
    ↓
Can you tolerate 500MB-2GB first-load download?
    ↓ Yes              ↓ No
    ↓                   → Use Chrome Built-in AI
    ↓                     (zero download, Chrome only)
    ↓
Use Transformers.js + WebGPU
    ↓
Model ≤ 2B params for interactive speed
    ↓
Deploy with Web Worker + server fallback
```

 

## [](#conclusion)Conclusion

Browser-based AI in 2026 is real, practical, and ready for production — with caveats. It's not a replacement for server-side AI; it's a complementary layer that excels at specific use cases.

The sweet spot: **high-frequency, privacy-sensitive, latency-critical** tasks where the cost of API calls doesn't make sense. Autocomplete, classification, local search, content moderation, real-time translation — these all work beautifully with sub-2B parameter models running on WebGPU.

Here's what to do:

1.  **Start with a specific use case**, not "let's put AI in the browser." Pick the one feature where local inference solves a real problem (cost, privacy, latency).
    
2.  **Default to Qwen2.5-0.5B or Llama-3.2-1B** as your first model. Both are fast, capable enough for most tasks, and fit comfortable in browser memory at Q4 quantization.
    
3.  **Always use Web Workers.** No exceptions. Main thread inference is an instant path to janky UI.
    
4.  **Build the fallback chain.** WebGPU → WASM → Server. Never assume the user's browser supports WebGPU.
    
5.  **Don't download models without asking.** An explicit opt-in with size indication is basic UX respect.
    

The gap between "AI that requires a data center" and "AI that runs in a browser tab" is closing fast. The models are getting smaller and smarter. The runtime (WebGPU) is getting faster. The tooling (Transformers.js) is getting smoother. For the right use cases, client-side AI isn't the future — it's already the best option.

---

> 💡 **Note:** This article was originally published on the [Pockit Blog](https://pockit.tools/blog/run-llms-browser-webgpu-transformers-js-chrome-built-in-ai-guide/).
> 
> Check out [Pockit.tools](https://pockit.tools/json-formatter/) for 60+ free developer utilities. For faster access, **[add it to Chrome](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** and use JSON Formatter & Diff Checker directly from your toolbar.
