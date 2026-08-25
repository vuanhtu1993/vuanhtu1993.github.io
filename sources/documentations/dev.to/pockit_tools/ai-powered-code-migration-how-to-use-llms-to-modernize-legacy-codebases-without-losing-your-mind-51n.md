---
title: "AI-Powered Code Migration: How to Use LLMs to Modernize Legacy Codebases Without Losing Your Mind"
source_url: "https://dev.to/pockit_tools/ai-powered-code-migration-how-to-use-llms-to-modernize-legacy-codebases-without-losing-your-mind-51n"
crawled_at: "2026-08-07T09:30:28.819Z"
---

Your CTO just announced that you're migrating 200,000 lines of AngularJS to React. The timeline is six months. Half the team has never touched AngularJS. Someone in the meeting says, "Can't we just use AI for this?" and suddenly everyone is looking at you.

This is happening at thousands of companies right now. Legacy codebases — AngularJS, jQuery, Java 8, Python 2, COBOL, even old PHP — need to be modernized. The traditional approach (manual rewrite) takes years and kills morale. The new approach (throw it at an LLM and pray) sounds great until you realize your AI just invented three new bugs for every one it fixed.

The truth is somewhere in between. LLMs can dramatically accelerate code migration, but only if you build the right pipeline around them. This guide is about building that pipeline: what works, what doesn't, and how to avoid the mistakes that turn an AI migration project into a worse disaster than the legacy code itself.

## [](#why-code-migration-is-an-ideal-llm-use-case-and-why-its-harder-than-you-think)Why Code Migration Is an Ideal LLM Use Case (and Why It's Harder Than You Think)

Code migration has properties that make it uniquely suited to LLMs:

1.  **Pattern-heavy**: Most migrations involve repeating the same transformation pattern across hundreds of files. AngularJS controllers follow a template. Java POJOs follow a template. LLMs excel at pattern recognition and application.
2.  **Well-defined input/output**: You have a clear "before" (old framework) and "after" (new framework). The transformation rules are knowable.
3.  **Verifiable**: Unlike creative writing or summarization, code migration has a hard correctness check — does the output compile? Do the tests pass?

But there are fundamental challenges that most "just use ChatGPT" approaches miss:

### [](#the-context-window-problem)The Context Window Problem

A real-world AngularJS controller doesn't exist in isolation. It imports services that import other services. It references templates that reference directives. It relies on scope inheritance chains that span multiple files. An LLM that sees only the controller file will produce syntactically correct React code that is semantically wrong.  

```
┌─────────────────────────────────────────────────────────────┐
│                    The Migration Iceberg                      │
│                                                              │
│                     ┌──────────────┐                         │
│                     │  Controller  │  ← LLM sees this        │
│                     │  (1 file)    │                         │
│            ─────────┴──────────────┴─────────                │
│           /                                  \               │
│          /  ┌──────────┐ ┌──────────┐         \              │
│         /   │ Services │ │Templates│          \             │
│        /    │ (12 dep) │ │ (3 HTML)│           \            │
│       /     └──────────┘ └──────────┘            \           │
│      /  ┌──────────┐ ┌──────────┐ ┌──────────┐   \          │
│     /   │  Scope   │ │  Route   │ │  Global  │    \         │
│    /    │  Chain   │ │  Config  │ │  State   │     \        │
│   /     └──────────┘ └──────────┘ └──────────┘      \       │
│  └───────────────────────────────────────────────────┘       │
│                                                              │
│         ← LLM needs ALL of this for correct migration        │
└─────────────────────────────────────────────────────────────┘
```

 

### [](#the-semantic-gap)The Semantic Gap

Code migration isn't just syntax transformation. It's paradigm translation. AngularJS uses two-way data binding with `$scope`. React uses one-way data flow with hooks. There's no 1:1 mapping. An LLM that mechanically converts `$scope.name` to `useState('name')` will produce code that compiles but behaves differently under edge cases — race conditions in form updates, delayed watchers, digest cycle timing.

### [](#the-8020-rule-of-ai-migration)The 80/20 Rule of AI Migration

In practice, LLMs handle about 80% of migration work well — the boring, repetitive transformations. The remaining 20% — complex business logic, framework-specific edge cases, cross-cutting concerns — requires human judgment. Your pipeline needs to be designed around this reality.

