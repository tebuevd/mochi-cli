# Mochi CLI

<div align="center" style="background:#b00020;color:#ffffff;padding:16px 20px;border-radius:8px;font-size:1.1rem;font-weight:700;line-height:1.5;">
  ⚠️ <strong>VIBE-CODED WARNING:</strong> This project was <strong>100% vibe-coded</strong>. No guarantees are made about correctness, safety, or fitness for any purpose. <strong>You use this entirely at your own risk.</strong>
</div>

A command-line interface for [Mochi Cards](https://mochi.cards/) - the markdown-based spaced repetition flashcard app.

## Features

- 🔐 **Secure API Authentication** via HTTP Basic Auth
- 📇 **Card Management** - Create, read, update, delete cards
- 📚 **Deck Management** - Organize your content hierarchically
- 📝 **Template Support** - Use templates with field placeholders
- 📅 **Due Cards** - Query cards scheduled for review
- 📎 **Attachments** - Upload and manage file attachments
- 🔍 **Pagination** - Handle large collections efficiently
- 🐚 **Shell Completions** - Bash and Zsh support
- 💪 **Type-Safe** - Written in TypeScript with full type coverage

## Installation

### Requirements
- [Bun](https://bun.sh/) >= 1.0.0

### Install from source
```bash
git clone <repository>
cd mochi-cli
bun install
bun run build
# The binary will be at dist/mochi
```

### Set up shell completions

**Bash:**
```bash
# Add to ~/.bashrc
source /path/to/mochi-cli/completions/bash.sh
```

**Zsh:**
```bash
# Copy to a directory in your $fpath
cp /path/to/mochi-cli/completions/zsh.sh /usr/local/share/zsh/site-functions/_mochi
# Or add directly to your ~/.zshrc
fpath+=(/path/to/mochi-cli/completions)
```

## Configuration

Set your Mochi API key as an environment variable:

```bash
export MOCHI_API_KEY="your-api-key-here"
```

Get your API key from Mochi: **Account Settings → API Keys**

Alternatively, use the `--api-key` flag with each command.

## Usage

```bash
mochi <command> <action> [options]
```

### Commands

#### Cards
```bash
# List cards
mochi card list --deck-id <deck-id> --all
mochi card list --limit 50 --bookmark <token>

# Get a card
mochi card get <card-id>

# Create a card
mochi card create --content "# Question\nAnswer" --deck-id <deck-id>

# Create a card with template fields
mochi card create \
  --content "# <<Front>>" \
  --deck-id <deck-id> \
  --template-id <template-id> \
  --fields '{"front":{"id":"front","value":"Hello World"}}'

# Update a card
mochi card update <card-id> --content "New content"
mochi card update <card-id> --archived

# Delete a card
mochi card delete <card-id>

# Attachments
mochi card add-attachment <card-id> --file /path/to/file.png
mochi card delete-attachment <card-id> --filename file.png
```

#### Decks
```bash
# List decks
mochi deck list --all

# Get a deck
mochi deck get <deck-id>

# Create a deck
mochi deck create --name "My Deck"
mochi deck create --name "Nested Deck" --parent-id <parent-deck-id>

# Update a deck
mochi deck update <deck-id> --name "New Name" --archived

# Delete a deck
mochi deck delete <deck-id>
```

#### Templates
```bash
# List templates
mochi template list --all

# Get a template
mochi template get <template-id>

# Create a template
mochi template create \
  --name "Vocabulary" \
  --content "# <<Word>>\n**Definition:** <<Definition>>" \
  --fields '{
    "word": {"id": "word", "name": "Word", "type": "text"},
    "definition": {"id": "definition", "name": "Definition", "type": "text", "options": {"multi-line?": true}}
  }'
```

#### Due Cards
```bash
# Cards due today
mochi due list

# Cards due on specific date
mochi due list --date "2026-01-15T00:00:00.000Z"

# Due cards in a specific deck
mochi due list-by-deck --deck-id <deck-id>
```

### Global Options

- `--api-key <key>` - API key for authentication
- `--help, -h` - Show help
- `--version, -v` - Show version

## API Documentation

See the official [Mochi API Reference](https://mochi.cards/docs/api/) for more details about the underlying API.

## Project Structure

```
mochi-cli/
├── src/
│   ├── api/
│   │   ├── client.ts      # HTTP client with auth
│   │   ├── cards.ts       # Cards API
│   │   ├── decks.ts       # Decks API
│   │   ├── templates.ts   # Templates API
│   │   ├── due.ts         # Due cards API
│   │   └── index.ts       # API exports
│   ├── commands/
│   │   ├── card.ts        # Card commands
│   │   ├── deck.ts        # Deck commands
│   │   ├── template.ts    # Template commands
│   │   └── due.ts         # Due commands
│   ├── types/
│   │   └── index.ts       # TypeScript types
│   └── index.ts           # CLI entry point
├── completions/
│   ├── bash.sh            # Bash completion
│   └── zsh.sh             # Zsh completion
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
# Install dependencies
bun install

# Run in development mode (watch)
bun run dev

# Type check
bun run typecheck

# Build binary
bun run build

# Run tests
bun test
```

## License

MIT
