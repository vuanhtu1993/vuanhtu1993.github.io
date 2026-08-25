---
title: "Fine-Tuning Open-Source LLMs with QLoRA and Unsloth: The Complete 2026 Guide"
source_url: "https://dev.to/pockit_tools/fine-tuning-open-source-llms-with-qlora-and-unsloth-the-complete-2026-guide-2ome"
crawled_at: "2026-08-07T09:31:06.601Z"
---

You've built a prototype with GPT-4 or Claude. It works great. Then the invoice arrives: $12,000 for last month's API calls. And it's growing 40% month-over-month.

This is the moment every AI engineer hits. The prototype-to-production cliff where managed API costs become unsustainable, latency requirements tighten, and you realize you need a model that actually understands _your_ domain — not the entire internet's worth of knowledge.

Fine-tuning an open-source LLM is the answer. And thanks to QLoRA (Quantized Low-Rank Adaptation) and tools like Unsloth, you no longer need a cluster of A100 GPUs or a PhD in machine learning to do it. A single consumer GPU with 24GB of VRAM — an RTX 4090 or even a free Google Colab T4 — is enough to fine-tune a model with billions of active parameters to outperform GPT-4 on your specific task.

This guide covers everything from zero to production: why fine-tuning works, how QLoRA makes it feasible on consumer hardware, how to prepare your dataset, the exact training code, evaluation strategies, and deployment. Every code example is production-tested.

## [](#why-finetune-instead-of-prompting)Why Fine-Tune Instead of Prompting?

Before diving into the how, let's be precise about _when_ fine-tuning is the right choice. It's not always the answer.

**Use prompting / RAG when:**

-   Your task is general-purpose (summarization, translation, Q&A over documents)
-   Your data changes frequently (knowledge bases, support tickets)
-   You're still exploring what the model should do
-   You need to ship in days, not weeks

**Use fine-tuning when:**

-   The model needs to learn a specific _style_, _format_, or _behavior_ that prompting can't reliably produce
-   You have a well-defined task with consistent input/output patterns
-   Latency and cost at scale matter (a fine-tuned 7B model is 10–50x cheaper per token than GPT-4)
-   You need the model to deeply understand domain-specific terminology
-   You want to reduce hallucinations on domain-specific facts

The most common fine-tuning use cases in production:

| Use Case | Why Prompting Falls Short | Fine-Tuning Advantage |
| --- | --- | --- |
| Code generation for internal APIs | Model doesn't know your SDK | Learns your specific patterns and conventions |
| Medical/Legal document analysis | Generic models hedge too much | Confident, domain-specific outputs |
| Structured data extraction | Prompt-based formatting is brittle | Consistent schema adherence |
| Customer support tone matching | System prompts drift over long conversations | Baked-in voice and personality |
| SQL generation for custom schemas | Schema in context eats tokens | Internalized schema knowledge |

The key insight: fine-tuning doesn't teach the model new knowledge per se. It teaches the model new _behaviors_. A fine-tuned model doesn't memorize your database — it learns how to _reason_ about your domain's patterns, produce outputs in your specific format, and apply your organization's conventions consistently.

## [](#understanding-lora-and-qlora)Understanding LoRA and QLoRA

### [](#the-problem-full-finetuning-is-expensive)The Problem: Full Fine-Tuning Is Expensive

Traditional full fine-tuning updates every parameter in the model. For a 7B parameter model, this means:

-   **Memory:** ~28GB just for the model weights in FP32, plus ~28GB for optimizer states, plus ~28GB for gradients. Total: ~84GB of VRAM minimum.
-   **Hardware:** Multiple A100 80GB GPUs.
-   **Cost:** $10–50/hour on cloud GPU instances, training runs lasting hours to days.
-   **Risk:** Catastrophic forgetting — the model loses its general capabilities while learning your specific task.

### [](#lora-the-breakthrough)LoRA: The Breakthrough

LoRA (Low-Rank Adaptation), introduced by Hu et al. in 2021, had a key insight: **you don't need to update all parameters.** When fine-tuning a pre-trained model, the weight changes tend to have a low intrinsic rank. This means the update matrix can be decomposed into two much smaller matrices.

Instead of updating a weight matrix `W` of dimensions `d × k`, LoRA freezes `W` and trains two small matrices `A` (d × r) and `B` (r × k), where `r` (the rank) is much smaller than both `d` and `k`:  

```
Original:  W (4096 × 4096) → 16.7M parameters to update
LoRA:      A (4096 × 16) + B (16 × 4096) → 131K parameters to update

Reduction: 99.2% fewer trainable parameters
```

 

The forward pass becomes: `output = W·x + α·B·A·x`, where `α` is a scaling factor. During inference, you can merge `B·A` back into `W`, so there's **zero additional latency** compared to the original model.  

