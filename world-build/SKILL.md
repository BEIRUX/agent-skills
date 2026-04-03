---
name: world-build
description: "Build a complete creative world for AI video/image production — characters, settings, visual style, and continuity rules. Uses structured questioning to extract the creator's vision, then generates a .world/ directory with character DNA sheets, location sheets, style bible, and shot-ready prompt templates. Use when the user says 'world build', 'build a world', 'create a world', 'character bible', 'style guide for AI video', 'world bible', or wants to prepare for AI-generated music videos, brand visuals, animations, or any project requiring consistent characters and environments across multiple AI generations. Also supports 'add-character' and 'add-location' to extend an existing world."
allowed-tools:
  - AskUserQuestion
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - WebSearch
argument-hint: "[project-name] or [add-character|add-location]"
---

# World Build — Creative World Bible Generator

Build production-ready world documents for AI video and image generation. The output is a `.world/` directory that serves as the single source of truth for all visual generation — every prompt, every character, every setting draws from these docs.

## Why This Exists

Character and environment consistency is the #1 challenge in AI video production. Models are stateless — each generation is independent. The only way to maintain consistency across shots is disciplined pre-production documents: locked style strings, character reference specs, location sheets, and continuity rules. Creators who skip this step discard 90%+ of their generations. Those who prepare properly get that down to 60-70%.

## Invocation Modes

Parse `build then push to beirux skill. include a read me` to determine the mode:

- **No args or a project name** → Full world build (Phase 1-5)
- **`add-character`** → Add a character to an existing world (Phase 4 only, reads existing WORLD.md for style context)
- **`add-location`** → Add a location to an existing world (Phase 3 only, reads existing WORLD.md for style context)

For `add-character` or `add-location`: read `.world/WORLD.md` first to load the existing style rules, then jump to the relevant phase. If `.world/` doesn't exist, tell the user to run `/world-build` first.

## Output Structure

```
.world/
├── WORLD.md              — Master style bible (palette, style string, lighting, tone, rules)
├── characters/
│   ├── {name}.md         — Character DNA sheet (one per character)
│   └── ...
├── locations/
│   ├── {name}.md         — Location sheet (one per setting)
│   └── ...
├── prompts/
│   ├── style-suffix.txt  — The locked style string (copy-paste into every prompt)
│   └── examples/
│       └── {scene}.txt   — Example composed prompts showing how to combine character + location + style
└── CONTINUITY.md         — Tracking template for production continuity
```

## The Interview

Ask questions one at a time using AskUserQuestion. Each answer shapes the next question. Never dump all questions at once. Adapt — skip questions already answered, probe deeper when answers are vague.

After every 4-5 questions, give a brief status: "Got it. I now know [X]. Next I need to understand [Y]."

### Phase 1: Vision & Purpose (2-4 questions)

Goal: understand what this world is FOR and what it feels like.

**Q1 — Purpose**: What is this world for?
- Music video? Brand campaign? Social content series? Animated short? Client project?
- Is there a narrative arc or is this mood/aesthetic-driven?
- Listen for: scope (one-off vs recurring), audience, platform (YouTube, TikTok, Instagram)

**Q2 — Vibe in 3 Words**: Describe the feeling of this world in exactly 3 words.
- Examples: "dark neon melancholy", "warm desert mythology", "clean luxury minimal"
- This becomes the creative north star. Push back if the words are generic ("cool modern nice").

**Q3 — Visual References**: What existing visuals are you drawn to?
- Films, music videos, artists, photographers, games, anime, brands
- Ask for specifics: "Blade Runner 2049 color palette" > "sci-fi vibes"
- If the user can't name references, offer MCQ options based on their vibe words

**Q4 — Medium**: What visual style?
- Photorealistic (looks like a real film)
- Illustrated / anime / cel-shaded
- 3D rendered / Pixar-style
- Mixed media / collage
- Surreal / abstract
- This fundamentally changes the style string and tool recommendations

### Phase 2: Visual Style Lock (3-5 questions)

Goal: nail down the exact visual language so every generation feels like it belongs to the same world.

**Q5 — Color Palette**: MCQ with palette directions based on vibe words, then refine.
- Offer 3-4 palettes that match their vibe (provide hex codes in descriptions)
- Let them pick one and adjust
- Final output: 4-6 hex colors with named roles (primary, accent, neutral, highlight, shadow)

**Q6 — Film Stock / Texture**: What does the "camera" feel like?
- Clean digital (iPhone 16 Pro, RED V-Raptor)
- Cinematic film (Arri Alexa 35mm, anamorphic)
- Vintage film (Super 8, 16mm, grain heavy)
- Analog / VHS / lo-fi
- This shapes the style string's film stock descriptor

