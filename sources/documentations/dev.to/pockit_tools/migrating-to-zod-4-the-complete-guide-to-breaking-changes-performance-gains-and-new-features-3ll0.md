---
title: "Migrating to Zod 4: The Complete Guide to Breaking Changes, Performance Gains, and New Features"
source_url: "https://dev.to/pockit_tools/migrating-to-zod-4-the-complete-guide-to-breaking-changes-performance-gains-and-new-features-3ll0"
crawled_at: "2026-08-07T09:31:27.738Z"
---

If you've written TypeScript in the last three years, you've used Zod. It's in your API routes, your form validation, your tRPC endpoints, your environment variable parsers. Zod is _everywhere_ — and Zod 4 just changed everything about it.

The headline numbers are staggering: **14x faster** string parsing, **7x faster** array parsing, **2.3x smaller** core bundle, and up to **10x faster** TypeScript compilation. But those gains come with a laundry list of breaking changes that will make your CI turn red the moment you bump the version.

This guide covers every single breaking change, shows you the exact before/after code, and gives you a migration strategy that won't leave your team debugging schema failures for a week.

## [](#what-changed-and-why)What Changed and Why

Zod 3 was designed when TypeScript's type system was less capable and bundle size wasn't a primary concern for server-side validation libraries. As the ecosystem evolved — serverless functions with cold starts, edge runtimes with strict size limits, monorepos with thousands of schemas — Zod 3's architecture started showing its age.

Zod 4 is a ground-up rewrite that addresses three fundamental problems:

1.  **Bundle size**: Zod 3's method-chaining API made tree-shaking nearly impossible. Every import pulled in the entire library.
2.  **Parse performance**: The validation pipeline had unnecessary overhead from object creation and prototype chain lookups.
3.  **TypeScript compilation speed**: Complex Zod schemas generated enormous type instantiation counts, slowing `tsc` to a crawl in large codebases.

The fix required breaking the API surface. Let's go through every change.

## [](#breaking-change-1-the-unified-error-parameter)Breaking Change #1: The Unified Error Parameter

This is the change that will break the most code. Zod 3 had three separate ways to customize error messages:  

```
// ❌ Zod 3 — Three different parameters
const schema = z.string({
  required_error: "Name is required",
  invalid_type_error: "Name must be a string",
});

const email = z.string().email({ message: "Invalid email format" });

const age = z.number({
  errorMap: (issue, ctx) => {
    if (issue.code === "too_small") return { message: "Must be 18+" };
    return { message: ctx.defaultError };
  },
});
```

 

Zod 4 replaces all three with a single `error` parameter:  

```
// ✅ Zod 4 — Unified error parameter
const schema = z.string({
  error: "Name is required",  // Simple string
});

const email = z.string().email({
  error: "Invalid email format",  // Same pattern everywhere
});

const age = z.number({
  error: (issue) => {  // Function form for complex logic
    if (issue.code === "too_small") return "Must be 18+";
    return "Invalid age";
  },
});
```

 

The `message` property is now deprecated across all methods. `required_error`, `invalid_type_error`, and `errorMap` are gone entirely. Use the unified `error` parameter everywhere. The official codemod handles most of these automatically:  

```
npx @zod/codemod --transform v3-to-v4 ./src
```

 

But you'll need to manually review any custom `errorMap` implementations, because the function signature changed from `(issue, ctx) => { message: string }` to `(issue) => string`.

## [](#breaking-change-2-toplevel-format-validators)Breaking Change #2: Top-Level Format Validators

Zod 3 used method chains for string format validation. Zod 4 promotes the most common ones to top-level functions:  

```
// ❌ Zod 3 — Method chaining
const emailSchema = z.string().email();
const uuidSchema = z.string().uuid();
const urlSchema = z.string().url();
const isoDateSchema = z.string().datetime();

// ✅ Zod 4 — Top-level functions
const emailSchema = z.email();
const uuidSchema = z.uuid();
const urlSchema = z.url();
const isoDateSchema = z.iso.datetime();
```

 

Why? Because `z.string().email()` pulls in the entire `ZodString` class even if you only need email validation. Top-level functions enable proper tree-shaking. If your bundle only uses `z.email()` and `z.object()`, the bundler can eliminate everything else.