```
# Conceptual illustration of LoRA
import torch
import torch.nn as nn

class LoRALayer(nn.Module):
    def __init__(self, original_layer: nn.Linear, rank: int = 16, alpha: float = 32):
        super().__init__()
        self.original = original_layer
        self.original.weight.requires_grad = False  # Freeze original weights

        d_in = original_layer.in_features
        d_out = original_layer.out_features

        # Low-rank decomposition matrices
        self.lora_A = nn.Parameter(torch.randn(d_in, rank) * 0.01)
        self.lora_B = nn.Parameter(torch.zeros(rank, d_out))

        self.scale = alpha / rank

    def forward(self, x):
        # Original computation (frozen) + low-rank update
        original_output = self.original(x)
        lora_output = (x @ self.lora_A @ self.lora_B) * self.scale
        return original_output + lora_output

    def merge(self):
        """Merge LoRA weights into original for zero-cost inference."""
        self.original.weight.data += (self.lora_A @ self.lora_B).T * self.scale
```

 

### [](#qlora-making-it-accessible)QLoRA: Making It Accessible

QLoRA (Quantized LoRA), introduced by Dettmers et al. in 2023, added three innovations that made fine-tuning accessible to consumer hardware:

1.  **4-bit NormalFloat (NF4) Quantization:** The base model is quantized to 4 bits using a distribution-aware quantization scheme. This reduces a 7B model from ~14GB (FP16) to ~3.5GB.
    
2.  **Double Quantization:** The quantization constants themselves are quantized, saving an additional 0.37 bits per parameter (~325MB on a 7B model).
    
3.  **Paged Optimizers:** Optimizer states are offloaded to CPU RAM when GPU memory runs low, using NVIDIA unified memory. This prevents OOM crashes during training spikes.
    

The result: **fine-tune a 7B model on a single 24GB GPU, or a 13B model on a 48GB GPU.** Here's the memory breakdown:  

```
Full Fine-Tuning (7B model):
  Model weights (FP32):    ~28 GB
  Optimizer states:        ~28 GB
  Gradients:               ~28 GB
  Total:                   ~84 GB → Needs 2x A100 80GB

QLoRA Fine-Tuning (7B model):
  Model weights (NF4):     ~3.5 GB
  LoRA adapters (FP16):    ~0.1 GB
  Optimizer states:        ~0.4 GB
  Gradients + activations: ~4.0 GB
  Total:                   ~8.0 GB → Fits on RTX 4090 (24GB) with room to spare
```

 

The quality difference between full fine-tuning and QLoRA? In most benchmarks, it's within 1–2% — a negligible tradeoff for a 10x reduction in hardware requirements.

## [](#setting-up-your-environment)Setting Up Your Environment

### [](#hardware-requirements)Hardware Requirements

| GPU | VRAM | Maximum Model Size | Training Speed |
| --- | --- | --- | --- |
| T4 (Colab Free) | 16GB | 7B (tight) | ~1.5 hours/epoch on 10K samples |
| RTX 3090/4090 | 24GB | 7B (comfortable), 13B (tight) | ~45 min/epoch on 10K samples |
| A100 40GB | 40GB | 13B (comfortable), 34B (tight) | ~20 min/epoch on 10K samples |
| A100 80GB | 80GB | 70B with aggressive quantization | ~15 min/epoch on 10K samples |

### [](#installation)Installation

Using Unsloth (recommended for 2–5x speedup over standard HuggingFace training):  

```
# Create a fresh environment
conda create -n finetune python=3.11 -y
conda activate finetune

# Install PyTorch with CUDA support
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Install Unsloth (handles bitsandbytes, transformers, peft, trl automatically)
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
pip install --no-deps xformers trl peft accelerate bitsandbytes

# For evaluation
pip install rouge-score nltk scikit-learn
```

 

For a standard HuggingFace setup (without Unsloth):  

```
pip install transformers peft trl bitsandbytes accelerate datasets
pip install flash-attn --no-build-isolation  # Optional but recommended
```

 

### [](#choosing-a-base-model-march-2026)Choosing a Base Model (March 2026)

The choice of base model matters more than most people realize. Here's the current landscape:

| Model | Parameters | Context Length | Best For | License |
| --- | --- | --- | --- | --- |
| Llama 4 Scout | 109B total / 17B active (MoE) | 10M | Latest Meta flagship, massive context, needs H100 | Llama 4 Community |
| Llama 3.1 8B | 8B | 128K | Best quality-to-size ratio for beginners | Llama 3.1 Community |
| Mistral Small 4 | 32B | 128K | Multilingual, strong reasoning, Apache licensed | Apache 2.0 |
| Gemma 3 27B | 27B | 128K | Multimodal, strong coding, Google ecosystem | Gemma License |
| Qwen 2.5 7B | 7B | 128K | Best for Chinese + English bilingual | Apache 2.0 |
| Phi-4 14B | 14B | 16K | Compact, strong reasoning | MIT |

**Recommendation for first-timers:** Start with **Llama 3.1 8B**. It has the largest community, the most tutorials, and the best quality-to-resources ratio. Once your pipeline works, swap in larger models like Llama 4 Scout or Gemma 3 27B. Note that Llama 4 Scout uses a Mixture-of-Experts (MoE) architecture — only 17B parameters are active per token, making it surprisingly efficient despite its 109B total parameter count.

