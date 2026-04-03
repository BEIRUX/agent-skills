---
name: task-architect
description: "Discovery-first execution skill that reads relevant files and asks sequential clarifying questions before any work begins. Use when the user says /task-architect, 'architect this task', 'help me plan this', or before any non-trivial task like rewriting site copy, building features, refactoring, or updating content across multiple files. Forces reading before guessing and structured intake before execution."
---

# Task Architect

Read first. Ask second. Build last.

## Process

### Phase 1: Classify the Task

Determine the task type from the user's request:
- **content-update**: Copy changes, rewrites, tone shifts, content additions
- **new-build**: New feature, page, component, or MVP
- **bug-fix**: Something broken that needs investigation
- **refactor**: Restructuring without behavior change
- **design-ui**: Visual or layout changes

If the type is ambiguous, the first question should clarify it.

### Phase 2: Read Relevant Files

Based on the task type and user description, read files to understand current state. Never skip this step. Never guess what a file contains.

**What to read by type:**

| Type | Read |
|------|------|
| content-update | Pages/components mentioned, localization JSON files, related SEO files |
| new-build | Existing similar features, layout files, route structure, config files |
| bug-fix | The file(s) mentioned, related imports, API routes involved |
| refactor | All files in scope, their imports and dependents |
| design-ui | Target component, parent layout, related CSS/Tailwind config, UI primitives used |

After reading, form a mental model of the current state. Reference specific things found — file names, line counts, existing copy, patterns in use.

### Phase 3: Ask Questions — One at a Time

Ask **one question per message**. Wait for the answer before asking the next one.

Each question must:
- Reference something specific you read (a file, a line, a pattern)
- Be answerable in 1-2 sentences
- Move the task forward — never ask for curiosity alone
- Use plain language, not jargon

Each question should build on the previous answer. If an answer resolves what would have been the next question, skip it.

Load question patterns from `references/question-patterns.md` based on the classified task type. Use them as a starting point — adapt to context, skip irrelevant ones, add project-specific ones based on what you read.

**Stop asking when you can write a clear task brief with no ambiguity.** Typical: 3-5 questions. Max: 7. If you need more than 7, scope is too large — suggest splitting.

### Phase 4: Produce the Task Brief

Once questions are answered, output a brief:

```
## Task Brief

**Type**: [classified type]
**Scope**: [number of files, components, or sections affected]

### Files to modify
- `path/to/file.jsx` — [what changes]
- `path/to/other.json` — [what changes]

### Execution plan
1. [First concrete step]
2. [Second concrete step]
3. ...

### Constraints
- [Anything that must not break]
- [Patterns to follow]
- [Things explicitly excluded]
```

After presenting the brief, ask: **"Ready to execute, or anything to adjust?"**

Only begin implementation after explicit approval.

## Rules

- **Never guess file contents.** Read them.
- **Never ask multiple questions at once.** One per message.
- **Never ask vague questions.** Every question references something concrete.
- **Never skip the brief.** Even for "simple" tasks — the brief can be short.
- **Never start coding before approval.** The brief is a contract.
- **Cite what you read.** When asking a question, mention the file or pattern that prompted it.
