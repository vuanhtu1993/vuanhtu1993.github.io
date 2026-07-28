---
title: "Configuration – React"
source_url: "https://react.dev/reference/react-compiler/configuration"
crawled_at: "2026-07-28T04:06:46.916Z"
---

This page lists all configuration options available in React Compiler.

### Note

For most apps, the default options should work out of the box. If you have a special need, you can use these advanced options.

```
// babel.config.js
module.exports = {
plugins: [
[
'babel-plugin-react-compiler', {
// compiler options
}
]
]
};
```

---

## Compilation Control[](#compilation-control "Link for Compilation Control ")

These options control _what_ the compiler optimizes and _how_ it selects components and hooks to compile.

-   [`compilationMode`](https://react.dev/reference/react-compiler/compilationMode) controls the strategy for selecting functions to compile (e.g., all functions, only annotated ones, or intelligent detection).

```
{
  compilationMode: 'annotation' // Only compile "use memo" functions
}
```

---

## Version Compatibility[](#version-compatibility "Link for Version Compatibility ")

React version configuration ensures the compiler generates code compatible with your React version.

[`target`](https://react.dev/reference/react-compiler/target) specifies which React version you’re using (17, 18, or 19).

```
// For React 18 projects
{
  target: '18' // Also requires react-compiler-runtime package
}
```

---

## Error Handling[](#error-handling "Link for Error Handling ")

These options control how the compiler responds to code that doesn’t follow the [Rules of React](https://react.dev/reference/rules).

[`panicThreshold`](https://react.dev/reference/react-compiler/panicThreshold) determines whether to fail the build or skip problematic components.

```
// Recommended for production
{
  panicThreshold: 'none' // Skip components with errors instead of failing the build
}
```

---

## Debugging[](#debugging "Link for Debugging ")

Logging and analysis options help you understand what the compiler is doing.

[`logger`](https://react.dev/reference/react-compiler/logger) provides custom logging for compilation events.

```
{
  logger: {
logEvent(filename, event) {
if (event.kind === 'CompileSuccess') {
console.log('Compiled:', filename);
}
}
}
}
```

---

## Feature Flags[](#feature-flags "Link for Feature Flags ")

Conditional compilation lets you control when optimized code is used.

[`gating`](https://react.dev/reference/react-compiler/gating) enables runtime feature flags for A/B testing or gradual rollouts.

```
{
  gating: {
    source: 'my-feature-flags',
importSpecifierName: 'isCompilerEnabled'
}
}
```

---

## Common Configuration Patterns[](#common-patterns "Link for Common Configuration Patterns ")

### Default configuration[](#default-configuration "Link for Default configuration ")

For most React 19 applications, the compiler works without configuration:

```
// babel.config.js
module.exports = {
plugins: [
'babel-plugin-react-compiler'
]
};
```

### React 17/18 projects[](#react-17-18 "Link for React 17/18 projects ")

Older React versions need the runtime package and target configuration:

```
npm install react-compiler-runtime@latest
```

```
{
  target: '18' // or '17'
}
```

### Incremental adoption[](#incremental-adoption "Link for Incremental adoption ")

Start with specific directories and expand gradually:

```
{
  compilationMode: 'annotation' // Only compile "use memo" functions
}
```