**Q7 — Lighting Default**: How is the world lit?
- Natural light (golden hour, overcast, harsh noon)
- Cinematic (key + fill + rim, controlled)
- Neon / practical lights only
- Dramatic (high contrast, deep shadows)
- Flat / editorial (even, minimal shadow)
- Ask for a default direction: "light from camera-left" is the industry standard starting point

**Q8 — Depth of Field**: How much background blur?
- Shallow (f/1.4, heavy bokeh, subject isolation)
- Medium (f/2.8, some background detail)
- Deep (f/8+, everything in focus, landscape/architectural feel)

**Q9 — Special Rules**: Any visual rules specific to this world?
- "Never show modern technology"
- "All scenes have rain"
- "Lens flares on every outdoor shot"
- "Desaturated everything except red"
- Open-ended. Many worlds don't need this — skip if the user has nothing.

### Phase 3: Locations (2-4 questions per location)

Goal: define each setting with enough detail that any prompt produces a recognizable version of it.

**Q10 — How many locations?** Get a count and a one-line description of each.

Then for EACH location, ask:

**Q-Loc-1 — Architecture & Materials**: What's the space made of? What does it look like?
- Push for specifics: "concrete and glass" > "a building"
- Interior or exterior? Scale? Ceiling height? Open or enclosed?

**Q-Loc-2 — Atmosphere & Props**: What objects are in this space? What's the atmosphere?
- Fog, dust, rain, clean air, smoke
- Key props that should appear consistently
- What's visible through windows/doors?

**Q-Loc-3 — Lighting Override**: Does this location have different lighting than the world default?
- A neon-lit bar has different lighting than the world's "golden hour" default
- Skip if the location follows the world default

**Q-Loc-4 — Camera Angles Available**: What shots make sense here?
- Wide establishing, medium at bar, close-up detail, aerial/overhead
- This feeds the shot list

### Phase 4: Characters (3-6 questions per character)

Goal: define each character with enough physical precision that AI models can reproduce them.

**Q11 — How many characters?** Get a count and a one-line role description of each.

Then for EACH character, ask:

**Q-Char-1 — Face & Body**: Physical description with maximum specificity.
- Face shape, skin tone (ask for hex or descriptive), hair (color, length, style, parting), eyes, distinguishing features
- Body type, height impression, posture
- Push for precision: "dark hair" is useless. "Jet black, shoulder-length, straight, side-parted left" is usable.

**Q-Char-2 — Default Wardrobe**: What are they wearing in most scenes?
- Specific garments, colors, materials, accessories
- "Black leather jacket, white tank, silver chain, dark jeans, white Jordans"
- Ask about wardrobe changes across scenes if relevant

**Q-Char-3 — Expression & Energy**: What's their default emotional state?
- Guarded? Warm? Intense? Playful? Haunted?
- What's the range? Do they smile? Cry? Stay stoic?

**Q-Char-4 — Distinguishing Marks**: Anything unique?
- Scars, tattoos, jewelry, glasses, always carrying something
- These are consistency anchors — models grab onto distinctive visual details

**Q-Char-5 — Role in the World**: What's their relationship to the story/brand?
- Protagonist? Narrator? Brand avatar? Ensemble?
- How do they move through the locations?

**Q-Char-6 (if brand project)**: Does this character represent a real person or brand?
- If yes: get real reference photos or descriptions to base the character on
- If brand mascot: what values must the character embody?

### Phase 5: Narrative & Shots (2-3 questions, optional)

Skip if the user said this is purely aesthetic/mood-driven.

**Q12 — Story Arc**: What happens? Beginning, middle, end in 2-3 sentences.

**Q13 — Key Moments**: What are the 3-5 most important visual moments?
- "She walks into the bar alone" / "He sees the city for the first time" / "They face each other in the rain"
- These become the priority shots

**Q14 — Transitions**: How do scenes connect?
- Hard cuts? Dissolves? Match cuts? Silhouette transitions?
- Any specific transition the user loves?

## Document Generation

After the interview, generate all files. Follow these formats exactly:

### WORLD.md Format

```markdown
# [World Name] — World Bible

**Created:** [date]
**Purpose:** [what this is for]
**Vibe:** [the 3 words]
**Medium:** [photorealistic / illustrated / etc.]

## Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | [name] | #XXXXXX | Dominant backgrounds, large surfaces |
| Accent | [name] | #XXXXXX | Highlights, focal points, key props |
| Neutral | [name] | #XXXXXX | Shadows, negative space, text backgrounds |
| Highlight | [name] | #XXXXXX | Light sources, reflections, emphasis |
| [Optional] | [name] | #XXXXXX | [specific usage] |

## Visual Style

- **Film Stock:** [descriptor]
- **Grain:** [level and type]
- **Color Grade:** [descriptor]
- **Depth of Field:** [default]
- **Aspect Ratio:** [16:9, 2.39:1, 9:16 vertical, etc.]

## Lighting Rules

- **Default Direction:** [e.g., soft key light from camera-left]
- **Default Quality:** [hard/soft]
- **Default Temperature:** [warm/cool/neutral]
- **Fill Strategy:** [ambient, bounce, practical, none]
- **Exceptions:** [location-specific overrides]

## Style String

> Copy this suffix into every generation prompt:

```
[the locked style string, assembled from all the above]
```

## World Rules

- [Any special rules or constraints]
- [Visual do's and don'ts]

## Locations

[List with links to individual sheets]

## Characters

[List with links to individual DNA sheets]
```