## [](#preparing-your-dataset)Preparing Your Dataset

This is where most fine-tuning projects succeed or fail. The model is only as good as the data you feed it. A 500-example dataset of exceptional quality will outperform a 50,000-example dataset of mediocre quality.

### [](#data-format-the-chat-template)Data Format: The Chat Template

Modern fine-tuning uses the conversational format (also called the "chat template" or "instruction format"). Here's the standard structure:  

````
{
  "conversations": [
    {"role": "system", "content": "You are a senior backend engineer specializing in PostgreSQL optimization."},
    {"role": "user", "content": "This query is taking 30 seconds on a table with 50M rows:\n\nSELECT * FROM orders WHERE customer_id = 12345 AND status = 'pending' ORDER BY created_at DESC LIMIT 10;"},
    {"role": "assistant", "content": "The issue is likely a missing composite index. Here's the analysis:\n\n**Problem:** Without an index on `(customer_id, status, created_at)`, PostgreSQL performs a sequential scan on 50M rows, then sorts the results.\n\n**Solution:**\n```

sql\nCREATE INDEX CONCURRENTLY idx_orders_customer_status_created\nON orders (customer_id, status, created_at DESC);\n

```\n\n**Why this works:**\n1. The index covers all three columns in the WHERE and ORDER BY clauses\n2. `created_at DESC` in the index matches your ORDER BY, eliminating a sort operation\n3. PostgreSQL can use an Index Only Scan if you replace `SELECT *` with specific columns\n4. `CONCURRENTLY` prevents locking the table during creation\n\n**Expected improvement:** From ~30s to <10ms for this query pattern."}
  ]
}
````

 

### [](#data-quality-checklist)Data Quality Checklist

Before training, audit your dataset against these criteria:  

```
def audit_dataset(dataset):
    issues = []

    for i, example in enumerate(dataset):
        conversations = example['conversations']

        # Check 1: Minimum conversation length
        if len(conversations) < 2:
            issues.append(f"Example {i}: Less than 2 turns")

        # Check 2: Response quality (length proxy)
        assistant_msgs = [c for c in conversations if c['role'] == 'assistant']
        for msg in assistant_msgs:
            if len(msg['content']) < 50:
                issues.append(f"Example {i}: Very short assistant response ({len(msg['content'])} chars)")
            if len(msg['content']) > 8000:
                issues.append(f"Example {i}: Very long assistant response ({len(msg['content'])} chars)")

        # Check 3: No empty messages
        for c in conversations:
            if not c['content'].strip():
                issues.append(f"Example {i}: Empty message from {c['role']}")

        # Check 4: Proper role alternation
        roles = [c['role'] for c in conversations if c['role'] != 'system']
        for j in range(1, len(roles)):
            if roles[j] == roles[j-1]:
                issues.append(f"Example {i}: Consecutive {roles[j]} messages")

        # Check 5: No data leakage (model shouldn't reference being fine-tuned)
        for c in conversations:
            if any(phrase in c['content'].lower() for phrase in ['as an ai', 'i am an ai', 'language model']):
                issues.append(f"Example {i}: Potential identity leakage in {c['role']} message")

    return issues
```

 

### [](#how-many-examples-do-you-need)How Many Examples Do You Need?

The answer depends on your task:

| Task Type | Minimum | Sweet Spot | Diminishing Returns |
| --- | --- | --- | --- |
| Style/tone adaptation | 50–100 | 200–500 | \>1,000 |
| Domain-specific Q&A | 200–500 | 1,000–3,000 | \>10,000 |
| Code generation (specific SDK) | 500–1,000 | 2,000–5,000 | \>15,000 |
| Complex reasoning chains | 1,000–2,000 | 5,000–10,000 | \>20,000 |

**The 80/10/10 rule for data splitting:**

-   80% for training
-   10% for validation (monitored during training to prevent overfitting)
-   10% for final evaluation (never seen during training)

```
from datasets import load_dataset, DatasetDict

def prepare_splits(dataset_path):
    dataset = load_dataset("json", data_files=dataset_path, split="train")
    dataset = dataset.shuffle(seed=42)

    # 80/10/10 split
    train_test = dataset.train_test_split(test_size=0.2, seed=42)
    val_test = train_test['test'].train_test_split(test_size=0.5, seed=42)

    return DatasetDict({
        'train': train_test['train'],
        'validation': val_test['train'],
        'test': val_test['test'],
    })
```

 

### [](#generating-synthetic-training-data)Generating Synthetic Training Data

If you don't have enough examples, you can bootstrap your dataset using a strong model (GPT-4, Claude) to generate training data for a smaller model. This technique, called **knowledge distillation via synthetic data**, is used extensively in production.  

```
import openai
import json

SYSTEM_PROMPT = """You are generating training data for a fine-tuned model
that will act as a PostgreSQL optimization expert.

Generate realistic user questions about PostgreSQL performance issues and
provide expert-level responses. Include:
- Specific SQL queries with realistic table names and sizes
- EXPLAIN ANALYZE output interpretation
- Concrete index recommendations with CREATE INDEX statements
- Performance improvement estimates

Each response should be 200-500 words with code examples."""

async def generate_training_examples(n_examples: int = 500):
    client = openai.AsyncOpenAI()
    examples = []

    topics = [
        "slow JOIN queries on large tables",
        "N+1 query problems in ORMs",
        "full table scans on indexed columns",
        "lock contention in high-write scenarios",
        "query plan regression after VACUUM",
        "connection pool exhaustion",
        "index bloat detection and remediation",
        # ... more topics
    ]

    for i in range(n_examples):
        topic = topics[i % len(topics)]

        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Generate a training example about: {topic}. "
                                             f"Vary the complexity and table schemas."}
            ],
            temperature=0.9,  # Higher temperature for diversity
            response_format={"type": "json_object"},
        )

        example = json.loads(response.choices[0].message.content)
        examples.append(example)

    return examples