**Important**: The method-chain versions (`z.string().email()`) still work but are officially **deprecated** in Zod 4. They won't be removed immediately, so you can migrate gradually, but expect them to be dropped in a future major version.

Also note: `z.string().ip()` and `z.string().cidr()` are **dropped entirely** — replaced by `z.ipv4()`, `z.ipv6()`, `z.cidrv4()`, and `z.cidrv6()` respectively. And `z.uuid()` is now stricter, validating RFC 9562/4122 variant bits. If you need a more permissive pattern, use the new `z.guid()`.

## [](#breaking-change-3-coercion-input-types-are-now-raw-unknown-endraw-)Breaking Change #3: Coercion Input Types Are Now `unknown`

The `z.coerce` namespace still exists in Zod 4, but the **input type** of all coerced schemas changed from the specific type to `unknown`:  

```
const schema = z.coerce.string();

type SchemaInput = z.input<typeof schema>;
// Zod 3: string
// Zod 4: unknown
```

 

This is more honest about what coercion actually does — it accepts _anything_ and tries to convert it. But it means that TypeScript will no longer narrow the input type for you, which can surface type errors in code that relied on the narrowed input type.

If you're piping coerced types, be aware that the interaction with `.pipe()` has changed:  

```
// This may cause type issues in Zod 4
const schema = z.coerce.string().pipe(z.email());
// Check the v4 changelog for pipe + coerce edge cases
```

 

The `z.coerce` namespace itself (`z.coerce.number()`, `z.coerce.string()`, etc.) still works as before — the API surface hasn't changed, only the inferred input type.

## [](#breaking-change-4-optional-default-behavior)Breaking Change #4: Optional + Default Behavior

This is a subtle but dangerous change. In Zod 3, calling `.optional()` on a schema with `.default()` or `.catch()` would ignore missing properties. In Zod 4, the default/catch value is always applied:  

```
const schema = z.object({
  theme: z.string().default("light").optional(),
});

// Zod 3: { theme: undefined } → { theme: undefined }  ← Missing property ignored
// Zod 4: { theme: undefined } → { theme: "light" }    ← Default applied
```

 

This change makes behavior more predictable, but it can break code that checks for `undefined` to detect "not provided".

Another `.default()` change: the default value must now match the **output** type, not the input type. In Zod 3, `.default()` would parse the default value through the schema. In Zod 4, it short-circuits and returns the default directly:  

```
// Zod 3 — default matched INPUT type and was parsed
const schema = z.string()
  .transform(val => val.length)
  .default("tuna");  // string input, parsed → 4
schema.parse(undefined); // => 4

// Zod 4 — default matches OUTPUT type, no parsing
const schema = z.string()
  .transform(val => val.length)
  .default(0);  // number output, returned directly
schema.parse(undefined); // => 0
```

 

To replicate the old "pre-parse default" behavior, Zod 4 introduces `.prefault()`:  

```
// ✅ Zod 4 — .prefault() for old .default() behavior
const schema = z.string()
  .transform(val => val.length)
  .prefault("tuna");  // string gets parsed through transform
schema.parse(undefined); // => 4
```

 

## [](#breaking-change-5-typescript-strict-mode-required)Breaking Change #5: TypeScript Strict Mode Required

Zod 4 requires `strict: true` in your `tsconfig.json`. If you're running in non-strict mode, you'll get type errors:  

```
{
  "compilerOptions": {
    "strict": true,  // Required for Zod 4
    "target": "ES2022",
    "module": "ESNext"
  }
}
```

 

Specifically, Zod 4 relies on features enabled by strict mode: `strictNullChecks`, `strictFunctionTypes`, and `noImplicitThis`. If you can't enable full strict mode, you need at minimum:  

```
{
  "compilerOptions": {
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

 

Zod 4 is tested against TypeScript 5.5+. If you're on an older TS version, upgrade TypeScript first.

## [](#new-feature-zodmini)New Feature: [@zod](https://dev.to/zod)/mini

This is the sleeper hit of Zod 4. If you're building for edge runtimes, serverless functions, or any environment where bundle size matters, `@zod/mini` gives you Zod's core validation in a fraction of the size:  

```
import { z } from "@zod/mini";

