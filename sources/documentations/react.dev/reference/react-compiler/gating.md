---
title: "gating – React"
source_url: "https://react.dev/reference/react-compiler/gating"
crawled_at: "2026-07-28T04:06:51.929Z"
---

The `gating` option enables conditional compilation, allowing you to control when optimized code is used at runtime.

```
{
  gating: {
    source: 'my-feature-flags',
importSpecifierName: 'shouldUseCompiler'
}
}
```

-   [Reference](#reference)
    -   [`gating`](#gating)
-   [Usage](#usage)
    -   [Basic feature flag setup](#basic-setup)
-   [Troubleshooting](#troubleshooting)
    -   [Feature flag not working](#flag-not-working)
    -   [Import errors](#import-errors)

---

## Reference[](#reference "Link for Reference ")

### `gating`[](#gating "Link for this heading")

Configures runtime feature flag gating for compiled functions.

#### Type[](#type "Link for Type ")

```
{
  source: string;
  importSpecifierName: string;
} | null
```

#### Default value[](#default-value "Link for Default value ")

`null`

#### Properties[](#properties "Link for Properties ")

-   **`source`**: Module path to import the feature flag from
-   **`importSpecifierName`**: Name of the exported function to import

#### Caveats[](#caveats "Link for Caveats ")

-   The gating function must return a boolean
-   Both compiled and original versions increase bundle size
-   The import is added to every file with compiled functions

---

## Usage[](#usage "Link for Usage ")

### Basic feature flag setup[](#basic-setup "Link for Basic feature flag setup ")

1.  Create a feature flag module:

```
// src/utils/feature-flags.js
export function shouldUseCompiler() {
// your logic here
return getFeatureFlag('react-compiler-enabled');
}
```

2.  Configure the compiler:

```
{
  gating: {
    source: './src/utils/feature-flags',
importSpecifierName: 'shouldUseCompiler'
}
}
```

3.  The compiler generates gated code:

```
// Input
function Button(props) {
return <button>{props.label}</button>;
}
// Output (simplified)
import { shouldUseCompiler } from './src/utils/feature-flags';
const Button = shouldUseCompiler()
  ? function Button_optimized(props) { /* compiled version */ }
  : function Button_original(props) { /* original version */ };
```

Note that the gating function is evaluated once at module time, so once the JS bundle has been parsed and evaluated the choice of component stays static for the rest of the browser session.

---

## Troubleshooting[](#troubleshooting "Link for Troubleshooting ")

### Feature flag not working[](#flag-not-working "Link for Feature flag not working ")

Verify your flag module exports the correct function:

```
// ❌ Wrong: Default export
export default function shouldUseCompiler() {
return true;
}
// ✅ Correct: Named export matching importSpecifierName
export function shouldUseCompiler() {
return true;
}
```

### Import errors[](#import-errors "Link for Import errors ")

Ensure the source path is correct:

```
// ❌ Wrong: Relative to babel.config.js
{
  source: './src/flags',
importSpecifierName: 'flag'
}
// ✅ Correct: Module resolution path
{
  source: '@myapp/feature-flags',
importSpecifierName: 'flag'
}
// ✅ Also correct: Absolute path from project root
{
  source: './src/utils/flags',
importSpecifierName: 'flag'
}
```