```

 

**Critical warning:** Always manually review a sample of your synthetic data. LLMs can generate plausible-sounding but incorrect technical advice. Budget time for human review of at least 10–20% of synthetic examples.

## [](#training-with-unsloth)Training with Unsloth

Now for the main event. Here's the complete training script:  

```
from unsloth import FastLanguageModel
from trl import SFTTrainer
from transformers import TrainingArguments
from datasets import load_dataset

# ─────────────────────────────────────────
# 1. Load Model with 4-bit Quantization
# ─────────────────────────────────────────
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Meta-Llama-3.1-8B-Instruct",
    max_seq_length=4096,      # Maximum sequence length for training
    dtype=None,                # Auto-detect: float16 for older GPUs, bfloat16 for Ampere+
    load_in_4bit=True,         # QLoRA: load base model in 4-bit NF4
    # token="hf_...",          # Uncomment if using gated models
)

# ─────────────────────────────────────────
# 2. Configure LoRA Adapters
# ─────────────────────────────────────────
model = FastLanguageModel.get_peft_model(
    model,
    r=32,                       # LoRA rank — higher = more capacity, more VRAM
    lora_alpha=64,              # Scaling factor — typically 2x rank
    target_modules=[            # Which layers to adapt
        "q_proj", "k_proj", "v_proj", "o_proj",  # Attention layers
        "gate_proj", "up_proj", "down_proj",       # MLP layers
    ],
    lora_dropout=0.05,          # Slight dropout for regularization
    bias="none",                # Don't train bias terms
    use_gradient_checkpointing="unsloth",  # 60% less VRAM for long contexts
    random_state=42,
)

# Verify trainable parameters
model.print_trainable_parameters()
# Output: trainable params: 83,886,080 || all params: 8,113,831,936 || trainable%: 1.034%

# ─────────────────────────────────────────
# 3. Load and Format Dataset
# ─────────────────────────────────────────
dataset = load_dataset("json", data_files="training_data.jsonl", split="train")

def format_chat(example):
    """Format conversations into the Llama 3 chat template."""
    messages = example['conversations']
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=False,
    )
    return {"text": text}

dataset = dataset.map(format_chat, remove_columns=dataset.column_names)

# ─────────────────────────────────────────
# 4. Configure Training
# ─────────────────────────────────────────
training_args = TrainingArguments(
    output_dir="./outputs",
    per_device_train_batch_size=4,      # Adjust based on VRAM
    gradient_accumulation_steps=4,       # Effective batch size = 4 * 4 = 16
    num_train_epochs=3,                  # 2-4 epochs is typical
    learning_rate=2e-4,                  # Standard for QLoRA
    lr_scheduler_type="cosine",          # Cosine decay with warmup
    warmup_ratio=0.05,                   # 5% of steps for warmup
    weight_decay=0.01,                   # Mild regularization
    logging_steps=10,
    save_strategy="steps",
    save_steps=100,
    eval_strategy="steps",
    eval_steps=100,
    fp16=not torch.cuda.is_bf16_supported(),
    bf16=torch.cuda.is_bf16_supported(),
    optim="adamw_8bit",                  # 8-bit Adam saves VRAM
    seed=42,
    max_grad_norm=0.3,                   # Gradient clipping for stability
    report_to="wandb",                   # Optional: Weights & Biases logging
)

# ─────────────────────────────────────────
# 5. Initialize Trainer and Start
# ─────────────────────────────────────────
trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    args=training_args,
    max_seq_length=4096,
    dataset_text_field="text",
    packing=True,              # Pack short examples together for efficiency
)

