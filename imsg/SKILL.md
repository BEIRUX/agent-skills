---
name: imsg
description: "iMessage/SMS CLI for listing chats, reading history, and sending messages via macOS Messages.app. Use when the user asks to read iMessages, check recent texts, send a text, or anything involving Messages.app."
homepage: https://imsg.to
metadata:
  {
    "openclaw":
      {
        "emoji": "📨",
        "os": ["darwin"],
        "requires": { "bins": ["imsg"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "steipete/tap/imsg",
              "bins": ["imsg"],
              "label": "Install imsg (brew)",
            },
          ],
      },
  }
---

# imsg

Read and send iMessage/SMS via macOS Messages.app.

## First step — always

Before running any command, check the syntax:

```bash
imsg --help
imsg <subcommand> --help
```

Never guess flags or argument order. The CLI evolves — `--help` is the source of truth.

## When to use

- Reading iMessage/SMS conversation history
- Listing recent chats
- Sending a text to a phone number or Apple ID
- Checking what someone sent

## When NOT to use

- Telegram → use Telegram plugin
- WhatsApp → use `wacli` skill
- Discord/Slack → use those skills
- Bulk/mass messaging → never

## Requirements

- macOS with Messages.app signed in
- Full Disk Access for terminal
- Automation permission for Messages.app (for sending)

## Typical workflow

1. `imsg chats` — list recent conversations, note the chat row ID (number in brackets)
2. `imsg history --chat-id <rowid> --limit <n>` — read messages from that chat
3. `imsg send --to "<recipient>" --text "<message>"` — send (only after user confirms)

Always use `--json` flag when you need to parse output programmatically.

## Safety rules

1. **Always confirm recipient and message content** before sending — show the number and text, wait for approval
2. **Never send to unknown numbers** without explicit user approval
3. **Reading is safe** — read freely when asked
4. **Sending is Tier 3** — treat it like a destructive action, always confirm first
