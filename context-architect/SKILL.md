---
name: context-architect
description: Design context architecture, workspace docs, and system prompts for AI agents or app builds. Use when the user says "design my agent's context", "help me structure workspace docs", "optimize my system prompt", "architect my agent", "context architecture", "reduce token bloat", "design workspace for my assistant", or needs help structuring the document layer for any AI-powered system (agentic assistants, CLI tools, IDE agents, VPS-based agents, app builds). Also use when auditing existing workspace docs for bloat, duplication, or inefficiency.
---

# Context Architect

Design lean, effective context architectures for AI agents and app builds. This skill is consultative — it conducts a sequential interview, then produces a tailored document structure and actual doc drafts.

## How This Skill Works

This is NOT a reference dump. It is an interactive design process:

1. Ask one question at a time
2. Wait for the answer
3. Base the next question on what was just learned
4. After enough context (typically 6-10 questions), present the architecture
5. Write actual document drafts

**Never ask all questions upfront. Never present a question list. One question, one answer, then the next.**

## The Interview Sequence

Begin with Question 1. Each subsequent question adapts based on answers so far. The sequence below is a guide — skip questions that have already been answered, and add follow-up questions when an answer reveals something that needs clarification.

### Phase 1: What Are We Building? (Questions 1-3)

**Q1 — Purpose**: "What is this agent/app for? Give me the one-sentence version."
- This determines the entire architecture. An executive assistant needs different docs than a code reviewer.
- Listen for: scope (narrow tool vs broad assistant), autonomy level, domain.

**Q2 — Platform & Runtime**: "Where does this run and what framework/platform is it on?"
- Examples: OpenClaw on VPS, Claude Code locally, Cursor IDE, custom API wrapper, n8n workflow, etc.
- This determines: what doc formats are supported, how docs load (system prompt injection vs file reading vs tool calls), what constraints exist.
- If the user already has an existing setup, ask them to describe what they have now.

**Q3 — Existing State**: "Is this a new build from scratch, or do you have existing docs/prompts that need fixing?"
- If existing: "Can you share or describe your current workspace docs? How many files, rough line counts, what's in each?"
- If new: skip to Phase 2.
- If existing AND the user shares docs: audit them before continuing. Flag anti-patterns immediately (see `references/anti-patterns.md`).

### Phase 2: Who Does It Serve? (Questions 4-5)

**Q4 — User Profile**: "Tell me about the person this agent serves. Name, role, timezone, and most importantly — what do they hate? What annoys them about AI assistants?"
- The "what annoys them" answer is gold. It shapes identity, communication style, and guardrails more than anything else.
- Listen for: verbosity preferences, autonomy expectations, approval gates.

**Q5 — Communication Channels**: "How does the user interact with this agent? Chat? Telegram? Discord? CLI? Multiple channels?"
- This affects: message formatting rules, channel-specific behavior, notification routing.
- If multiple channels: "Does each channel have a different purpose, or are they mirrors?"

### Phase 3: What Does It Do? (Questions 6-8)

**Q6 — Core Tasks**: "List the 3-5 most important things this agent does, in order of frequency."
- This determines which domain knowledge files are needed and what routing rules look like.
- Push back if the list is >7 items. That's usually a sign the agent is trying to do too much.

**Q7 — Autonomy Boundaries**: "For each of those tasks — should the agent just do it, or ask first?"
- This directly shapes the guardrails doc.
- Listen for: hard approval gates (never send without OK) vs soft autonomy (do it, brief me later).

**Q8 — Model Strategy**: "What models are you using or considering? Do you have a budget constraint?"
- If they have a budget: this shapes the routing/delegation doc heavily.
- If they don't know: recommend a tiered approach (brain/workhorse/runner) and ask about budget.
- Refer to `references/token-economics.md` for cost math.

### Phase 4: Architecture Design (after interview)

After gathering enough context, present:

1. **Document map** — which files to create, what each contains, estimated line count, always-load vs on-demand
2. **Token budget** — estimated always-load token cost per message
3. **Anti-patterns flagged** — if auditing existing docs, call out specific issues found

Format the document map as a table:

```
| File | Purpose | Loads | Est. Lines |
|------|---------|-------|-----------|
| IDENTITY.md | Who the agent is, mission, personality | Always | ~50 |
| USER.md | Who it serves, preferences | Always | ~40 |
| ... | ... | ... | ... |
```

Then ask: "Does this structure make sense? Anything you'd add, remove, or restructure before I write the drafts?"

### Phase 5: Write the Docs

After the user approves the architecture, write actual document drafts. Not templates with TODO placeholders — real content based on everything learned in the interview.

Write one file at a time. After each file, briefly explain what's in it and move to the next. Do not ask for approval between every file unless the user seems uncertain.

## Key Principles (Always Apply)

- **Always-load docs shape behavior.** They answer: who am I, who do I serve, what must I never do, how do I route work. Target: <400 lines total.
- **On-demand docs provide knowledge.** They answer: how do I do this specific task. No line limit, but each file should be focused on one domain.
- **Each rule lives in exactly one file.** Never duplicate across docs.
- **Shorter is better.** Challenge every line: "Does this justify its token cost every session?"
- **Examples over explanations.** A 3-line example teaches better than a 10-line paragraph.
- **The user's pet peeves are requirements.** If they hate verbosity, the identity doc must enforce conciseness. If they hate emojis, that's a guardrail.

## Reference Material

Load these as needed during the design process — do NOT load all of them upfront:

- **[Document Taxonomy](references/document-taxonomy.md)** — detailed breakdown of the 6 document categories (identity, user profile, guardrails, routing, domain knowledge, memory). Read when deciding which files to create.
- **[Anti-Patterns](references/anti-patterns.md)** — 10 common mistakes in context architecture. Read when auditing existing setups or reviewing proposed designs.
- **[Token Economics](references/token-economics.md)** — cost math, budget frameworks, always-load vs on-demand decision framework. Read when the user has budget constraints or when estimating token costs.