## [](#the-architecture-an-astaware-migration-pipeline)The Architecture: An AST-Aware Migration Pipeline

The naive approach — paste file into ChatGPT, get output — doesn't scale. Here's what actually works for production migrations:  

```
┌─────────────────────────────────────────────────────────────┐
│                  AI Migration Pipeline                        │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│  │ 1. Parse │───▶│ 2. Chunk │───▶│ 3. Enrich│               │
│  │   (AST)  │    │ (Split)  │    │ (Context)│               │
│  └──────────┘    └──────────┘    └──────────┘               │
│       │                               │                      │
│       ▼                               ▼                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│  │ 6. Test  │◀───│ 5. Post- │◀───│ 4. LLM   │               │
│  │ (Verify) │    │  Process │    │Transform │               │
│  └──────────┘    └──────────┘    └──────────┘               │
│       │                                                      │
│       ▼                                                      │
│  ┌──────────┐                                                │
│  │ 7. Human │    Confidence < 90%? → Flag for human review   │
│  │  Review  │                                                │
│  └──────────┘                                                │
└─────────────────────────────────────────────────────────────┘
```

 

Let's walk through each step.

### [](#step-1-parse-into-ast)Step 1: Parse into AST

Don't feed raw source code to the LLM. Parse it into an Abstract Syntax Tree first. This gives you structural awareness that raw text doesn't provide.  

```
// Using ts-morph for TypeScript/JavaScript migration
import { Project, SyntaxKind } from 'ts-morph';

interface MigrationUnit {
  filePath: string;
  type: 'component' | 'service' | 'directive' | 'filter' | 'config';
  className: string;
  dependencies: string[];
  templatePath?: string;
  sourceCode: string;
  ast: any;
  complexity: number;
}

function parseAngularModule(filePath: string): MigrationUnit[] {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);
  const units: MigrationUnit[] = [];

  // Find all Angular component definitions
  sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
    const expr = call.getExpression().getText();

    if (expr.includes('.component') || expr.includes('.controller')) {
      const args = call.getArguments();
      const name = args[0]?.getText().replace(/['"]/g, '');

      // Extract dependency injection array
      const deps = extractDependencies(call);

      // Calculate cyclomatic complexity
      const complexity = calculateComplexity(call);

      units.push({
        filePath,
        type: expr.includes('.component') ? 'component' : 'service',
        className: name,
        dependencies: deps,
        sourceCode: call.getFullText(),
        ast: call.getStructure(),
        complexity,
      });
    }
  });

  return units;
}

function calculateComplexity(node: any): number {
  let complexity = 1;
  node.getDescendantsOfKind(SyntaxKind.IfStatement).forEach(() => complexity++);
  node.getDescendantsOfKind(SyntaxKind.SwitchStatement).forEach(() => complexity++);
  node.getDescendantsOfKind(SyntaxKind.ForStatement).forEach(() => complexity++);
  node.getDescendantsOfKind(SyntaxKind.WhileStatement).forEach(() => complexity++);
  node.getDescendantsOfKind(SyntaxKind.ConditionalExpression).forEach(() => complexity++);
  return complexity;
}
```

 

Why AST-first? Because it lets you:

-   **Prioritize**: Migrate low-complexity files first (higher LLM success rate)
-   **Chunk intelligently**: Split large files at function/class boundaries, not arbitrary line counts
-   **Track dependencies**: Know which files need to be migrated together
-   **Validate output**: Compare the AST structure of input and output to catch structural regressions

### [](#step-2-chunk-by-migration-unit)Step 2: Chunk by Migration Unit

Don't migrate entire files. Migrate logical units — one component, one service, one utility function at a time. This keeps each LLM call focused and within context window limits.  

