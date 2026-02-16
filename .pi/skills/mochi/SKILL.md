---
name: mochi
description: Use the Mochi CLI to manage decks, cards, templates, and due reviews from the terminal.
---

# Mochi

Use this skill for tasks that interact with Mochi through the `mochi` command.

## Tooling rules

1. Assume `mochi` is available in `PATH`; verify with:
   - `command -v mochi`
2. Prefer `MOCHI_API_KEY` from environment; do not print or expose secrets.
3. Output and handle data as JSON when possible.
4. Respect API concurrency limits by running write requests sequentially.

## Safe operation rules

1. Do not modify or delete existing user data unless explicitly requested.
2. For write-operation tests, create temporary resources and clean them up.
3. Confirm the target deck before bulk imports when ambiguous.

## Common command patterns

- List decks:
  - `mochi deck list`
- Get deck:
  - `mochi deck get <deck-id>`
- Create deck:
  - `mochi deck create --name "<name>"`
- List cards:
  - `mochi card list --deck-id <deck-id> --limit <n>`
- Create card:
  - `mochi card create --content "<front>\n---\n<back>" --deck-id <deck-id>`
- Update card:
  - `mochi card update <card-id> --content "..."`
- Delete card:
  - `mochi card delete <card-id>`
- Due cards:
  - `mochi due list`

## Bulk import workflow

1. Resolve target deck ID.
2. Prepare normalized entries (`front`, `back`, optional tags).
3. Create one card per entry:
   - `mochi card create --content "<front>\n---\n<back>" --deck-id <deck-id> --manual-tags "tag1,tag2"`
4. Track counts: created, skipped, failed.
5. Report a concise summary.

## Verification checklist

- `mochi --version` works
- target deck resolved correctly
- requested operations completed
- final summary includes IDs/counts and any failures