// Same API, dramatically smaller bundle
const UserSchema = z.object({
  name: z.string().check(z.minLength(1)),
  email: z.string().check(z.email()),
  role: z.enum(["admin", "user", "viewer"]),
});

type User = z.infer<typeof UserSchema>;
```

 

Key differences from the full `zod` package:

| Feature | `zod` | `@zod/mini` |
| --- | --- | --- |
| Core bundle size | ~13KB gzipped | ~5.5KB gzipped |
| Tree-shakable | ✅ | ✅ (better) |
| `.transform()` | ✅ | ❌ |
| `.pipe()` | ✅ | ❌ |
| `.brand()` | ✅ | ❌ |
| `.refine()` / `.superRefine()` | ✅ | `.check()` only |
| JSON Schema generation | ✅ | ❌ |

The key API difference is refinements. Instead of `.refine()`, `@zod/mini` uses `.check()` which accepts format validators directly:  

```
// Full Zod
const email = z.string().email();
const short = z.string().min(1).max(100);

// @zod/mini
const email = z.string().check(z.email());
const short = z.string().check(z.minLength(1), z.maxLength(100));
```

 

Use `@zod/mini` when you need validation but not transformation. For API route handlers that just validate input shapes, it's a no-brainer. For complex pipelines with `.transform()` and `.pipe()`, stick with the full package.

## [](#new-feature-builtin-json-schema-conversion)New Feature: Built-in JSON Schema Conversion

No more installing `zod-to-json-schema`. Zod 4 ships with native JSON Schema generation:  

```
import { z } from "zod";

const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  email: z.email(),
  role: z.enum(["admin", "editor", "viewer"]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const jsonSchema = UserSchema.toJSONSchema();
console.log(JSON.stringify(jsonSchema, null, 2));
```

 

Output:  

```
{
  "type": "object",
  "properties": {
    "id": { "type": "integer", "exclusiveMinimum": 0 },
    "name": { "type": "string", "minLength": 1, "maxLength": 255 },
    "email": { "type": "string", "format": "email" },
    "role": { "type": "string", "enum": ["admin", "editor", "viewer"] },
    "metadata": {
      "type": "object",
      "additionalProperties": {}
    }
  },
  "required": ["id", "name", "email", "role"]
}
```

 

And the reverse direction works too:  

```
import { z } from "zod";

const schema = z.fromJSONSchema({
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "integer", minimum: 0 },
  },
  required: ["name"],
});
```

 

This is huge for interop with OpenAPI specs, JSON Schema-based form generators, and AI tool definitions (MCP, function calling) where you need to convert between Zod and JSON Schema regularly.

## [](#new-feature-schema-metadata)New Feature: Schema Metadata

Zod 4 introduces a strongly-typed metadata system for attaching arbitrary information to schemas:  

```
const NameSchema = z.string()
  .min(1)
  .max(100)
  .meta({
    label: "Full Name",
    placeholder: "John Doe",
    helpText: "Enter your legal name as shown on your ID.",
    fieldType: "text",
  });

// Access metadata
const meta = NameSchema.meta();
// → { label: "Full Name", placeholder: "John Doe", ... }
```

 

This enables powerful patterns like schema-driven form generation:  

```
function generateFormField(schema: z.ZodType) {
  const meta = schema.meta() ?? {};
  return {
    label: meta.label ?? "Untitled",
    type: meta.fieldType ?? "text",
    placeholder: meta.placeholder ?? "",
    helpText: meta.helpText ?? "",
    required: !schema.isOptional(),
  };
}

const formConfig = Object.entries(MyFormSchema.shape).map(
  ([name, schema]) => ({
    name,
    ...generateFormField(schema),
  })
);
```

 

Metadata is preserved through schema operations like `.optional()`, `.array()`, and `.transform()`, making it reliable for building declarative form systems on top of your validation schemas.

## [](#new-feature-internationalized-errors)New Feature: Internationalized Errors

Zod 4 ships with a locale system for translating validation error messages:  

```
import { z } from "zod";
import { es } from "@zod/locales/es";
import { ja } from "@zod/locales/ja";