```
interface MigrationBatch {
  primary: MigrationUnit;
  dependencies: MigrationUnit[];
  templates: string[];
  totalTokens: number;
}

function createBatches(
  units: MigrationUnit[],
  maxTokens: number = 12000
): MigrationBatch[] {
  // Sort by complexity (low to high for better LLM success rate)
  const sorted = units.sort((a, b) => a.complexity - b.complexity);

  return sorted.map(unit => {
    const deps = unit.dependencies
      .map(dep => units.find(u => u.className === dep))
      .filter(Boolean) as MigrationUnit[];

    // Include type signatures of dependencies (not full source)
    const depContext = deps.map(d => extractTypeSignature(d));

    const totalTokens = estimateTokens(
      unit.sourceCode + depContext.join('\n')
    );

    return {
      primary: unit,
      dependencies: deps,
      templates: unit.templatePath
        ? [readFileSync(unit.templatePath, 'utf-8')]
        : [],
      totalTokens,
    };
  });
}

function extractTypeSignature(unit: MigrationUnit): string {
  // Only include public API surface, not implementation
  // This dramatically reduces token usage
  return `// Dependency: ${unit.className}\n` +
    `// Type: ${unit.type}\n` +
    `// Public methods: ${extractPublicMethods(unit).join(', ')}`;
}
```

 

### [](#step-3-enrich-with-context)Step 3: Enrich with Context

This is where most AI migration attempts fail. The LLM needs context beyond the file being migrated:  

```
interface MigrationContext {
  batch: MigrationBatch;

  // Framework-specific context
  targetFramework: {
    version: string;
    stateManagement: string; // 'zustand' | 'redux' | 'context'
    styling: string;        // 'tailwind' | 'css-modules' | 'styled-components'
    routing: string;        // 'react-router' | 'next'
  };

  // Project conventions
  conventions: {
    fileNaming: string;     // 'kebab-case' | 'PascalCase'
    exportStyle: string;    // 'named' | 'default'
    hookPrefix: string;     // 'use'
    testFramework: string;  // 'vitest' | 'jest'
  };

  // Already-migrated examples (few-shot learning)
  examples: {
    before: string;
    after: string;
    explanation: string;
  }[];

  // Known patterns that need special handling
  edgeCases: string[];
}
```

 

The `examples` field is critical. Once you manually migrate 3-5 representative components, include them as few-shot examples in every LLM call. This dramatically improves output quality because the model learns your specific conventions.

### [](#step-4-llm-transformation)Step 4: LLM Transformation

Now we get to the actual LLM call. The prompt structure matters enormously:  

```
function buildMigrationPrompt(context: MigrationContext): string {
  return `You are a senior software engineer performing a code migration.

## Source Framework
- AngularJS 1.8 with JavaScript
- Two-way data binding via $scope
- Dependency injection via string annotations

## Target Framework
- React 19 with TypeScript
- State management: ${context.targetFramework.stateManagement}
- Styling: ${context.targetFramework.styling}
- Routing: ${context.targetFramework.routing}

## Project Conventions
- File naming: ${context.conventions.fileNaming}
- Export style: ${context.conventions.exportStyle}
- Test framework: ${context.conventions.testFramework}

## Migration Rules
1. Convert $scope properties to useState/useReducer hooks
2. Convert $scope.$watch to useEffect
3. Convert $scope.$on/$emit to custom hooks or context
4. Convert services to custom hooks or utility modules
5. Convert ng-repeat to .map() with proper keys
6. Convert ng-if/ng-show to conditional rendering
7. Convert $http calls to fetch/axios with proper error handling
8. Preserve ALL business logic exactly — do not simplify or optimize
9. Add TypeScript types for all props, state, and function signatures
10. Do NOT add comments like "// migrated from Angular" or "// TODO"

## Examples of Completed Migrations
${context.examples.map(ex => `
### Before (AngularJS):
\`\`\`javascript
${ex.before}
\`\`\`

### After (React + TypeScript):
\`\`\`typescript
${ex.after}
\`\`\`

### Key decisions: ${ex.explanation}
`).join('\n')}

## Known Edge Cases
${context.edgeCases.map(ec => `- ${ec}`).join('\n')}

## Dependencies Available
${context.batch.dependencies.map(d =>
  `- ${d.className} (${d.type}): Available as imported module`
).join('\n')}

## Source Code to Migrate
\`\`\`javascript
${context.batch.primary.sourceCode}
\`\`\`

${context.batch.templates.length > 0 ? `
## Associated Template
\`\`\`html
${context.batch.templates[0]}
\`\`\`
` : ''}

Migrate this code to React + TypeScript following all conventions above.
Output ONLY the migrated code, no explanations.`;
}
```

 

