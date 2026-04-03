#!/usr/bin/env node

/**
 * Scans every directory for SKILL.md, parses frontmatter,
 * and outputs skills-manifest.json at repo root.
 */

const fs = require("fs");
const path = require("path");

const REPO_URL = "https://github.com/BEIRUX/agent-skills/tree/main";

// Category mapping — SKILL.md doesn't carry category info
const CATEGORY_MAP = {
  "agent-browser": "browser-web",
  "site-design-scanner": "browser-web",
  "site-replicator": "browser-web",
  "web-design-guidelines": "browser-web",
  "webapp-testing": "browser-web",
  "ai-website-cloner": "browser-web",
  slack: "social",
  discord: "social",
  xurl: "social",
  wacli: "social",
  bluebubbles: "social",
  imsg: "social",
  "tavily-search": "research",
  "tavily-research": "research",
  "tavily-cli": "research",
  "tavily-crawl": "research",
  "tavily-extract": "research",
  "tavily-map": "research",
  "tavily-best-practices": "research",
  summarize: "research",
  "research-swarm": "research",
  blogwatcher: "research",
  "openai-image-gen": "media",
  "video-frames": "media",
  sag: "media",
  songsee: "media",
  "openai-whisper": "media",
  "openai-whisper-api": "media",
  "scroll-cinema": "media",
  "world-build": "media",
  "canvas-design": "media",
  "motion-graphics": "media",
  "remotion-best-practices": "media",
  "remotion-transitions": "media",
  "theme-factory": "media",
  github: "dev-tools",
  "gh-issues": "dev-tools",
  "find-skills": "dev-tools",
  clawhub: "dev-tools",
  mcporter: "dev-tools",
  "code-simplifier": "dev-tools",
  "mcp-builder": "dev-tools",
  "apple-notes": "productivity",
  "apple-reminders": "productivity",
  "bear-notes": "productivity",
  "things-mac": "productivity",
  notion: "productivity",
  trello: "productivity",
  obsidian: "productivity",
  gog: "productivity",
  goplaces: "productivity",
  "doc-coauthoring": "productivity",
  weather: "infrastructure",
  peekaboo: "infrastructure",
  camsnap: "infrastructure",
  "nano-pdf": "infrastructure",
  pdf: "infrastructure",
  docx: "infrastructure",
  pptx: "infrastructure",
  xlsx: "infrastructure",
  oracle: "infrastructure",
  "model-usage": "infrastructure",
  gemini: "ai-llm",
  "claude-api": "ai-llm",
  "context-architect": "ai-llm",
  "task-architect": "ai-llm",
  "frontend-design": "react-frontend",
  "vercel-react-best-practices": "react-frontend",
  "vercel-composition-patterns": "react-frontend",
  "vercel-react-native-skills": "react-frontend",
  "stripe-best-practices": "react-frontend",
};

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^(\w+):\s*(.+)/);
    if (m) {
      let val = m[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      fm[m[1]] = val;
    }
  }
  return fm;
}

function truncateDescription(desc) {
  if (!desc) return "";
  // Take first sentence (up to first period followed by space or end)
  const match = desc.match(/^(.+?\.)\s/);
  if (match && match[1].length < 120) return match[1];
  // Fallback: truncate at 120 chars
  if (desc.length <= 120) return desc;
  return desc.slice(0, 117) + "...";
}

function main() {
  const root = path.resolve(__dirname, "..");
  const dirs = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith(".") && d.name !== "scripts" && d.name !== "node_modules");

  const skills = [];

  for (const dir of dirs) {
    const skillMd = path.join(root, dir.name, "SKILL.md");
    if (!fs.existsSync(skillMd)) continue;

    const content = fs.readFileSync(skillMd, "utf-8");
    const fm = parseFrontmatter(content);
    const name = fm.name || dir.name;
    const description = truncateDescription(fm.description || "");
    const category = CATEGORY_MAP[dir.name] || "other";

    skills.push({
      name,
      description,
      category,
      github_url: `${REPO_URL}/${dir.name}`,
      install_command: `npx playbooks add skill BEIRUX/agent-skills --skill ${dir.name}`,
    });
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));

  const manifest = {
    version: 1,
    generated_at: new Date().toISOString(),
    skill_count: skills.length,
    skills,
  };

  const outPath = path.join(root, "skills-manifest.json");
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Generated manifest with ${skills.length} skills`);
}

main();