# Start training
print("Starting fine-tuning...")
stats = trainer.train()
print(f"Training completed in {stats.metrics['train_runtime']:.0f} seconds")
print(f"Final loss: {stats.metrics['train_loss']:.4f}")
```

 

### [](#hyperparameter-tuning-guide)Hyperparameter Tuning Guide

The defaults above work well for most cases, but here's how to tune them:

**LoRA Rank (`r`):**

-   `r=8`: Minimal adaptation. Good for simple style changes.
-   `r=16`: Default. Works for most tasks.
-   `r=32`: Higher capacity. Good for complex domain adaptation.
-   `r=64+`: Approaching full fine-tuning capacity. Rarely needed.

Rule of thumb: start with `r=16`. If validation loss plateaus early, increase to 32. If it overfits quickly, decrease to 8.

**Learning Rate:**

-   `2e-4`: Standard QLoRA learning rate. Start here.
-   `1e-4`: More conservative. Use if training is unstable.
-   `5e-5`: Very conservative. Use for very small datasets (<200 examples).

**Number of Epochs:**

-   1–2: Large datasets (>10K examples)
-   2–4: Medium datasets (1K–10K examples)
-   4–8: Small datasets (<1K examples)
-   **Watch for overfitting:** If validation loss starts increasing while training loss keeps decreasing, you're overfitting. Stop training.

```
# Monitor overfitting during training
from transformers import EarlyStoppingCallback

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,        # Critical: provide validation set
    args=training_args,
    callbacks=[
        EarlyStoppingCallback(
            early_stopping_patience=3,    # Stop after 3 eval steps without improvement
            early_stopping_threshold=0.01 # Minimum improvement threshold
        ),
    ],
    max_seq_length=4096,
    dataset_text_field="text",
    packing=True,
)
```

 

### [](#what-the-training-loss-curve-should-look-like)What the Training Loss Curve Should Look Like

A healthy training run looks like this:  

```
Loss
 4.0 |X
     |  X
 3.0 |    X
     |      X
 2.0 |        X  X
     |            X  X  X
 1.0 |                    X  X  X  X  X  X  ← plateau (good, model converged)
     |
 0.0 +─────────────────────────────────────
     0    200   400   600   800   1000
                    Steps

Red flags:
- Loss doesn't decrease → Learning rate too low, or data has issues
- Loss drops to near 0 → Overfitting badly, reduce epochs or increase data
- Loss is very noisy → Batch size too small or learning rate too high
- Loss spikes suddenly → Gradient explosion, reduce learning rate
```

 

## [](#evaluating-your-model)Evaluating Your Model

Training is only half the battle. Evaluation tells you whether your fine-tuned model actually improves on the base model for your specific task.

### [](#automated-evaluation)Automated Evaluation

````
import torch
from rouge_score import rouge_scorer
from sklearn.metrics import accuracy_score
import json

def evaluate_model(model, tokenizer, test_dataset, max_samples=100):
    """Comprehensive evaluation of fine-tuned model."""
    model.eval()
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rougeL'], use_stemmer=True)

    results = {
        'rouge1_scores': [],
        'rougeL_scores': [],
        'format_compliance': [],
        'avg_response_length': [],
        'examples': [],
    }

    for i, example in enumerate(test_dataset.select(range(min(max_samples, len(test_dataset))))):
        conversations = example['conversations']

        # Build prompt from all messages except the last assistant response
        prompt_messages = []
        expected_response = ""
        for msg in conversations:
            if msg['role'] == 'assistant' and msg == conversations[-1]:
                expected_response = msg['content']
            else:
                prompt_messages.append(msg)

        # Generate response
        inputs = tokenizer.apply_chat_template(
            prompt_messages,
            tokenize=True,
            add_generation_prompt=True,
            return_tensors="pt"
        ).to(model.device)

        with torch.no_grad():
            outputs = model.generate(
                inputs,
                max_new_tokens=1024,
                temperature=0.1,       # Low temperature for evaluation
                do_sample=False,        # Greedy decoding for reproducibility
            )

        generated = tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)

        # Score
        rouge_scores = scorer.score(expected_response, generated)
        results['rouge1_scores'].append(rouge_scores['rouge1'].fmeasure)
        results['rougeL_scores'].append(rouge_scores['rougeL'].fmeasure)
        results['avg_response_length'].append(len(generated))

        # Check format compliance (e.g., does it include code blocks when expected?)
        expected_has_code = '```

' in expected_response
        generated_has_code = '