### Character Sheet Format (`characters/{name}.md`)

```markdown
# [Character Name] — Character DNA

## Physical Description

- **Face:** [shape, structure]
- **Skin:** [tone, hex approximate]
- **Hair:** [color, length, style, parting]
- **Eyes:** [color, shape]
- **Body:** [type, height impression, posture]
- **Age Impression:** [how old they look]

## Default Wardrobe

- [Garment 1 with color and material]
- [Garment 2]
- [Accessories]
- [Shoes]

## Wardrobe Variants

| Scene/Context | Changes |
|---------------|---------|
| [scene] | [what changes] |

## Expression & Energy

- **Default:** [resting state]
- **Range:** [what emotions they show]
- **Never:** [what they never do — smile, cry, etc.]

## Distinguishing Marks

- [Scar, tattoo, birthmark, etc.]
- [Signature accessory]
- [Movement habit — how they hold themselves]

## Prompt Fragment

> Use this in prompts to describe this character:

```
[A pre-written prompt fragment that combines all the above into a generation-ready description]
```

## Reference Notes

- [Any notes about consistency challenges]
- [Angles that work best]
- [Known generation issues to watch for]
```

### Location Sheet Format (`locations/{name}.md`)

```markdown
# [Location Name] — Location Sheet

## Overview

- **Type:** [interior/exterior/both]
- **Scale:** [intimate/medium/large/vast]
- **Time of Day:** [default]
- **Atmosphere:** [fog, rain, clean, dusty, etc.]

## Architecture & Materials

- [Structural description]
- [Materials, textures, surfaces]
- [Ceiling/sky, floor/ground]

## Key Props

- [Prop 1 — always present]
- [Prop 2 — always present]
- [Optional/scene-specific props]

## Lighting

- **Follows world default:** [yes/no]
- **Override:** [if no, what's different]
- **Light sources:** [practical lights in the scene]

## Camera Angles

| Shot Type | Description | Notes |
|-----------|-------------|-------|
| Wide establishing | [description] | [when to use] |
| Medium | [description] | [when to use] |
| Close-up | [description] | [when to use] |
| [Other] | [description] | [when to use] |

## Prompt Fragment

> Use this in prompts to describe this location:

```
[Pre-written prompt fragment for this location]
```
```

### CONTINUITY.md Format

```markdown
# [World Name] — Continuity Tracker

Use this during production to track visual consistency across shots.

## Character State Tracking

| Shot | [Char 1] Wardrobe | [Char 1] Hair | [Char 1] Props | Shadow Dir | Notes |
|------|-------------------|---------------|----------------|-----------|-------|
| 01 | | | | | |
| 02 | | | | | |

## Environment State Tracking

| Shot | Location | Time of Day | Weather | Key Props Visible | Notes |
|------|----------|-------------|---------|-------------------|-------|
| 01 | | | | | |
| 02 | | | | | |

## Consistency Rules (Do NOT Break)

- [ ] Style string appended to every prompt
- [ ] Character reference images used for every generation
- [ ] Light direction consistent within each scene
- [ ] Color palette respected (check hex values)
- [ ] Frame chaining: last frame of prev clip = seed for next
```

### Prompt Examples (`prompts/examples/{scene}.txt`)

For 2-3 key scenes, compose a full generation prompt that demonstrates how to combine:
1. Character prompt fragment
2. Location prompt fragment  
3. Action/motion description
4. Style string suffix

This shows the user the pattern for composing their own prompts.

## Quality Gates

Before writing any file, verify:
- Every color has a hex code, not just a name
- Every character description is specific enough to distinguish from a random generation
- The style string contains: film stock, grain, color grade, depth of field, lighting direction
- Location lighting specifies direction and quality, not just "dark" or "bright"
- Prompt fragments are copy-paste ready — no placeholders or [fill in] brackets

## Tone

Be direct and opinionated. If the user gives vague answers ("I dunno, something cool"), push them: "Cool doesn't generate. Give me a specific film, artist, or image you want this to feel like." The whole point is extracting specificity from the user's vision — vague in means vague out.
