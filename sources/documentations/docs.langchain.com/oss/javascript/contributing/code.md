---
title: "Contributing to code - Docs by LangChain"
source_url: "https://docs.langchain.com/oss/javascript/contributing/code"
crawled_at: "2026-06-17T14:55:02.142Z"
---

Code contributions are welcome! Whether you’re fixing bugs, adding features, or improving performance, your contributions help deliver a better developer experience for thousands of developers.

## Getting started

If you are looking for something to work on, check out the issue labeled “help wanted” in our repos:

### Quick fix: submit a bugfix

For simple bugfixes, you can get started immediately:

1

2

3

4

5

6

7

8

9

10

### Full development setup

For ongoing development or larger contributions:

1.  Review our [contribution guidelines](#contribution-guidelines) for features, bugfixes, and integrations
2.  Set up your environment following our [setup guide](#development-environment) below
3.  Understand the [repository structure](#repository-structure) and package organization
4.  Learn our [development workflow](#development-workflow) including testing and linting

---

## Contribution guidelines

Before you start contributing to LangChain projects, take a moment to think about why you want to. If your only goal is to add a “first contribution” to your resume (or if you’re just looking for a quick win) you might be better off doing a boot-camp or an online tutorial. Contributing to open source projects takes time and effort, but it can also help you become a better developer and learn new skills. However, it’s important to know that it might be harder and slower than following a training course. That said, contributing to open source is worth it if you’re willing to take the time to do things well!

### Backwards compatibility

Maintain compatibility via:

### New features

We aim to keep the bar high for new features. We generally don’t accept new core abstractions from outside contributors without an existing issue that demonstrates an acute need for them. This also applies to changes to infrastructure and dependencies. In general, feature contribution requirements include:

1

2

3

### Security guidelines

Security checklist:

---

## Development environment

Once you’ve reviewed the [contribution guidelines](#contribution-guidelines), find the package directory for the component you’re working on in the [repository structure](#repository-structure) section below.

---

## Repository structure

-   LangChain
    
-   LangGraph
    
-   Deep Agents
    

LangChain is organized as a monorepo with multiple packages:

LangGraph is organized as a monorepo with multiple Python packages:

Deep Agents is organized as a monorepo with multiple Python packages:

---

## Development workflow

### Pre-commit hooks

### Running tests

We favor unit tests over integration tests when possible. Unit tests run on every pull request, so they should be fast and reliable. Integration tests run on a schedule and require more setup, so they should be reserved for confirming interface points with external services.

#### Unit tests

**Location**: `src/tests/FILENAME_BEING_TESTED.test.ts` Unit tests cover modular logic that does not require calls to outside APIs. If you add new logic, you should add a unit test. In unit tests, check pre/post processing and mock external dependencies. **Requirements**:

-   No network calls allowed
-   Test all code paths including edge cases
-   Use mocks for external dependencies

To run unit tests:

```
# Run the entire test suite
pnpm test

# Or run a specific test file
pnpm test src/tests/FILENAME_BEING_TESTED.test.ts

# Or run a specific test function
pnpm test -t "the test that should be run"
```

#### Integration tests

**Location**: `src/tests/FILENAME_BEING_TESTED.int.test.ts` Integration tests cover logic that requires making calls to outside APIs (often integration with other services). Integration tests require access to external services/provider APIs (which can cost money) and therefore are not run by default. Not every code change will require an integration test, but keep in mind that we’ll require/run integration tests separately as part of our review process. **Requirements**:

-   Test real integrations with external services
-   Use environment variables for API keys
-   Skip gracefully if credentials unavailable

To run integration tests:

```
pnpm test:int
```

### Code quality standards

Contributions must adhere to the following quality requirements:

-   Type hints
    
-   Documentation
    
-   Code style
    

**Required**: Complete types for all functions

```
function processDocuments(
    docs: Document[],
    processor: DocumentProcessor,
    batchSize: number = 100
): ProcessingResult {
    // ...
}
```

**Required**: [JSDocs](https://jsdoc.app/about-getting-started) for all exported functions and interfaces

```
/**
 * Document processing instance.
 */
interface FooDocumentProcessor {
    /**
     * Process documents in batches.
     *
     * @param docs - List of documents to process.
     * @returns Processing results with success/failure counts.
     */
    process(docs: Document[]): ProcessingResult;
}

/**
 * Process documents in batches.
 *
 * @param docs - List of documents to process.
 * @param processor - Document processing instance.
 * @param batchSize - Number of documents per batch.
 * @returns Processing results with success/failure counts.
 */
export function processDocuments(
    docs: Document[],
    processor: DocumentProcessor,
    batchSize: number = 100
): ProcessingResult {
    // ...
}
```

**Automated**: Formatting and linting:

```
pnpm lint    # Check style and types
pnpm format  # Apply formatting
```

**Standards**:

-   Descriptive variable names
-   Break up complex functions (aim for fewer than 20 lines)
-   Follow existing patterns in the codebase

---

### Test writing guidelines

In order to write effective tests, there’s a few good practices to follow:

-   Encapsulate the test in a `describe` block that describes the component being tested
-   Use natural language to describe the test name
-   Be exhaustive with assertions
-   Only use snapshots for reasonably sized data objects

-   Unit tests
    
-   Integration tests
    
-   Mock usage
    

```
describe("DocumentProcessor", () => {
    it("Should handle empty document list", () => {
        const processor = new DocumentProcessor();
        const result = processor.process([]);

        expect(result.success).toBe(true);
        expect(result.processedCount).toBe(0);
        expect(result.errors).toHaveLength(0);
    });
});
```

```
describe("ChatOpenAI", () => {
    it("Should test with real API", () => {
        const chat = new ChatOpenAI();
        const response = chat.invoke("Hello");
    });
});
```

```
describe("APIService", () => {
    it("Should call with retry", () => {
        const mockClient = new MockClient();
        const service = new APIService(client: mockClient);
        const result = service.callWithRetry();
    });
});
```

### Submitting your PR

Once your tests pass and code meets quality standards:

1.  Push your branch and open a pull request
2.  Follow the provided PR template
3.  Reference related issues using a [closing keyword](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword) (e.g., `Fixes #123`)
4.  Wait for CI checks to complete

## Getting help

Our goal is to have the most accessible developer setup possible. Should you experience any difficulty getting setup, please ask in the [community slack](https://www.langchain.com/join-community) or open a [forum post](https://forum.langchain.com/).

---