Key prompt engineering decisions:

-   **Rule 8 is the most important**: "Preserve ALL business logic exactly." LLMs love to "improve" code during migration. You don't want that. Migration and refactoring are separate phases.
-   **Few-shot examples**: Include 2-3 real migrations from your project. This is worth more than any amount of instruction text.
-   **Dependency context**: Include type signatures of dependencies so the LLM knows what's available without wasting tokens on implementation details.
-   **No comments rule**: LLMs add self-referential comments ("migrated from Angular") that pollute the codebase.

### [](#step-5-postprocess-the-output)Step 5: Post-Process the Output

Don't trust raw LLM output. Post-process it:  

```
async function postProcess(
  llmOutput: string,
  context: MigrationContext
): Promise<{
  code: string;
  confidence: number;
  issues: string[];
}> {
  const issues: string[] = [];
  let confidence = 100;

  // 1. Parse to verify syntax
  try {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile('output.tsx', llmOutput);

    // 2. Check for TypeScript errors
    const diagnostics = sourceFile.getPreEmitDiagnostics();
    if (diagnostics.length > 0) {
      confidence -= diagnostics.length * 10;
      issues.push(
        ...diagnostics.map(d => `TS Error: ${d.getMessageText()}`)
      );
    }

    // 3. Verify all imports resolve
    const imports = sourceFile.getImportDeclarations();
    for (const imp of imports) {
      const moduleSpecifier = imp.getModuleSpecifierValue();
      if (!isValidImport(moduleSpecifier, context)) {
        confidence -= 15;
        issues.push(`Unresolved import: ${moduleSpecifier}`);
      }
    }

    // 4. Check for LLM hallucinations
    const text = sourceFile.getFullText();
    if (text.includes('// TODO') || text.includes('// FIXME')) {
      confidence -= 5;
      issues.push('LLM added TODO/FIXME comments');
    }

    // 5. Verify hook rules
    const hookViolations = checkHookRules(sourceFile);
    if (hookViolations.length > 0) {
      confidence -= hookViolations.length * 20;
      issues.push(...hookViolations);
    }

    // 6. Business logic preservation check
    const originalFunctions = extractFunctionNames(
      context.batch.primary.sourceCode
    );
    const migratedFunctions = extractFunctionNames(llmOutput);
    const missing = originalFunctions.filter(
      f => !migratedFunctions.some(m => isSimilarName(f, m))
    );
    if (missing.length > 0) {
      confidence -= missing.length * 15;
      issues.push(`Missing functions: ${missing.join(', ')}`);
    }

    return { code: llmOutput, confidence, issues };

  } catch (e) {
    return {
      code: llmOutput,
      confidence: 0,
      issues: [`Parse error: ${e.message}`],
    };
  }
}
```

 

### [](#step-6-automated-testing)Step 6: Automated Testing

The most critical step. No migration should be committed without automated verification:  

```
async function verifyMigration(
  originalPath: string,
  migratedPath: string,
  testSuite: string
): Promise<MigrationVerification> {
  const results: MigrationVerification = {
    compiles: false,
    testsPass: false,
    renderMatches: false,
    accessibilityPass: false,
    performanceRegression: false,
  };

  // 1. TypeScript compilation
  const compileResult = await exec(`npx tsc --noEmit ${migratedPath}`);
  results.compiles = compileResult.exitCode === 0;

  // 2. Run existing tests (if they exist)
  if (testSuite) {
    const testResult = await exec(`npx vitest run ${testSuite}`);
    results.testsPass = testResult.exitCode === 0;
  }

  // 3. Visual regression testing (optional but valuable)
  // Compare screenshots of old vs new component
  results.renderMatches = await compareScreenshots(
    originalPath,
    migratedPath
  );

  return results;
}
```

 

### [](#step-7-human-review-with-confidence-scoring)Step 7: Human Review with Confidence Scoring

Not every migrated file needs the same level of human attention:  

