# Token Economics for Context Architecture

## The Core Problem

Every token in the system prompt costs money on EVERY interaction. A 1,400-line system prompt at ~4 tokens/line = ~5,600 input tokens. At $3/M input tokens (Sonnet-tier), that's $0.017 per message just for the system prompt. Over 100 messages/day = $1.70/day = $51/month — just for context loading.

Cutting to 400 lines saves ~$36/month in input tokens alone.

## The Math

```
Tokens ≈ lines × 4 (rough estimate for English text with formatting)

Cost per message = (system_prompt_tokens × input_price) + (response_tokens × output_price)

Monthly cost = cost_per_message × messages_per_day × 30
```

## Context Budget Framework

Set a token budget for always-loaded docs based on the model tier:

| Budget Level | Lines | Tokens | Best For |
|-------------|-------|--------|----------|
| Ultra-lean | <200 | <800 | Cheap models, high-frequency tasks (cron, heartbeat) |
| Lean | 200-400 | 800-1600 | Standard operation, good balance |
| Standard | 400-800 | 1600-3200 | Complex agents with many responsibilities |
| Heavy | 800+ | 3200+ | Almost always a sign of bloat — audit and split |

## Decision Framework: Always-Load vs On-Demand

Ask these questions for each piece of content:

1. **Does the agent need this for EVERY interaction?**
   - Yes → always-load (identity, core rules, routing)
   - No → on-demand

2. **What percentage of interactions use this?**
   - >80% → always-load
   - 20-80% → consider always-load if small, on-demand if large
   - <20% → on-demand

3. **How large is it?**
   - <20 lines → always-load is cheap even if rarely used
   - 20-50 lines → always-load only if frequently needed
   - 50+ lines → almost always on-demand

4. **Does it change the agent's behavior or just provide information?**
   - Behavior-shaping → always-load (personality, rules, routing)
   - Information/reference → on-demand (schemas, templates, examples)

## Model Tier Economics

Different models have different cost profiles. Route tasks to the cheapest model that can handle them:

| Tier | Role | Typical Cost | Use For |
|------|------|-------------|---------|
| Brain | Orchestration, review, decisions | $3-15/M in | Complex reasoning, quality gates, security |
| Workhorse | Execution, writing, coding | $1-3/M in | Building things, drafting content |
| Runner | Simple tasks, monitoring | $0.07-0.50/M in | Health checks, status reports, simple lookups |
| Local | Always-on grunt work | $0 | Continuous monitoring, scanning, research loops |

## Savings Levers

In order of impact:

1. **Split always-load from on-demand** — biggest single savings
2. **Route to cheaper models** — use brain only for brain work
3. **Reduce duplication** — each rule in exactly one place
4. **Shorten instructions** — cut verbosity, use examples over explanations
5. **Curate memory** — prevent unbounded growth
6. **Batch operations** — one cron that checks 5 things vs 5 separate crons