```' in generated
        results['format_compliance'].append(expected_has_code == generated_has_code)

        # Store examples for manual review
        if i < 10:
            results['examples'].append({
                'prompt': prompt_messages[-1]['content'][:200],
                'expected': expected_response[:300],
                'generated': generated[:300],
                'rouge1': rouge_scores['rouge1'].fmeasure,
            })

    # Aggregate results
    summary = {
        'avg_rouge1': sum(results['rouge1_scores']) / len(results['rouge1_scores']),
        'avg_rougeL': sum(results['rougeL_scores']) / len(results['rougeL_scores']),
        'format_compliance_rate': sum(results['format_compliance']) / len(results['format_compliance']),
        'avg_response_length': sum(results['avg_response_length']) / len(results['avg_response_length']),
        'examples': results['examples'],
    }

    return summary
````

 

### [](#ab-comparison-base-vs-finetuned)A/B Comparison: Base vs. Fine-Tuned

The most informative evaluation compares your fine-tuned model against the base model on the same prompts:  

```
async def ab_comparison(base_model, finetuned_model, tokenizer, test_prompts):
    """Side-by-side comparison of base vs fine-tuned model responses."""
    results = []

    for prompt in test_prompts:
        messages = [
            {"role": "system", "content": "You are a PostgreSQL optimization expert."},
            {"role": "user", "content": prompt},
        ]

        # Generate from both models
        inputs = tokenizer.apply_chat_template(messages, tokenize=True,
                                                add_generation_prompt=True,
                                                return_tensors="pt")

        base_output = base_model.generate(inputs.to(base_model.device),
                                           max_new_tokens=512, temperature=0.1)
        ft_output = finetuned_model.generate(inputs.to(finetuned_model.device),
                                              max_new_tokens=512, temperature=0.1)

        base_text = tokenizer.decode(base_output[0][inputs.shape[1]:], skip_special_tokens=True)
        ft_text = tokenizer.decode(ft_output[0][inputs.shape[1]:], skip_special_tokens=True)

        results.append({
            'prompt': prompt,
            'base_response': base_text,
            'finetuned_response': ft_text,
        })

    return results
```

 

### [](#llmasjudge-evaluation)LLM-as-Judge Evaluation

For subjective quality assessment, use a stronger model to judge:  

```
async def llm_judge_evaluation(examples, judge_model="gpt-4o"):
    """Use a strong LLM to evaluate response quality."""
    client = openai.AsyncOpenAI()
    scores = []

    for ex in examples:
        response = await client.chat.completions.create(
            model=judge_model,
            messages=[{
                "role": "system",
                "content": """You are evaluating the quality of a fine-tuned model's response.
                Rate each response on these dimensions (1-5 scale):
                1. Technical Accuracy: Are the technical claims correct?
                2. Completeness: Does it address all aspects of the question?
                3. Format Compliance: Does it follow the expected output format?
                4. Actionability: Can the user directly apply this advice?

                Respond as JSON: {"accuracy": N, "completeness": N, "format": N, "actionability": N, "reasoning": "..."}"""
            }, {
                "role": "user",
                "content": f"Question: {ex['prompt']}\n\nResponse: {ex['finetuned_response']}"
            }],
            response_format={"type": "json_object"},
        )

        score = json.loads(response.choices[0].message.content)
        scores.append(score)

    return scores
```

 

## [](#saving-and-deploying-your-model)Saving and Deploying Your Model

### [](#saving-options)Saving Options

After training, you have three saving options:  

```
# Option 1: Save LoRA adapters only (~100-300MB)
# Best for: Version control, quick swapping between adapters
model.save_pretrained("./my-lora-adapter")
tokenizer.save_pretrained("./my-lora-adapter")

# Option 2: Merge and save full model in 16-bit (~14GB for 7B)
# Best for: Standard deployment with vLLM or TGI
model.save_pretrained_merged("./my-model-merged", tokenizer, save_method="merged_16bit")

# Option 3: Export as GGUF for llama.cpp / Ollama deployment
# Best for: CPU inference, edge deployment, local development
model.save_pretrained_gguf("./my-model-gguf", tokenizer, quantization_method="q4_k_m")

# Option 4: Push to Hugging Face Hub
model.push_to_hub("your-username/my-fine-tuned-model", token="hf_...")
tokenizer.push_to_hub("your-username/my-fine-tuned-model", token="hf_...")
```

 

### [](#deployment-with-vllm-production-recommended)Deployment with vLLM (Production Recommended)

vLLM is the standard for production LLM serving. It supports continuous batching, PagedAttention, and speculative decoding for maximum throughput:  

```
# Install vLLM
# pip install vllm

# Serve the merged model
# vllm serve ./my-model-merged --port 8000 --max-model-len 4096

# Or serve the base model with LoRA adapter (hot-swappable!)
# vllm serve unsloth/Meta-Llama-3.1-8B-Instruct \
#   --enable-lora \
#   --lora-modules my-adapter=./my-lora-adapter \
#   --port 8000

# Client code — uses OpenAI-compatible API
import openai

client = openai.OpenAI(base_url="http://localhost:8000/v1", api_key="dummy")

response = client.chat.completions.create(
    model="./my-model-merged",    # Or "my-adapter" for LoRA
    messages=[
        {"role": "system", "content": "You are a PostgreSQL optimization expert."},
        {"role": "user", "content": "My query is doing a sequential scan on 100M rows..."},
    ],
    temperature=0.3,
    max_tokens=1024,
)

print(response.choices[0].message.content)
```

 

### [](#deployment-with-ollama-localedge)Deployment with Ollama (Local/Edge)

For local development or edge deployment, export to GGUF and use Ollama:  

```
# After exporting to GGUF
# Create a Modelfile
cat > Modelfile << 'EOF'
FROM ./my-model-gguf/unsloth.Q4_K_M.gguf

