# Context Architecture Anti-Patterns

Common mistakes that waste tokens, confuse the agent, or degrade output quality. Use this as a diagnostic checklist when auditing existing setups.

## Anti-Pattern 1: The Mega-Doc

**Symptom**: One file tries to be identity, guardrails, routing, procedures, and reference all at once.
**Example**: An AGENTS.md that is simultaneously a startup guide, security policy, group chat etiquette doc, memory management guide, email protocol, and skill loader.
**Cost**: 300-500 lines loaded every session when only 50 lines are needed per task.
**Fix**: Split by category (see document taxonomy). Each file has ONE job.

## Anti-Pattern 2: Duplication Across Files

**Symptom**: The same rule appears in 2-3 different files with slightly different wording.
**Example**: "Never send emails without approval" in GUARDRAILS.md, AGENTS.md, and SOUL.md.
**Cost**: Wastes tokens AND creates ambiguity when versions drift apart.
**Fix**: Each rule lives in exactly one file. Other files can reference it but never restate it.

## Anti-Pattern 3: Code Examples in System Prompt

**Symptom**: Full Python/JS code blocks loaded every session "in case the agent needs them."
**Example**: 300 lines of Google API code examples in TOOLS.md loaded on every session.
**Cost**: Hundreds of tokens per session, used maybe 5% of the time.
**Fix**: Move code examples to on-demand reference files or scripts. Agent reads them only when doing that specific task.

## Anti-Pattern 4: Overspecification

**Symptom**: Instructions so detailed they constrain the agent more than they help.
**Example**: A 10-section morning brief template specifying exact headers, exact order, exact formatting for every subsection.
**Cost**: The agent spends tokens following a rigid format instead of adapting to what actually matters today.
**Fix**: Specify the goal and 2-3 must-haves. Let the agent figure out the format. "Morning brief: overnight activity, today's priorities, items needing my approval. Keep it scannable in 30 seconds."

## Anti-Pattern 5: Stale Reference Material

**Symptom**: One-time documents (audit reports, setup guides, migration plans) left in the workspace permanently.
**Example**: SECURITY-AUDIT-2026-02-06.md still in workspace root 2 weeks later.
**Cost**: Clutters the workspace, may confuse the agent about current state.
**Fix**: Archive completed one-time docs. Keep only living documents in active workspace.

## Anti-Pattern 6: Loading Everything Always

**Symptom**: Every workspace doc loads into the system prompt regardless of the task.
**Example**: Brand guidelines, tech stack reference, client portfolio, email templates — all loaded for a simple "what's on my calendar?" query.
**Cost**: 1000+ unnecessary tokens per session.
**Fix**: Only identity, user profile, guardrails, routing, and memory load always. Everything else loads on-demand when the task requires it.

## Anti-Pattern 7: No Routing Layer

**Symptom**: One model handles everything — orchestration, execution, simple lookups, expensive reasoning.
**Example**: Using Sonnet ($3/$15 per M) for cron health checks that just run a script and report status.
**Cost**: 10-50x overspend on simple tasks.
**Fix**: Define model tiers. Brain for decisions, workhorse for execution, runner for simple tasks.

## Anti-Pattern 8: Throwaway Sub-Agents for Repeated Work

**Symptom**: Sub-agents are spawned, do work, then die — losing all context. Next time the same task comes up, a new agent starts from zero.
**Example**: A lead research sub-agent that doesn't remember what makes a good lead from last time.
**Cost**: Repeated ramp-up time and tokens. No learning across tasks.
**Fix**: Consider persistent specialized sessions that accumulate domain knowledge.

## Anti-Pattern 9: Personality Soup

**Symptom**: Identity instructions are vague, contradictory, or try to make the agent "everything."
**Example**: "Be professional but casual, formal but fun, concise but thorough, proactive but wait for instructions."
**Cost**: Inconsistent behavior. Agent doesn't know which directive to follow.
**Fix**: Pick a clear personality archetype. Define 3-5 concrete traits. Include specific examples of good AND bad output.

## Anti-Pattern 10: Memory as a Dumping Ground

**Symptom**: Memory files grow endlessly with no curation. Daily logs from weeks ago, one-time reports, raw data dumps.
**Example**: 40+ memory files including stale task lists, old overnight findings, superseded strategy docs.
**Cost**: Agent wastes time reading irrelevant history. Main memory file becomes too long to be useful.
**Fix**: Weekly memory curation. Archive anything older than 7 days. Main memory file is a curated summary, not a chronicle.