```
function triageMigration(
  result: PostProcessResult,
  verification: MigrationVerification
): 'auto-merge' | 'quick-review' | 'deep-review' | 'manual-rewrite' {
  // High confidence + all tests pass → auto-merge
  if (result.confidence >= 95 && verification.testsPass
      && verification.compiles) {
    return 'auto-merge';
  }

  // High confidence but minor issues → quick review
  if (result.confidence >= 80 && verification.compiles) {
    return 'quick-review';
  }

  // Medium confidence → needs careful review
  if (result.confidence >= 50) {
    return 'deep-review';
  }

  // Low confidence → don't bother reviewing, rewrite manually
  return 'manual-rewrite';
}
```

 

In practice, for a well-structured AngularJS-to-React migration with good few-shot examples:

-   **~60% of files**: Auto-merge or quick review
-   **~25% of files**: Deep review (mostly around complex state management)
-   **~15% of files**: Manual rewrite (complex $scope inheritance, digest cycle hacks)

## [](#realworld-migration-patterns)Real-World Migration Patterns

Let's look at specific migration patterns and how to handle them with LLMs.

### [](#pattern-1-angularjs-%E2%86%92-react)Pattern 1: AngularJS → React

The most common enterprise migration right now.  

```
// ❌ BEFORE: AngularJS Controller
angular.module('app').controller('UserListCtrl',
  ['$scope', '$http', 'UserService', 'NotificationService',
  function($scope, $http, UserService, NotificationService) {

    $scope.users = [];
    $scope.loading = true;
    $scope.searchTerm = '';
    $scope.selectedRole = 'all';

    $scope.loadUsers = function() {
      $scope.loading = true;
      UserService.getAll({ role: $scope.selectedRole })
        .then(function(users) {
          $scope.users = users;
          $scope.loading = false;
        })
        .catch(function(err) {
          NotificationService.error('Failed to load users');
          $scope.loading = false;
        });
    };

    $scope.filteredUsers = function() {
      if (!$scope.searchTerm) return $scope.users;
      return $scope.users.filter(function(user) {
        return user.name.toLowerCase()
          .includes($scope.searchTerm.toLowerCase());
      });
    };

    $scope.$watch('selectedRole', function(newVal, oldVal) {
      if (newVal !== oldVal) $scope.loadUsers();
    });

    // Initial load
    $scope.loadUsers();
  }
]);
```

 

```
// ✅ AFTER: React + TypeScript
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useUserService } from '@/hooks/useUserService';
import { useNotification } from '@/hooks/useNotification';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

type RoleFilter = 'all' | 'admin' | 'user' | 'moderator';

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleFilter>('all');

  const userService = useUserService();
  const { showError } = useNotification();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getAll({ role: selectedRole });
      setUsers(data);
    } catch {
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [selectedRole, userService, showError]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <SearchInput value={searchTerm} onChange={setSearchTerm} />
      <RoleFilter value={selectedRole} onChange={setSelectedRole} />
      <UserTable users={filteredUsers} />
    </div>
  );
}
```

 

**What the LLM gets right**: State mapping, basic hook conversion, effect dependencies.  
**What it gets wrong**: `useCallback` dependency arrays (often missing deps), `useMemo` optimization boundaries, proper error handling patterns for your specific notification system.

### [](#pattern-2-java-8-%E2%86%92-kotlin)Pattern 2: Java 8 → Kotlin

```
// ❌ BEFORE: Java 8
public class OrderProcessor {
    private final OrderRepository orderRepo;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    public OrderProcessor(OrderRepository orderRepo,
                          PaymentService paymentService,
                          NotificationService notificationService) {
        this.orderRepo = orderRepo;
        this.paymentService = paymentService;
        this.notificationService = notificationService;
    }

    public OrderResult processOrder(OrderRequest request) {
        if (request == null || request.getItems() == null
            || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Invalid order");
        }

        BigDecimal total = request.getItems().stream()
            .map(item -> item.getPrice()
                .multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (total.compareTo(BigDecimal.valueOf(10000)) > 0) {
            request.setDiscount(total.multiply(
                BigDecimal.valueOf(0.1)));
        }

        PaymentResult payment = paymentService.charge(
            request.getCustomerId(), total);

        if (!payment.isSuccessful()) {
            return OrderResult.failed(payment.getErrorMessage());
        }

        Order order = orderRepo.save(
            Order.from(request, payment.getTransactionId()));
        notificationService.sendConfirmation(
            request.getCustomerId(), order);

        return OrderResult.success(order);
    }
}
```

 

