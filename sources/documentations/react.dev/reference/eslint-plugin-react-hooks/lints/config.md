---
title: "config – React"
source_url: "https://react.dev/reference/eslint-plugin-react-hooks/lints/config"
crawled_at: "2026-07-28T04:07:26.585Z"
---

Validates the compiler [configuration options](https://react.dev/reference/react-compiler/configuration).

## Rule Details[](#rule-details "Link for Rule Details ")

React Compiler accepts various [configuration options](https://react.dev/reference/react-compiler/configuration) to control its behavior. This rule validates that your configuration uses correct option names and value types, preventing silent failures from typos or incorrect settings.

### Invalid[](#invalid "Link for Invalid ")

Examples of incorrect code for this rule:

```
// ❌ Unknown option name
module.exports = {
plugins: [
['babel-plugin-react-compiler', {
compileMode: 'all' // Typo: should be compilationMode
}]
]
};
// ❌ Invalid option value
module.exports = {
plugins: [
['babel-plugin-react-compiler', {
compilationMode: 'everything' // Invalid: use 'all' or 'infer'
}]
]
};
```

### Valid[](#valid "Link for Valid ")

Examples of correct code for this rule:

```
// ✅ Valid compiler configuration
module.exports = {
plugins: [
['babel-plugin-react-compiler', {
compilationMode: 'infer',
panicThreshold: 'critical_errors'
}]
]
};
```

## Troubleshooting[](#troubleshooting "Link for Troubleshooting ")

### Configuration not working as expected[](#config-not-working "Link for Configuration not working as expected ")

Your compiler configuration might have typos or incorrect values:

```
// ❌ Wrong: Common configuration mistakes
module.exports = {
plugins: [
['babel-plugin-react-compiler', {
// Typo in option name
compilationMod: 'all',
// Wrong value type
panicThreshold: true,
// Unknown option
optimizationLevel: 'max'
}]
]
};
```

Check the [configuration documentation](https://react.dev/reference/react-compiler/configuration) for valid options:

```
// ✅ Better: Valid configuration
module.exports = {
plugins: [
['babel-plugin-react-compiler', {
compilationMode: 'all', // or 'infer'
panicThreshold: 'none', // or 'critical_errors', 'all_errors'
// Only use documented options
}]
]
};
```
