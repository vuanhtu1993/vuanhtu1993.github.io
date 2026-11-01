---
title: "Structured outputs"
source_url: "https://platform.claude.com/docs/en/build-with-claude/structured-outputs"
crawled_at: "2026-11-01T16:16:15.671Z"
---

Get validated JSON results from agent workflows

Structured outputs constrain Claude’s responses to follow a specific schema, ensuring valid, parseable output for downstream processing. Structured outputs provide two complementary features:

-   **JSON outputs** (`output_config.format`): Get Claude’s response in a specific JSON format, for example to extract data from images or text, generate structured reports, or format API responses. This page covers JSON outputs.
-   **Strict tool use** (`strict: true`): Guarantee schema validation on tool names and inputs. See [Strict tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use).

You can use these features independently or [together in the same request](#using-both-features-together).

## Why use structured outputs

Without structured outputs, Claude can generate malformed JSON responses or invalid tool inputs that break your applications. Even with careful prompting, you might encounter:

-   Parsing errors from invalid JSON syntax
-   Missing required fields
-   Inconsistent data types
-   Schema violations requiring error handling and retries

Structured outputs guarantee schema-compliant responses through constrained decoding:

-   **Always valid:** No more `JSON.parse()` errors
-   **Type safe:** Guaranteed field types and required fields
-   **Reliable:** No retries needed for schema violations

## How it works

1.  ### Define your schema
    
    Describe the structure you want as a JSON schema or as a type in your language. The schema follows JSON Schema, with some [limitations](#json-schema-limitations).
    
2.  ### Send it in output\_config.format
    
    The request carries the schema in `output_config.format` with `type: "json_schema"`. SDK helpers set this for you.
    
3.  ### Read the response
    
    Claude returns valid JSON that matches your schema in the response’s text content block. SDK helpers parse it into your type.
    

## Usage

## How SDK transformation works

Most SDK helpers transform schemas that use unsupported features. The transformation steps:

1.  **Remove unsupported constraints** (for example, `minimum`, `maximum`, `minLength`, `maxLength`)
2.  **Update descriptions** by adding each unsupported constraint to the field’s description (for example, `{minimum: 100}`)
3.  **Add `additionalProperties: false`** to all objects
4.  **Filter string formats** to the supported list only
5.  **Validate responses** against your original schema and all its constraints, if the helper validates responses

Claude receives a simplified schema, but a helper that validates responses still enforces every constraint in your code.

**Example:** A field with `minimum: 100` becomes a plain integer in the sent schema, and the SDK adds `{minimum: 100}` to the field’s description. A helper that validates responses still checks the response against `minimum: 100`.

## Using a raw JSON schema

To use a JSON schema from a file, an OpenAPI spec, or code that builds it at runtime, pass it in `output_config.format`.

## Common use cases

## Strict tool use

To enforce JSON Schema compliance on tool inputs with grammar-constrained sampling, see [Strict tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use).

### Using both features together

JSON outputs and strict tool use solve different problems and work together:

-   **JSON outputs** control Claude’s response format (what Claude says).
-   **Strict tool use** validates tool parameters (how Claude calls your functions).

When combined, Claude can call tools with guaranteed-valid parameters AND return structured JSON responses. This is useful for agentic workflows where you need both reliable tool calls and structured final outputs.

## Important considerations

### Grammar compilation and caching

Structured outputs use constrained sampling with compiled grammar artifacts. This introduces some performance characteristics to be aware of:

-   **First request latency:** The first time you use a specific schema, there is additional latency while the grammar compiles.
-   **Automatic caching:** Compiled grammars are cached for 24 hours from last use, making subsequent requests much faster.
-   **Cache invalidation:** The cache is invalidated if you change the JSON schema structure or, when using both structured outputs and tool use, the set of tools in your request. Changing only `name` or `description` fields does not invalidate the cache.

### Prompt modification and token costs

When using structured outputs, Claude automatically receives an additional system prompt explaining the expected output format. This means:

-   Your input token count is slightly higher.
-   The injected prompt costs you tokens like any other system prompt.
-   Changing the `output_config.format` parameter will invalidate any [prompt cache](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) for that conversation thread.

### JSON Schema limitations

Structured outputs support standard JSON Schema with some limitations. Both JSON outputs and strict tool use share these limitations.

### Property ordering

When using structured outputs, properties in objects maintain their defined ordering from your schema, with one important caveat: **required properties appear first, followed by optional properties**.

For example, given this schema:

The output will order properties as:

1.  `name` (required, in schema order)
2.  `email` (required, in schema order)
3.  `notes` (optional, in schema order)
4.  `age` (optional, in schema order)

This means the output might look like:

If property order in the output is important to your application, mark all properties as required, or account for this reordering in your parsing logic.

### Invalid outputs

Although structured outputs guarantee schema compliance in most cases, there are scenarios where the output might not match your schema:

**Refusals** (`stop_reason: "refusal"`)

Claude maintains its safety and helpfulness properties even when using structured outputs. If Claude refuses a request for safety reasons:

-   The response has `stop_reason: "refusal"`.
-   You’ll receive a 200 status code.
-   You’ll be billed for the tokens generated.
-   The output might not match your schema because the refusal message takes precedence over schema constraints.

A property that asks for the model’s thinking or step-by-step reasoning might lead to a `reasoning_extraction` refusal. Ask for a short explanation instead. See [Keep reasoning in thinking blocks](https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback#keep-reasoning-in-thinking-blocks).

**Token limit reached** (`stop_reason: "max_tokens"`)

If the response is cut off because it reached the `max_tokens` limit:

-   The response has `stop_reason: "max_tokens"`.
-   The output might be incomplete and not match your schema.
-   Retry with a higher `max_tokens` value to get the complete structured output.

**Enum value casing**

Structured outputs don’t guarantee the capitalization of string `enum` and `const` values: Claude might return a value that differs from your schema only in capitalization, typically in the first letter of a word following a space. For example, given this schema:

The output might contain `"Conversation Topic 3"` (capital “T”) even though that exact value isn’t in the enum. The response completes normally, with no error and no special `stop_reason`. This applies to both JSON outputs and strict tool use. Compare enum values case-insensitively, and avoid enum values that differ only in capitalization.

### Schema complexity limits

Structured outputs work by compiling your JSON schemas into a grammar that constrains Claude’s output. More complex schemas produce larger grammars that take longer to compile. To protect against excessive compilation times, the API enforces several complexity limits.

#### Explicit limits

The following limits apply to all requests with `output_config.format` or `strict: true`:

| Limit | Value | Description |
| --- | --- | --- |
| Strict tools per request | 20 | Maximum number of tools with `strict: true`. Non-strict tools don’t count toward this limit. |
| Optional parameters | 24 | Total optional parameters across all strict tool schemas and JSON output schemas. Each parameter not listed in `required` counts toward this limit. |
| Parameters with union types | 16 | Total parameters that use `anyOf` or type arrays (for example, `"type": ["string", "null"]`) across all strict schemas. These are especially expensive because they create exponential compilation cost. |

#### Additional internal limits

Beyond the explicit limits in the preceding table, there are additional internal limits on the compiled grammar size. These limits exist because schema complexity doesn’t reduce to a single dimension: features such as optional parameters, union types, nested objects, and number of tools interact with each other in ways that can make the compiled grammar disproportionately large.

When these limits are exceeded, you’ll receive a 400 error with the message “Schema is too complex for compilation.” These errors mean the combined complexity of your schemas exceeds what can be efficiently compiled, even if each individual limit in the preceding table is satisfied. As a final stop-gap, the API also enforces a **compilation timeout of 180 seconds**. Schemas that pass all explicit checks but produce very large compiled grammars might hit this timeout.

#### Tips for reducing schema complexity

If you’re hitting complexity limits, try these strategies in order:

1.  **Mark only critical tools as strict.** If you have many tools, reserve strict tool use for those where schema violations cause real problems, and rely on Claude’s natural adherence for simpler tools.
    
2.  **Reduce optional parameters.** Make parameters `required` where possible. Each optional parameter roughly doubles a portion of the grammar’s state space. If a parameter always has a reasonable default, consider making it required and having Claude provide that default explicitly.
    
3.  **Simplify nested structures.** Deeply nested objects with optional fields compound the complexity. Flatten structures where possible.
    
4.  **Split into multiple requests.** If you have many strict tools, consider splitting them across separate requests or subagents.
    

For persistent issues with valid schemas, [contact support](https://support.claude.com/en/articles/9015913-how-to-get-support) with your schema definition.

## Migrating from the beta

The `output_format` parameter has moved to `output_config.format`, and beta headers are no longer required. The `output_format` parameter is deprecated. To use it anyway, add the `structured-outputs-2025-11-13` beta header. Without it, the API returns a 400 error.

The Python SDK (v1.0 and later) does not accept `output_format={...}` on `client.beta.messages.create()` or `count_tokens()` and raises a `TypeError`. Use `output_config` instead. See [Using a raw JSON schema](#using-a-raw-json-schema) for the updated API shape.

## Feature compatibility

**Works with:**

-   **[Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing):** Process structured outputs at scale with a 50 percent discount
-   **[Token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting):** Count tokens without compilation
-   **[Streaming](https://platform.claude.com/docs/en/build-with-claude/streaming):** Stream structured outputs like normal responses
-   **[Combined usage](#using-both-features-together):** Use JSON outputs (`output_config.format`) and strict tool use (`strict: true`) together in the same request

**Incompatible with:**

-   **[Citations](https://platform.claude.com/docs/en/build-with-claude/citations):** Citations require interleaving citation blocks with text, which conflicts with strict JSON schema constraints. The API returns a 400 error if citations are enabled with `output_config.format`. To extract structured data with a citation for each value, see [Get structured data with citations](https://platform.claude.com/docs/en/build-with-claude/citations#get-structured-data-with-citations).
-   **Message prefilling:** Prefilling is incompatible with JSON outputs.

## Availability

Structured outputs are available on every model and eligible for HIPAA readiness.

### API support

Prompts and responses are processed with ZDR when using structured outputs. However, the JSON schema itself is temporarily cached for up to 24 hours since last use for optimization purposes. No prompt or response data is retained beyond the API response.

Structured outputs are HIPAA eligible, but **PHI must not be included in JSON schema definitions**. The API compiles JSON schemas into grammars that are cached separately from message content, and these cached schemas do not receive the same PHI protections as prompts and responses. Do not include PHI in schema property names, `enum` values, `const` values, or `pattern` regular expressions. PHI should only appear in message content (prompts and responses), where it is protected under HIPAA safeguards.

## Next steps

Have Claude cite its sources when answering questions about provided documents.

Enforce JSON Schema compliance on Claude’s tool inputs with grammar-constrained sampling.

Connect Claude to external tools and APIs. Learn where tools run and how the agentic loop works.

Learn about Anthropic’s pricing structure for models and features.