// Set the locale globally
z.config({ locale: es });

const result = z.string().min(5).safeParse("hi");
// result.error.issues[0].message → "Debe tener al menos 5 caracteres"

// Or per-parse
const result2 = z.string().min(5).safeParse("hi", { locale: ja });
// result2.error.issues[0].message → "5文字以上である必要があります"
```

 

No more wrapping every schema with custom error maps just to support multiple languages. The locale system covers all built-in validations and can be extended with custom messages.

## [](#new-feature-template-literal-types)New Feature: Template Literal Types

Zod 4 introduces `z.templateLiteral()` for validating strings that follow a specific pattern:  

```
const hexColor = z.templateLiteral([
  z.literal("#"),
  z.string().regex(/^[0-9a-fA-F]{6}$/),
]);

hexColor.parse("#ff00aa");  // ✅
hexColor.parse("red");      // ❌

type HexColor = z.infer<typeof hexColor>;
// => `#${string}`
```

 

This is powerful for validating structured string formats like CSS values, semantic version strings, or API endpoint patterns, with full TypeScript type inference.

## [](#performance-benchmarks)Performance Benchmarks

The performance improvements in Zod 4 aren't incremental — they're transformational for large-scale applications:

| Operation | Zod 3 | Zod 4 | Improvement |
| --- | --- | --- | --- |
| String parse | 1.0x | **14x faster** | 1,300% |
| Array parse | 1.0x | **7x faster** | 600% |
| Object parse | 1.0x | **6.5x faster** | 550% |
| Bundle size (core) | ~31KB gzip | ~13KB gzip | **2.3x smaller** |
| TS type instantiations | 1.0x | **up to 10x fewer** | 900% |

The TypeScript compilation improvement is particularly impactful. In codebases with hundreds of Zod schemas (common in monorepos), the reduction in type instantiations can shave minutes off build times. One reported benchmark showed `tsc` dropping from **47 seconds to 5 seconds** after upgrading to Zod 4.

## [](#migration-strategy-the-safe-path)Migration Strategy: The Safe Path

Don't do a big-bang migration. Here's a phased approach:

### [](#phase-1-preparation-before-upgrading)Phase 1: Preparation (Before Upgrading)

1.  **Ensure TypeScript strict mode** is enabled
2.  **Run the codemod** in dry-run mode to see what changes:

```
npx @zod/codemod --transform v3-to-v4 --dry-run ./src
```

 

1.  **Audit custom error maps.** Search your codebase for `errorMap` — these need manual migration.
2.  **Check for `.optional().default()` patterns.** These behave differently in v4.
3.  **Verify your TypeScript version** is 5.5+

### [](#phase-2-apply-the-codemod)Phase 2: Apply the Codemod

```
# Install and run the codemod
npx @zod/codemod --transform v3-to-v4 ./src

# Check what changed
git diff --stat
```

 

The codemod handles:

-   `required_error` / `invalid_type_error` → unified `error` parameter
-   `z.string().email()` → `z.email()` (deprecated → top-level)
-   Import path updates

It does NOT handle:

-   Custom `errorMap` function signatures
-   `.default()` / `.prefault()` behavior changes
-   `z.coerce` input type narrowing issues
-   Test expectations that check specific error message formats

### [](#phase-3-manual-fixes)Phase 3: Manual Fixes

After the codemod, search for remaining issues:  

```
# Find remaining errorMap usage
grep -rn "errorMap" --include="*.ts" --include="*.tsx" ./src

# Find z.coerce patterns
grep -rn "z\.coerce\." --include="*.ts" --include="*.tsx" ./src