```
// ✅ AFTER: Kotlin
class OrderProcessor(
    private val orderRepo: OrderRepository,
    private val paymentService: PaymentService,
    private val notificationService: NotificationService,
) {
    fun processOrder(request: OrderRequest): OrderResult {
        require(request.items.isNotEmpty()) { "Invalid order" }

        val total = request.items.sumOf { item ->
            item.price * item.quantity.toBigDecimal()
        }

        if (total > 10_000.toBigDecimal()) {
            request.discount = total * 0.1.toBigDecimal()
        }

        val payment = paymentService.charge(request.customerId, total)

        if (!payment.isSuccessful) {
            return OrderResult.failed(payment.errorMessage)
        }

        val order = orderRepo.save(
            Order.from(request, payment.transactionId)
        )
        notificationService.sendConfirmation(request.customerId, order)

        return OrderResult.success(order)
    }
}
```

 

**What the LLM gets right**: Null safety, `require` instead of explicit null checks, property access syntax, trailing commas, expression simplification.  
**What it gets wrong**: Custom operator overloading for `BigDecimal`, Kotlin-specific collection extensions (`sumOf`), idiomatic error handling with `Result` or sealed classes.

### [](#pattern-3-python-2-%E2%86%92-python-3)Pattern 3: Python 2 → Python 3

```
# ❌ BEFORE: Python 2
class DataProcessor(object):
    def __init__(self, config):
        self.config = config
        self.logger = logging.getLogger(__name__)

    def process_batch(self, items):
        results = []
        for item in items:
            try:
                processed = self._transform(item)
                results.append(processed)
            except Exception, e:
                self.logger.error(
                    u"Failed to process item %s: %s"
                    % (item.get('id', 'unknown'), unicode(e))
                )
        return results

    def _transform(self, item):
        if isinstance(item, basestring):
            item = {'value': item}

        keys = item.keys()
        keys.sort()
        output = {}
        for key in keys:
            value = item[key]
            if isinstance(value, unicode):
                output[key] = value.encode('utf-8')
            elif isinstance(value, (int, long)):
                output[key] = float(value)
            else:
                output[key] = value

        return output
```

 

```
# ✅ AFTER: Python 3
class DataProcessor:
    def __init__(self, config):
        self.config = config
        self.logger = logging.getLogger(__name__)

    def process_batch(self, items):
        results = []
        for item in items:
            try:
                processed = self._transform(item)
                results.append(processed)
            except Exception as e:
                self.logger.error(
                    f"Failed to process item {item.get('id', 'unknown')}: {e}"
                )
        return results

    def _transform(self, item):
        if isinstance(item, str):
            item = {'value': item}

        output = {}
        for key in sorted(item.keys()):
            value = item[key]
            if isinstance(value, str):
                output[key] = value
            elif isinstance(value, int):
                output[key] = float(value)
            else:
                output[key] = value

        return output
```

 

**What the LLM gets right**: `except Exception as e` syntax, f-strings, removing `unicode`/`basestring`/`long`, removing `(object)` inheritance.  
**What it gets wrong**: Subtle behavior changes — Python 2's `dict.keys()` returns a list (mutable), Python 3's returns a view. The LLM correctly wraps it in `sorted()`, but misses cases where code mutates the keys list during iteration.

## [](#the-prompt-engineering-playbook-for-code-migration)The Prompt Engineering Playbook for Code Migration

After running thousands of migration transformations, these prompt engineering patterns consistently produce the best results:

### [](#1-system-message-the-migration-persona)1\. System Message: The Migration Persona

```
You are a staff-level software engineer performing a code migration.
Your output will be committed directly to a production repository.

CRITICAL RULES:
- Preserve ALL business logic exactly as-is. Do NOT refactor, optimize,
  or "improve" the code during migration.
- If you are unsure about a conversion, mark it with
  __MIGRATION_REVIEW__ in a comment.
- Do NOT add explanatory comments about the migration itself.
- Do NOT change variable names unless required by target language
  conventions.
- Output ONLY the migrated code. No markdown fences, no explanations.
```

 

### [](#2-fewshot-examples-beat-long-instructions)2\. Few-Shot Examples Beat Long Instructions

