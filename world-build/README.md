# World Build

Creative world bible generator for AI video and image production.

## What It Does

Conducts a structured interview using `AskUserQuestion` to extract your creative vision, then generates a complete `.world/` directory with:

- **WORLD.md** — Master style bible (color palette with hex codes, film stock, lighting rules, locked style string)
- **characters/*.md** — Character DNA sheets with physical specs precise enough for consistent AI generation
- **locations/*.md** — Location sheets with architecture, props, atmosphere, and camera angles
- **prompts/** — Copy-paste ready style strings and example composed prompts
- **CONTINUITY.md** — Production tracking template for maintaining consistency across shots

## Usage

```
/world-build                    # Full world build from scratch
/world-build my-project         # Full build with a project name
/world-build add-character      # Add a character to an existing world
/world-build add-location       # Add a location to an existing world
```

## Why

Character and environment consistency is the #1 challenge in AI video. Models are stateless — each generation is independent. The only way to maintain visual coherence across shots is disciplined pre-production documents.

Creators who skip pre-production discard 90%+ of generations. Those who prepare properly get that down to 60-70%.

## The Interview Flow

1. **Vision & Purpose** — What's this for? What's the vibe? What references inspire you?
2. **Visual Style Lock** — Color palette, film stock, lighting, depth of field, special rules
3. **Locations** — Architecture, props, atmosphere, camera angles for each setting
4. **Characters** — Face, body, wardrobe, expression, distinguishing marks for each character
5. **Narrative & Shots** — Story arc, key moments, transitions (optional)

Questions are asked one at a time. Each answer shapes the next question.

## Output

```
.world/
├── WORLD.md
├── characters/
│   ├── mira.md
│   └── kai.md
├── locations/
│   ├── rooftop-bar.md
│   └── alley.md
├── prompts/
│   ├── style-suffix.txt
│   └── examples/
│       └── rooftop-entrance.txt
└── CONTINUITY.md
```

## Installation

Copy `world-build/` to your skills directory:

```bash
cp -r world-build ~/.claude/skills/world-build
```

Or install via ClawHub:

```bash
clawhub install world-build
```