TEMPLATE """{{ if .System }}<|start_header_id|>system<|end_header_id|>
{{ .System }}<|eot_id|>{{ end }}<|start_header_id|>user<|end_header_id|>
{{ .Prompt }}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
"""

PARAMETER temperature 0.3
PARAMETER num_ctx 4096
SYSTEM "You are a PostgreSQL optimization expert."
EOF

# Create and run the Ollama model
ollama create my-pg-expert -f Modelfile
ollama run my-pg-expert "How do I optimize a slow GROUP BY query?"
```

 

## [](#production-checklist)Production Checklist

Before shipping your fine-tuned model to production, run through this checklist:

### [](#predeployment)Pre-Deployment

-   \[ \] **Evaluation scores exceed baseline:** Fine-tuned model outperforms base model on your test set by a meaningful margin
-   \[ \] **No catastrophic forgetting:** Test on general tasks to ensure the model hasn't lost basic capabilities
-   \[ \] **Guardrails in place:** Test for harmful, biased, or out-of-scope outputs and implement content filtering
-   \[ \] **Latency benchmarks:** Measure P50, P95, and P99 latency under realistic load
-   \[ \] **Cost projection:** Calculate per-request cost including GPU compute, and compare to API-based alternatives

### [](#infrastructure)Infrastructure

```
# Health check endpoint for production deployment
from fastapi import FastAPI
import time

app = FastAPI()

@app.get("/health")
async def health():
    start = time.time()
    # Quick inference test
    response = model.generate(
        tokenizer("test", return_tensors="pt")["input_ids"].to(model.device),
        max_new_tokens=10,
    )
    latency_ms = (time.time() - start) * 1000

    return {
        "status": "healthy",
        "model": "my-finetuned-model-v1",
        "inference_latency_ms": round(latency_ms, 2),
        "gpu_memory_used_gb": round(torch.cuda.memory_allocated() / 1e9, 2),
        "gpu_memory_total_gb": round(torch.cuda.get_device_properties(0).total_mem / 1e9, 2),
    }
