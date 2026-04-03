# Document Taxonomy

Every AI agent or app context needs some subset of these document categories. Not all are required — the interview determines which apply.

## Category 1: Identity

**Purpose**: Who the agent IS. Personality, tone, name, pronouns, mission statement.
**Loads**: Always (every session).
**Target size**: 10-80 lines.
**Common mistakes**: Mixing behavior rules into identity. Identity is WHO, not WHAT TO DO.

Example structure:
```
## Mission
[1-2 sentence mission statement that filters all decisions]

## Name & Persona
- Name: X | Emoji: Y | Pronouns: Z

## Personality
- [3-5 bullet points max — sharp, concise, no rambling]

## Communication Style
- [What to do and what NOT to do — based on user's stated preferences]
```

## Category 2: User Profile

**Purpose**: Who the agent SERVES. Name, timezone, schedule, business context, preferences, pet peeves.
**Loads**: Always.
**Target size**: 30-60 lines.
**Common mistakes**: Including full client portfolios, financial details, or personal history that changes. Only include stable facts the agent needs every session.

What belongs here:
- Name, location, timezone
- Business name and one-line description
- Communication preferences (hates long responses, prefers tables, etc.)
- Work schedule / availability
- Team members (names + roles, not bios)

What does NOT belong here:
- Detailed client lists (→ on-demand reference)
- Financial details (→ on-demand reference)
- Personal history, hobbies, academic info (unless directly relevant to tasks)

## Category 3: Guardrails

**Purpose**: Non-negotiable safety and behavior rules. Things the agent must NEVER do regardless of context.
**Loads**: Always.
**Target size**: 40-100 lines.
**Common mistakes**: Mixing operational procedures with safety rules. Guardrails are hard stops, not workflows.

What belongs here:
- Security rules (never expose keys, never run destructive commands without approval)
- Approval gates (never send client emails without user OK)
- Data handling rules (sensitive data classification)
- Platform-specific safety (never force-push to main, never deploy without GitHub)

What does NOT belong here:
- How to do things (→ routing/procedures)
- When to use which model (→ routing)
- Communication style preferences (→ identity or user profile)

## Category 4: Routing / Delegation

**Purpose**: How the agent decides WHAT to do and WHO does it. Model tiers, skill loading, execution patterns, escalation rules.
**Loads**: Always.
**Target size**: 50-100 lines.
**Common mistakes**: Including full execution chains for every scenario. Keep routing rules general; detailed chains go in on-demand references.

What belongs here:
- Model tier definitions (brain/workhorse/runner — which model for which task class)
- Skill loading protocol (how to find and load the right skill)
- The universal execution pattern (plan → delegate → execute → review → deliver)
- Escalation rules (when to ask the user vs act autonomously)
- Quality gates (what "done" looks like)

What does NOT belong here:
- Specific model IDs or pricing (changes frequently → on-demand reference or config)
- Detailed step-by-step chains for 30+ scenarios (→ on-demand reference)
- API key locations or infrastructure details (→ config or on-demand reference)

## Category 5: Domain Knowledge

**Purpose**: Reference material the agent needs for specific tasks but NOT every session.
**Loads**: On-demand only.
**Target size**: Unlimited per file, but each file should be focused.
**Common mistakes**: Loading domain knowledge every session. This is the #1 cause of token bloat.

Examples:
- Brand identity guidelines (load when doing design/image work)
- Client portfolio details (load when discussing specific clients)
- Tech stack reference (load when building/debugging)
- Email templates (load when drafting outreach)
- Lead generation strategy (load when doing lead work)
- Code examples / API usage (load when writing integrations)

Organization principle: One file per domain. Name clearly. Reference from routing doc so the agent knows they exist.

## Category 6: Memory / State

**Purpose**: Persistent state that accumulates over time. Preferences learned, task history, incident logs.
**Loads**: Selectively (main memory file always; detailed logs on-demand).
**Target size**: Main memory 50-100 lines; detailed files unlimited.
**Common mistakes**: Letting memory grow unbounded. Memory needs periodic curation.

What belongs here:
- Learned user preferences (approved/rejected patterns)
- Key decisions and their rationale
- Incident log summaries (what broke, what we learned)
- Current project status snapshots

Maintenance rules:
- Curate weekly — remove stale entries
- Archive old daily logs (keep last 7 days active)
- Main memory file should be a summary, not a log
