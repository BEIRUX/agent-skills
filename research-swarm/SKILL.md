---
name: research-swarm
description: "Launch a multi-perspective research swarm — 4 parallel agents (Advocate, Skeptic, Market, First-Principles) search the web with different lenses, write structured findings, then a Synthesizer agent produces a unified analysis with consensus, contradictions, and blind spots. Use when the user says 'research swarm', 'deep research', 'multi-perspective research', 'swarm research', or needs thorough analysis of a strategic question, technology evaluation, market landscape, or complex decision. NOT for simple factual lookups — use tavily-search or web search for those."
allowed-tools:
  - Agent
  - WebSearch
  - WebFetch
  - Write
  - Read
  - Bash
  - Glob
  - Grep
argument-hint: "<research question or topic>"
---

# Research Swarm

Multi-perspective parallel research that surfaces signal you'd miss with a single search.

## When to Use vs. Not

**Use for:** Strategic decisions, technology evaluations, market analysis, "should we X" questions, complex multi-faceted topics, due diligence, competitive landscape.

**Don't use for:** Simple factual lookups, API syntax, single-source answers. Use `/tavily-search` or web search instead.

## Architecture

5 agents total, 2 phases:

**Phase 1 — 4 Researcher Agents (parallel)**
Each gets the same research question but a different perspective lens. Each decomposes the question into 2-4 search queries tailored to their lens, runs them, and writes structured findings.

**Phase 2 — 1 Synthesizer Agent (sequential, after all 4 complete)**
Reads all 4 findings docs, deduplicates sources, identifies patterns, and produces `SYNTHESIS.md`.

## Output Structure

```
swarm-research/<topic-slug>/
  advocate.md
  skeptic.md
  market.md
  first-principles.md
  SYNTHESIS.md
```

`<topic-slug>` = kebab-case, max 40 chars, derived from the research question. Place `swarm-research/` in the current working directory.

## Execution

### Step 1: Derive the topic slug and create the output directory

Derive a short kebab-case slug from the user's research question. Create `swarm-research/<topic-slug>/`.

### Step 2: Launch 4 researcher agents in parallel

Launch all 4 in a **single message** using the Agent tool. Each agent gets:
- The research question
- Their perspective definition (see below)
- The output file path
- Instructions to use WebSearch and/or WebFetch for real searches (2-4 queries per agent)
- The findings format template

**Use `model: "sonnet"` for all 4 researcher agents** to keep cost reasonable. The synthesizer runs on the default model.

Each researcher agent prompt must include:

```
Research question: <the question>

You are the <PERSPECTIVE> researcher. Your job is to investigate the research question through your specific lens.

<PERSPECTIVE DEFINITION — copy from § Perspectives below>

## Your process
1. Decompose the research question into 2-4 search queries that reflect your perspective
2. Execute each query using WebSearch (and WebFetch for promising URLs)
3. Analyze what you find through your lens
4. Write your findings to: <output-path>

## Findings format
Write your file with this structure:

---
perspective: <perspective-name>
queries_run:
  - "<query 1>"
  - "<query 2>"
  - ...
sources:
  - "<url 1> — <one-line description>"
  - "<url 2> — <one-line description>"
  - ...
---

# <Perspective Name> Findings: <Research Question>

## Key Claims
- Claim 1 [source]
- Claim 2 [source]
- ...

## Evidence & Analysis
<Your detailed analysis through this lens. Be specific. Cite sources. 40-80 lines.>

## Confidence Assessment
- High confidence: <what you're sure about>
- Medium confidence: <what seems likely but needs more signal>
- Low confidence: <what's speculative or uncertain>

## Bottom Line
<2-3 sentence summary of your perspective's conclusion>
```

### Step 3: Launch the Synthesizer agent

After all 4 researchers complete, launch a single Synthesizer agent. Its prompt:

```
You are the Research Synthesizer. Read all 4 perspective findings and produce a unified analysis.

Read these files:
- <path>/advocate.md
- <path>/skeptic.md
- <path>/market.md
- <path>/first-principles.md

Write SYNTHESIS.md to: <path>/SYNTHESIS.md

## Synthesis format

# Research Synthesis: <Research Question>

**Date:** <current date>
**Perspectives analyzed:** Advocate, Skeptic, Market, First-Principles

## Consensus
What 3+ perspectives agree on. These are your strongest signals.

## Key Contradictions
Where perspectives clash — state both sides with reasoning. These are your decision points.

## Blind Spots
What NO perspective covered well. Flag for follow-up.

## Source Quality
- Total unique sources across all perspectives: N
- Sources cited by 2+ perspectives (strong signal): list them
- Notable single-source claims (weaker signal): list them

## Recommendation
Your synthesized judgment. Not a hedge — take a position, state confidence level, note what would change your mind.

## Per-Perspective Summaries
For each perspective, 3-5 bullet points capturing their unique contribution.
```

### Step 4: Report to the user

After the synthesizer completes, read `SYNTHESIS.md` and present a concise summary to the user. Mention the full output path so they can dig deeper.

## Perspectives

### Advocate
Search for the strongest case IN FAVOR. Look for success stories, benefits, positive outcomes, expert endorsements, growth trends, and enabling factors. Your job is to build the best possible argument for proceeding. Decompose queries toward: "why X works", "X success stories", "benefits of X", "X growth trajectory".

### Skeptic
Search for the strongest case AGAINST. Look for failures, risks, hidden costs, criticism, alternatives that outperform, and cautionary tales. Your job is to stress-test the idea and find every reason it might fail. Decompose queries toward: "X failures", "risks of X", "X criticism", "why X doesn't work", "X alternatives better than".

### Market
Search for the competitive and market landscape. Who else does this? What's the market size? Who are the incumbents? What are the trends? What's the adoption curve? Your job is to map the territory. Decompose queries toward: "X competitors", "X market size", "X adoption rate", "companies doing X", "X landscape 2025-2026".

### First-Principles
Ignore trends and opinions. Search for the underlying mechanics, constraints, and fundamentals. What does the physics/economics/logic say? What are the hard constraints? Your job is to cut through hype and find what's structurally true. Decompose queries toward: "how X actually works", "X technical fundamentals", "X constraints", "X economics unit cost".

## Cost Control

- Use `model: "sonnet"` for researcher agents — they're doing search + summarization, not deep reasoning
- Synthesizer runs on whatever model the session uses (it needs judgment quality)
- Each researcher should run 2-4 searches, not 10. Quality queries > quantity
- If the research question is narrow enough for 2 perspectives (e.g., "should we use X or Y"), the orchestrator may reduce to 2-3 researchers instead of 4. Use judgment.

## Edge Cases

- If a researcher finds nothing useful for their perspective, they should say so explicitly in their findings rather than padding with weak claims
- If the user provides a follow-up question after initial research, create a new topic slug — don't overwrite previous research
- If WebSearch is unavailable, fall back to WebFetch with known authoritative URLs