```

 

### [](#postdeployment-monitoring)Post-Deployment Monitoring

-   \[ \] **Track output quality over time:** Set up automated evaluation on a random sample of production requests
-   \[ \] **Monitor for distribution drift:** If user queries start differing from training data, model quality will degrade
-   \[ \] **Version your models:** Use semantic versioning (v1.0.0, v1.1.0) and maintain rollback capability
-   \[ \] **Retrain cadence:** Plan for periodic retraining as you accumulate more production data

## [](#common-pitfalls-and-how-to-avoid-them)Common Pitfalls and How to Avoid Them

### [](#pitfall-1-training-on-bad-data)Pitfall 1: Training on Bad Data

**Symptom:** Model generates plausible-sounding but factually incorrect responses.  
**Cause:** Synthetic training data was generated without human verification.  
**Fix:** Always have domain experts review at least 10% of your training data. One incorrect example can poison hundreds of related outputs.

### [](#pitfall-2-overfitting-on-small-datasets)Pitfall 2: Overfitting on Small Datasets

**Symptom:** Training loss approaches 0, but model outputs are formulaic and seem to memorize training examples verbatim.  
**Cause:** Too many epochs on too few examples.  
**Fix:** Reduce epochs, increase LoRA dropout to 0.1, use a lower LoRA rank, or augment your dataset.

### [](#pitfall-3-chat-template-mismatch)Pitfall 3: Chat Template Mismatch

**Symptom:** Model outputs garbage, repeated tokens, or ignores the system prompt.  
**Cause:** Using a different chat template during training vs. inference.  
**Fix:** Always use `tokenizer.apply_chat_template()` for both training data formatting and inference prompt construction. Never manually construct chat prompts.

### [](#pitfall-4-catastrophic-forgetting)Pitfall 4: Catastrophic Forgetting

**Symptom:** Model performs well on your specific task but can't handle basic tasks it could do before fine-tuning.  
**Cause:** Aggressive fine-tuning that overwrites general knowledge.  
**Fix:** Use a lower learning rate (5e-5 instead of 2e-4), fewer epochs, or mix in general-purpose data (10–20% of your training set should be general-purpose examples).

### [](#pitfall-5-ignoring-quantization-effects)Pitfall 5: Ignoring Quantization Effects

**Symptom:** Fine-tuned model performs well in FP16 but degrades significantly after GGUF quantization for deployment.  
**Cause:** Aggressive quantization (Q2\_K, Q3\_K) on models that weren't designed for it.  
**Fix:** Use Q4\_K\_M or Q5\_K\_M for deployment quantization. Always benchmark after quantization to verify quality is maintained. If quality drops significantly, use Q6\_K or Q8\_0 at the cost of higher memory usage.

## [](#cost-comparison-finetuning-vs-api)Cost Comparison: Fine-Tuning vs. API

Let's do the math on a realistic production scenario:

**Scenario:** 100,000 requests/month, average 500 input tokens + 500 output tokens per request.

| Approach | Monthly Cost | Latency (P50) | Control |
| --- | --- | --- | --- |
| GPT-4o API | ~$1,500 | 800ms | Low (OpenAI controls the model) |
| Claude 3.5 Sonnet API | ~$1,800 | 600ms | Low |
| GPT-4o-mini API | ~$30 | 400ms | Low |
| Self-hosted Llama 3.1 8B (A10G) | ~$350 | 120ms | Full |
| Self-hosted Fine-Tuned 8B (A10G) | ~$350 | 120ms | Full + Domain expertise |

The fine-tuned model costs the same to run as the base model — but produces higher-quality domain-specific outputs. On the A10G instance, you're paying ~$0.75/hour for dedicated GPU compute versus per-token API pricing that scales linearly with usage.

**Break-even point:** For most teams, self-hosting a fine-tuned model becomes cheaper than API calls at around 30,000–50,000 requests/month, depending on the API model and response length.

## [](#whats-next-emerging-techniques-in-2026)What's Next: Emerging Techniques in 2026

Fine-tuning is evolving fast. Here's what's on the horizon:

**Unsloth Studio (March 2026):** Unsloth just released an open-source, local, no-code interface that handles the entire fine-tuning lifecycle — data preparation, training, and deployment — in a single GUI. It claims 70% less VRAM and 2x faster training. If you're not comfortable with the Python scripts above, Studio is a game-changer for accessibility.

**DoRA (Weight-Decomposed Low-Rank Adaptation):** A 2024 innovation that separates magnitude and direction in weight updates, consistently outperforming LoRA by 1–3% with negligible additional overhead. Already integrated into the PEFT library.

**GaLore (Gradient Low-Rank Projection):** Promises full fine-tuning quality at LoRA-level memory costs by projecting gradients into a low-rank space. Still experimental but promising for users who want to avoid the LoRA quality ceiling.

**LoRA Merging and Model Soups:** Combining multiple LoRA adapters (each trained on different tasks) into a single model through weight averaging. Enables multi-task specialization without separate model deployments.

**GRPO (Group Relative Policy Optimization):** An emerging technique for training "reasoning AI" models that can perform multi-step logic and chain-of-thought. Unsloth supports GRPO with as little as 5GB of VRAM, making it accessible on local hardware. This is how the next generation of reasoning models (like DeepSeek-R1) are being trained.

**Reward Model Fine-Tuning (RLHF/DPO):** After supervised fine-tuning (SFT), a second training pass using Direct Preference Optimization (DPO) aligns model outputs with human preferences. This is how production models are trained to be helpful, harmless, and honest — and the tooling for applying it to custom models is now accessible.  

```
# DPO training after SFT (sketch)
from trl import DPOTrainer, DPOConfig

dpo_config = DPOConfig(
    output_dir="./dpo-output",
    beta=0.1,                    # KL-divergence penalty strength
    learning_rate=5e-6,          # Much lower than SFT
    per_device_train_batch_size=2,
    num_train_epochs=1,
)

# DPO dataset requires chosen/rejected pairs
# {"prompt": "...", "chosen": "good response", "rejected": "bad response"}
dpo_trainer = DPOTrainer(
    model=sft_model,
    ref_model=None,              # Uses implicit reference with PEFT
    args=dpo_config,
    train_dataset=preference_dataset,
    tokenizer=tokenizer,
)

dpo_trainer.train()
```

 

## [](#final-summary)Final Summary

Fine-tuning open-source LLMs has gone from a research-lab activity to a standard engineering workflow. With QLoRA and Unsloth, you can fine-tune a model that outperforms GPT-4 on your specific task — on a single consumer GPU, in under an hour.

The key principles:

1.  **Data quality over quantity.** 500 excellent examples beat 50,000 mediocre ones.
2.  **Start small.** Use Llama 3.1 8B with QLoRA on your smallest viable dataset. Get the pipeline working before scaling.
3.  **Evaluate rigorously.** Automated metrics (ROUGE, format compliance) plus LLM-as-judge plus manual review. All three.
4.  **Monitor in production.** The model's performance will drift as user queries evolve. Plan for periodic retraining.
5.  **Know when NOT to fine-tune.** If RAG or better prompting solves your problem, it's cheaper and faster than fine-tuning.

The gap between closed-source and open-source models shrinks every month. With the techniques in this guide, you can build production AI systems that are cheaper, faster, more private, and more specialized than anything an API can give you.

---

> 🛠️ **Developer Toolkit:** This post first appeared on the [Pockit Blog](https://pockit.tools/blog/fine-tuning-llms-qlora-unsloth-complete-guide/).
> 
> Need a **Regex Tester**, **JWT Decoder**, or **Image Converter**? Use them on [Pockit.tools](https://pockit.tools/json-formatter/) or **[install the Extension](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** to avoid switching tabs. No signup required.