# Find .optional().default() or .default().optional() chains
grep -rn "\.optional()\.default\|\.default(.*).optional" --include="*.ts" --include="*.tsx" ./src
```

 

### [](#phase-4-test-and-validate)Phase 4: Test and Validate

Run your test suite. The most common failures will be:

1.  **Error message format changes**: Tests that assert specific error messages will fail because the default message format changed slightly.
2.  **Coercion input types**: `z.coerce.*` input types changed from specific types to `unknown`, which can surface new type errors.
3.  **Optional+default**: Any test that explicitly checks for `undefined` values on defaulted optional fields.

### [](#phase-5-adopt-new-features-optional)Phase 5: Adopt New Features (Optional)

Once the migration is stable, consider adopting new features incrementally:

-   Replace `zod-to-json-schema` with `.toJSONSchema()`
-   Add metadata to schemas using `z.registry()`
-   Switch validation-only schemas to `@zod/mini` for smaller bundles
-   Use `z.templateLiteral()` for structured string validation

## [](#common-gotchas)Common Gotchas

### [](#gotcha-1-peer-dependencies)Gotcha 1: peer dependencies

Libraries that depend on Zod 3 (like older versions of tRPC, react-hook-form adapters, etc.) may not accept Zod 4 as a peer dependency. Check compatibility before upgrading:  

```
# Check which packages depend on zod
npm ls zod
```

 

As of March 2026, most major libraries have Zod 4 support: tRPC v11+, @tanstack/react-form, Conform, react-hook-form v8 with `@hookform/resolvers` v4+.

### [](#gotcha-2-zinfer-still-works-but-zinput-and-zoutput-changed)Gotcha 2: z.infer still works, but z.input and z.output changed

The type helper `z.infer<typeof schema>` is unchanged. But if you were using `z.input<typeof schema>` or `z.output<typeof schema>`, the behavior around defaults and transforms may produce different types in v4.

### [](#gotcha-3-discriminated-unions)Gotcha 3: Discriminated unions

`z.discriminatedUnion()` still works but is now optimized internally. If you were relying on the error structure of discriminated union failures (checking specific issue codes), the error details may differ.

### [](#gotcha-4-passthrough-strict-and-strip-are-deprecated)Gotcha 4: .passthrough(), .strict(), and .strip() are deprecated

Object schemas in Zod 4 still default to stripping unknown keys, but `.passthrough()`, `.strict()`, and `.strip()` are all **deprecated**. Zod 4 wants you to use `.catchall()` for explicit unknown-key handling instead:  

```
// ❌ Deprecated in Zod 4
const loose = z.object({ name: z.string() }).passthrough();
const strict = z.object({ name: z.string() }).strict();

// ✅ Zod 4 recommended
const loose = z.object({ name: z.string() }).catchall(z.unknown());
const strict = z.object({ name: z.string() }).catchall(z.never());
```

 

If you use these methods extensively, you'll see deprecation warnings. Plan to migrate them.

## [](#should-you-upgrade-now)Should You Upgrade Now?

**Yes, if:**

-   You're starting a new project (use Zod 4 from day 1)
-   Your build times are suffering from heavy Zod schema usage
-   You deploy to edge/serverless and need smaller bundles
-   You need JSON Schema interop

**Wait, if:**

-   Critical dependencies still require Zod 3 (check `npm ls zod`)
-   You have hundreds of schemas with complex custom `errorMap` functions
-   Your team doesn't have bandwidth for the migration right now

The performance gains alone justify the upgrade for most projects. The TypeScript compilation speed improvement is transformational for large codebases, and the bundle size reduction matters increasingly as more code runs on edge runtimes.

## [](#conclusion)Conclusion

Zod 4 is the most impactful update to TypeScript validation since Zod itself launched. The breaking changes are real, but they're not arbitrary — every one of them exists to make Zod faster, smaller, and more TypeScript-native.

The migration path is clear: run the codemod, fix the manual cases, test, ship. Most projects can complete the migration in a day. And once you're on v4, you get access to `@zod/mini`, native JSON Schema generation, the metadata system, template literal types, and internationalized errors — features that previously required piling on third-party dependencies.

Start with `npx @zod/codemod --transform v3-to-v4 --dry-run ./src`. See how much it catches. The rest is just grep and fix.

---

> 💡 **Note:** This article was originally published on the [Pockit Blog](https://pockit.tools/blog/zod-v4-migration-guide-breaking-changes-new-features/).
> 
> Check out [Pockit.tools](https://pockit.tools/json-formatter/) for 60+ free developer utilities. For faster access, **[add it to Chrome](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** and use JSON Formatter & Diff Checker directly from your toolbar.