Instead of writing 50 rules about how to convert AngularJS to React, include 3 real examples. The model learns patterns better from concrete examples than abstract rules.

### [](#3-the-preserve-dont-improve-principle)3\. The "Preserve, Don't Improve" Principle

This is the single most important rule. LLMs will try to:

-   Add error handling that didn't exist
-   Optimize algorithms
-   Rename variables to be "clearer"
-   Add TypeScript types that are too strict or too loose

Every one of these changes introduces risk. Migration and improvement should be separate PRs.

### [](#4-confidence-markers)4\. Confidence Markers

Tell the LLM to flag uncertainty:  

```
If any conversion is ambiguous (e.g., unclear scope inheritance,
non-obvious side effects), add this exact comment:
// __MIGRATION_REVIEW__: [reason for uncertainty]

This will be caught by our post-processing pipeline and flagged
for human review.
```

 

This is dramatically more useful than hoping the LLM gets it right.

## [](#production-guardrails-what-can-go-wrong)Production Guardrails: What Can Go Wrong

### [](#1-the-hallucinated-import)1\. The Hallucinated Import

The LLM invents imports for packages that don't exist. It's seen `import { useQueryClient } from '@tanstack/react-query'` in its training data, so it uses it — even if your project uses SWR.

**Fix**: Post-process all imports against your actual `package.json` and project file structure.

### [](#2-the-silent-behavior-change)2\. The Silent Behavior Change

The most dangerous bug. The code compiles, tests pass (because tests are shallow), but behavior has subtly changed. Common examples:

-   Event handler timing (Angular digest cycle vs React state batching)
-   Null/undefined handling differences
-   Async operation ordering

**Fix**: Invest in integration tests before starting migration. Write them against the old codebase, then verify they pass against the new code.

### [](#3-the-overengineered-component)3\. The Over-Engineered Component

The LLM converts a simple AngularJS controller into a React component with 4 custom hooks, 3 context providers, and a reducer. It's technically correct but unmaintainable.

**Fix**: Add to your prompt: "Prefer simplicity. Use useState unless the state logic is complex enough to require useReducer. Do not create custom hooks for logic that is used in only one component."

### [](#4-the-copypaste-explosion)4\. The Copy-Paste Explosion

When migrating similar components, the LLM produces nearly identical code without extracting shared logic. You end up with 20 components that each have their own copy of the same data fetching pattern.

**Fix**: After the initial migration pass, run a second pass focused on extracting shared patterns into hooks and utilities. This is better done as a separate step because the LLM has access to all the migrated files at once.

## [](#measuring-migration-success)Measuring Migration Success

Track these metrics throughout the migration:

| Metric | Target | How to Measure |
| --- | --- | --- |
| Auto-merge rate | \> 50% | Files that pass all automated checks |
| Compilation success | \> 90% | First-pass TypeScript compilation |
| Test pass rate | \> 85% | Existing test suite against migrated code |
| Business logic preservation | 100% | Integration test suite |
| Lines migrated / day | 2,000+ | After pipeline is tuned |
| Human review time / file | < 15 min | Average for "quick-review" tier |

### [](#the-migration-dashboard)The Migration Dashboard

Build a simple dashboard that tracks progress per module:  

```
interface MigrationStatus {
  module: string;
  totalFiles: number;
  migrated: number;
  autoMerged: number;
  inReview: number;
  manualRewrite: number;
  avgConfidence: number;
  blockers: string[];
}
```

 

This visibility is crucial for stakeholder communication. "We've migrated 147 of 200 files with 92% auto-merge rate" is much more convincing than "it's going well."

## [](#which-llm-to-use)Which LLM to Use

As of April 2026, based on extensive migration testing:

| Model | Best For | Limitations |
| --- | --- | --- |
| Claude 4 Sonnet | Complex logic preservation, TypeScript accuracy, faithful business logic retention | 200K context window can be limiting for very large multi-file batches |
| GPT-5 | Broad language support, consistent formatting, strong instruction following | Tends to over-refactor during migration; higher cost per token |
| Gemini 2.5 Pro | Long context (1M tokens), multi-file understanding, cost-effective at scale | Sometimes invents APIs that don't exist |
| DeepSeek V3 | Cost-effective for simple transformations, strong on Python/Java patterns | Lower accuracy on complex business logic and cross-file dependencies |

