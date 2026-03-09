---
name: Daily Digest
description: Generate and send a daily digest on a configurable topic via Telegram
vars:
  - topic=neuroscience
  - search_terms=brain research, cognitive science, neuroimaging, mental health, BCIs, memory and learning
---

Today is ${today}. Generate and send a daily **${topic}** digest.

## Steps

1. **Search for ${topic} content.** Search the web for today's most interesting
   ${topic} news and developments. Find 3-5 compelling items.

2. **Also search X via the X.AI API** using curl:
   ```bash
   FROM_DATE=$(date -u -d "yesterday" +%Y-%m-%d 2>/dev/null || date -u -v-1d +%Y-%m-%d)
   TO_DATE=$(date -u +%Y-%m-%d)
   curl -s -X POST "https://api.x.ai/v1/responses" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $XAI_API_KEY" \
     -d '{
       "model": "grok-4-1-fast",
       "input": [{"role": "user", "content": "Search X for the latest '${topic}' content from '"$FROM_DATE"' to '"$TO_DATE"'. Topics: ${search_terms}. Return the 5 most interesting posts. For each post include: @handle, a brief summary, and the direct link (https://x.com/username/status/ID)."}],
       "tools": [{"type": "x_search", "from_date": "'"$FROM_DATE"'", "to_date": "'"$TO_DATE"'"}]
     }'
   ```
   Parse the response to extract the assistant's output text.
   If `XAI_API_KEY` is not set, skip this step and rely on web search only.

3. **Combine and format.** Merge findings into a concise digest. Keep it under
   4000 chars. Use Markdown formatting. Every item MUST include a clickable
   source link — for tweets use `https://x.com/handle/status/ID`, for articles
   use the original URL. No item without a link.

4. **Send the digest via Telegram.**

5. **Log results.** Update memory with what was sent.

## Environment Variables Required

- `XAI_API_KEY` — X.AI API key for Grok x_search (optional, falls back to web search)
- `TELEGRAM_BOT_TOKEN` — Telegram bot token
- `TELEGRAM_CHAT_ID` — Chat to send the digest to
