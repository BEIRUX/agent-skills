---
name: code-simplifier
description: >
  Simplifies and refines code for clarity, consistency, and maintainability while preserving
  all functionality. Focuses on recently modified code unless instructed otherwise.
  Use when the user says "simplify", "refactor", "clean up", "reduce code", "code review",
  "code smells", "make this cleaner", "tighten this up", "DRY this", or asks to improve
  existing code quality. Works on any language but has deepest pattern coverage for
  JavaScript/JSX (React/Next.js) and Python.
---

# Code Simplifier

Automated code refactoring that reduces lines while maintaining identical functionality.
Focus on *deleting* code, not writing more.

## Workflow

### 1. Scope Discovery

Determine what to refactor:

- **User specifies files/dirs**: Use those directly.
- **"Recent changes"**: `git diff --name-only HEAD~3`
- **"Scan codebase" or broad request**: Glob for source files, prioritize largest files.
- **No scope given**: Default to `git diff --name-only HEAD~5`.

Skip: `node_modules/`, `.next/`, `dist/`, `build/`, `vendor/`, lockfiles, generated files, test files (unless explicitly asked).

### 2. Analysis Pass

Read each file fully. Evaluate against these smell categories:

| Category | What to Look For |
|----------|-----------------|
| **Loop bloat** | `for` loops → `map/filter/reduce/find/some/every/flatMap` |
| **Conditional complexity** | Nested ifs, missing guard clauses, missing `?.` / `??` / `??=` |
| **Dead code** | Unused vars, unreachable branches, redundant returns, unused imports |
| **Duplication** | Repeated logic (3+ lines appearing 2+ times in same file) |
| **Verbose idioms** | Missing destructuring, spread, template literals, modern APIs |
| **Boolean bloat** | `if (x) return true; else return false;`, double negation, De Morgan |
| **Function bloat** | Unnecessary wrappers, missing implicit returns, unnecessary IIFEs |
| **React smells** | Unnecessary fragments, derived state in useState, inline handler duplication |

### 3. Scoring

Rate each file (1-10, lower = better):

| Metric | Measures |
|--------|----------|
| **Complexity** | Branch paths: `if`, `else`, `case`, `&&`, `||`, `?:`, `catch` |
| **Length** | Average function length in lines |
| **Working Memory** | Max simultaneous variables in any function scope |
| **Duplication** | Repeated logic blocks across the file |

### 4. Review-First Output

Present findings as a structured report per file:

```
## File: path/to/file.js

### Metrics
| Metric | Score | Notes |
|--------|-------|-------|
| Complexity | 6/10 | processOrder() has 12 branches |
| Length | 4/10 | Avg 18 lines/function |
| Working Memory | 7/10 | handleSubmit() juggles 8 vars |
| Duplication | 5/10 | Error handling repeated 3x |

### Proposed Changes (N changes, ~M lines saved)

#### 1. [SAFE] Loop → array method (lines 24-31)
**Before** (8 lines):
```js
// current code
```
**After** (2 lines):
```js
// refactored code
```
Lines saved: 6 | Risk: Safe
```

Tag every change:
- **[SAFE]** — Mechanical transformation, zero behavior change
- **[CAUTION]** — Likely safe but verify (truthiness semantics, evaluation order, side effects)

### 5. Apply Changes

After user approves:
- Apply via Edit tool, one change at a time, largest savings first
- Re-read file after all edits to verify no syntax breakage
- Note if user should run their linter/formatter

## Rules

1. **Never change behavior.** Any ambiguity → mark [CAUTION] and explain the edge case.
2. **Never add code.** Only exception: extracting a helper to DRY 3+ duplications (net lines must still decrease).
3. **Never add comments, docstrings, or type annotations** unless explicitly requested.
4. **Preserve formatting style.** Match existing indentation, quotes, semicolons.
5. **One file at a time.** Complete analysis + review before moving to next file.
6. **Respect the user's stack.** Maintain React conventions in JSX. Don't convert class → functional unless asked.

## Quick Mode

If user says "just fix it" or "auto-apply": skip review table, apply all [SAFE] changes directly. Still present [CAUTION] changes for review.

## Pattern Reference

For detailed before/after patterns, load only when actively refactoring:

- **JavaScript/JSX**: [references/patterns-javascript.md](references/patterns-javascript.md)