**Recommendation**: Use Claude 4 Sonnet or GPT-5 for the initial migration (complex logic preservation), then Gemini 2.5 Pro or DeepSeek for cleanup passes on simple files. The cost difference is 10-50x, and simple files don't need the expensive model.

## [](#the-hard-truth-what-ai-cant-migrate)The Hard Truth: What AI Can't Migrate

Be honest about the boundaries:

1.  **Architecture decisions**: Should the monolithic AngularJS app become a micro-frontend? AI won't tell you.
2.  **State management design**: Should you use Zustand, Redux, or Context? The LLM will use whatever you tell it, but it can't make the architectural decision.
3.  **Performance optimization**: The LLM doesn't know your traffic patterns or bottlenecks.
4.  **Business rule validation**: If the original code has a bug that's "working as expected" (compensated for elsewhere), the LLM will faithfully reproduce the bug.
5.  **Cross-cutting concerns**: Logging, monitoring, error tracking, feature flags — these need human design in the new architecture.

## [](#timeline-a-realistic-migration-plan)Timeline: A Realistic Migration Plan

For a 200K LOC AngularJS-to-React migration:

| Phase | Duration | What Happens |
| --- | --- | --- |
| 1\. Setup | 2 weeks | Build pipeline, configure LLM, create 5-10 manual migration examples |
| 2\. Pilot | 2 weeks | Migrate 1 module (20-30 files) end-to-end, tune prompts |
| 3\. Scale | 8-10 weeks | Pipeline processes remaining modules in dependency order |
| 4\. Polish | 4 weeks | Fix edge cases, extract shared patterns, performance tuning |
| 5\. Validate | 2 weeks | Full regression testing, stakeholder sign-off |

**Total: ~4-5 months** vs. the traditional 12-18 months for manual migration.

The key insight: Phase 1 and 2 are the most important. If your pipeline can successfully migrate the pilot module with >80% auto-merge rate, the rest is execution. If the pilot fails, you need to rethink your approach before scaling.

## [](#migration-checklist)Migration Checklist

Before starting any AI-assisted migration:

### [](#preparation)Preparation

-   \[ \] Existing test suite has >70% coverage on critical paths
-   \[ \] Target framework conventions documented
-   \[ \] 5-10 reference migrations completed manually
-   \[ \] AST parser configured for source language
-   \[ \] CI pipeline includes compilation and test verification

### [](#pipeline)Pipeline

-   \[ \] Prompt template tested on 20+ representative files
-   \[ \] Post-processing catches invalid imports
-   \[ \] Confidence scoring calibrated (auto-merge threshold set)
-   \[ \] Few-shot examples included for each file type
-   \[ \] Dependency resolution order calculated

### [](#execution)Execution

-   \[ \] Migrating in dependency order (leaf nodes first)
-   \[ \] Each batch verified before moving to next
-   \[ \] Dashboard tracking progress and confidence scores
-   \[ \] Human reviewers assigned per module
-   \[ \] Rollback strategy defined per module

### [](#validation)Validation

-   \[ \] Integration tests pass against migrated code
-   \[ \] Visual regression tests completed
-   \[ \] Performance benchmarks match or improve
-   \[ \] Security review on auth/data handling paths
-   \[ \] Product team sign-off on migrated features

AI-powered code migration is not magic. It's engineering — building a pipeline that leverages LLMs for what they're good at (pattern transformation) while surrounding them with guardrails for what they're bad at (correctness guarantees). Get the pipeline right, and you can turn a year-long migration into a quarter. Get it wrong, and you'll spend that quarter debugging why the AI decided to rewrite your auth logic.

Build the pipeline. Trust the process. Verify everything.

---

> ⚡ **Speed Tip:** Read the original post on the [Pockit Blog](https://pockit.tools/blog/ai-powered-code-migration-llm-legacy-codebase-modernization-guide/).
> 
> Tired of slow cloud tools? [Pockit.tools](https://pockit.tools/json-formatter/) runs entirely in your browser. **[Get the Extension](https://chromewebstore.google.com/detail/pockit-developer-tools-pd/lojcamfhllebjmcjmipecgecbeopookg)** now for instant, zero-latency access to essential dev tools.
