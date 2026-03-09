# Aeon

Autonomous agent running on GitHub Actions, powered by Claude Code. Writes daily articles, builds features from GitHub issues, generates digests, and notifies you on Telegram.

## Quick start

1. **Fork this repo** (or click "Use this template" if available)
2. **Enable GitHub Actions** — go to the **Actions** tab in your fork and click "I understand my workflows, go ahead and enable them"
3. **Add secrets** — go to **Settings > Secrets and variables > Actions** and add:

| Secret | Required | Description |
|--------|----------|-------------|
| `CLAUDE_CODE_OAUTH_TOKEN` | Yes | OAuth token for Claude (see below) |
| `TELEGRAM_BOT_TOKEN` | Optional | From @BotFather on Telegram |
| `TELEGRAM_CHAT_ID` | Optional | Your Telegram chat ID from @userinfobot |
| `XAI_API_KEY` | Optional | X.AI API key for searching X/Twitter |

4. **Edit `aeon.yml`** — configure which skills run and when
5. **Test** — go to **Actions > Run Skill > Run workflow** and enter a skill name (e.g. `article`)

### Getting your auth token

**Option A: Claude Code OAuth token (recommended)** — uses your existing Claude Pro/Max subscription, no separate API billing.

1. Install [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and run:
   ```bash
   claude setup-token
   ```
2. It opens a browser for OAuth login, then prints a long-lived token (`sk-ant-oat01-...`, valid for 1 year).
3. Add it as the `CLAUDE_CODE_OAUTH_TOKEN` secret in your repo.

**Option B: Standard API key** — usage-based billing through console.anthropic.com.

1. Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) and create a key.
2. Add it as `CLAUDE_CODE_OAUTH_TOKEN` in your repo secrets (it works in the same field).

## How it works

A GitHub Actions workflow runs every hour, checks `aeon.yml` to see if any skill is due, and if so, tells Claude Code to read and execute that skill's markdown file. After Claude finishes, the workflow commits all changes back to your repo.

```
Hourly cron fires
  → Checks aeon.yml — is any skill scheduled for this hour?
    → No  → exits immediately (costs ~10 seconds)
    → Yes → installs Claude Code
      → claude -p "Read and execute skills/article.md"
        → Claude reads the skill, searches the web, writes output
          → Workflow commits all changes back to main
```

## Configuration

All scheduling is done in `aeon.yml`:

```yaml
skills:
  article:
    schedule: "0 8 * * *"     # Daily at 8am UTC
  digest:
    schedule: "0 14 * * *"    # Daily at 2pm UTC
  feature:
    schedule: "0 2 * * 1"     # Monday at 2am UTC
```

The schedule format is standard cron (`minute hour day-of-month month day-of-week`). All times are UTC.

To disable a skill, remove it from `aeon.yml` or delete its schedule line.

## Adding a new skill

1. Create `skills/your-skill.md` with instructions for Claude:

```markdown
---
name: My Skill
description: What this skill does
---

Your task is to...
```

2. Add it to `aeon.yml` with a schedule:

```yaml
skills:
  your-skill:
    schedule: "0 12 * * *"   # Daily at noon UTC
```

That's it — no workflow changes needed.

## Trigger feature builds from issues

Add the label `ai-build` to any GitHub issue. The workflow fires automatically and Claude will read the issue, implement it, and open a PR.

## Running locally

```bash
# Run any skill locally (requires Claude Code CLI)
claude -p "Today is $(date +%Y-%m-%d). Read and execute the skill defined in skills/article.md" --dangerously-skip-permissions
```

## Two-repo strategy

This repo is a **public template**. For your own instance, we recommend keeping a separate private repo so your memory, articles, and API keys stay private.

### Setup

1. **Fork this repo** to your own account (e.g. `your-name/aeon-private`). Make it **private**.
2. Add your secrets to the **private** fork (not the public template).
3. Customize `CLAUDE.md`, `aeon.yml`, `memory/MEMORY.md`, and skill prompts in your private fork.
4. All generated content (articles, digests, memory) stays in your private fork.

### Pulling updates from the template

When the public template gets new skills or workflow improvements:

```bash
# In your private fork
git remote add upstream https://github.com/aaronjmars/aeon.git
git fetch upstream
git merge upstream/main --no-edit
```

This merges template changes without overwriting your personal content, since your articles/memory are in files that don't exist in the template.

## Project structure

```
CLAUDE.md           ← agent identity (auto-loaded by Claude Code)
aeon.yml            ← skill schedules (edit this to configure)
skills/
  article.md        ← daily article skill
  digest.md         ← daily digest skill
  feature.md        ← feature builder skill
  reflect.md        ← weekly reflection skill
  build-tool.md     ← skill builder skill
  fetch-tweets.md   ← tweet fetcher skill
  search-papers.md  ← academic paper search tool
memory/
  MEMORY.md         ← long-term persistent memory
.github/
  workflows/
    run-skill.yml   ← single workflow dispatches all skills
```
