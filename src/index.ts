#!/usr/bin/env bun
// Mochi CLI - A command-line interface for Mochi Cards

import { handleCardCommand } from "./commands/card.ts";
import { handleDeckCommand } from "./commands/deck.ts";
import { handleTemplateCommand } from "./commands/template.ts";
import { handleDueCommand } from "./commands/due.ts";
import { setApiKey } from "./api/index.ts";
import { Command, type TCommand } from "./commands/commands.ts";
import { type } from "arktype";
import { unreachableCase } from "./utils.ts";
import { formatAndPrintErrors, printSimpleError } from "./errors";

const VERSION = "0.1.0";

function printHelp(): void {
  console.log(`
Mochi CLI v${VERSION}

A command-line interface for Mochi Cards (https://mochi.cards)

USAGE:
  mochi <command> <action> [options]

GLOBAL OPTIONS:
  --api-key <key>      API key for authentication (or set MOCHI_API_KEY env var)
  --help, -h           Show this help message
  --version, -v        Show version number

COMMANDS:

  card
    list [options]              List cards
      --deck-id <id>            Filter by deck ID
      --limit <n>               Number of cards per page (default: 10, max: 100)
      --bookmark <token>        Pagination bookmark
      --all                     Stream all cards (ignores limit/bookmark)
    
    get <id>                    Get a single card by ID
    
    create [options]            Create a new card
      --content <text>          Card content (markdown) (required)
      --deck-id <id>            Deck ID (required)
      --template-id <id>        Template ID
      --archived                Mark as archived
      --review-reverse          Enable reverse review
      --pos <position>          Position for sorting
      --manual-tags <tags>      Comma-separated tags (e.g., "tag1,tag2")
      --fields <json>           Fields as JSON object
    
    update <id> [options]       Update a card
      --content <text>          New content
      --deck-id <id>            New deck ID
      --template-id <id>        New template ID (or "null" to remove)
      --archived                Mark as archived
      --trashed <timestamp>     Trash the card (ISO 8601 timestamp)
      --review-reverse          Enable reverse review
      --pos <position>          New position
      --manual-tags <tags>      Comma-separated tags
      --fields <json>           Fields as JSON object
    
    delete <id>                 Delete a card permanently
    
    add-attachment <id> [options]  Add an attachment to a card
      --file <path>             File path (required)
      --filename <name>         Custom filename for attachment
    
    delete-attachment <id> [options] Delete an attachment
      --filename <name>         Filename to delete (required)

  deck
    list [options]              List decks
      --bookmark <token>        Pagination bookmark
      --all                     Stream all decks
    
    get <id>                    Get a single deck by ID
    
    create [options]            Create a new deck
      --name <name>             Deck name (required)
      --parent-id <id>          Parent deck ID for nesting
      --sort <n>                Sort order number
      --archived                Mark as archived
      --trashed <timestamp>     Trash the deck
      --sort-by <method>        Sort method: none, lexigraphically, lexicographically,
                                created-at, updated-at, retention-rate-asc, interval-length
      --cards-view <view>       View mode: list, grid, note, column
      --show-sides              Show all card sides
      --sort-by-direction       Reverse sort order
      --review-reverse          Enable reverse review
    
    update <id> [options]       Update a deck
      (same options as create)
    
    delete <id>                 Delete a deck permanently

  template
    list [options]              List templates
      --bookmark <token>        Pagination bookmark
      --all                     Stream all templates
    
    get <id>                    Get a single template by ID
    
    create [options]            Create a new template
      --name <name>             Template name (required)
      --content <text>          Template content with <<Field>> placeholders (required)
      --pos <position>          Position for sorting
      --fields <json>           Fields definition as JSON (required)
                                Example: '{"front":{"id":"front","name":"Front","type":"text"}}'
      --style <json>            Style options as JSON
                                Example: '{"text-alignment":"center"}'
      --options <json>          Template options as JSON
                                Example: '{"show-sides-separately?":true}'

  due
    list [options]              List all cards due today
      --date <timestamp>        Due date (ISO 8601, default: today)
    
    list-by-deck [options]      List cards due in a specific deck
      --deck-id <id>            Deck ID (required)
      --date <timestamp>        Due date (ISO 8601, default: today)

EXAMPLES:
  # List all cards in a deck
  mochi card list --deck-id abc123 --all

  # Create a simple card
  mochi card create --content "# Question\\nAnswer" --deck-id abc123

  # Create a card with fields
  mochi card create --content "# <<Front>>" --deck-id abc123 \\
    --template-id tmpl123 \\
    --fields '{"front":{"id":"front","value":"Hello"}}'

  # Get a specific card
  mochi card get card123

  # List all decks
  mochi deck list --all

  # Create a deck
  mochi deck create --name "My New Deck" --parent-id parent123

  # List due cards
  mochi due list --date "2026-01-15T00:00:00.000Z"

ENVIRONMENT VARIABLES:
  MOCHI_API_KEY       Your Mochi API key (get from Account Settings in the app)

For more information, visit: https://mochi.cards/docs/api/
`);
}

function printVersion(): void {
  console.log(`mochi v${VERSION}`);
}

function parseArgs(argv: string[]): {
  command: string;
  action: string;
  args: Record<string, unknown>;
  globalArgs: { "api-key"?: string; help?: boolean; version?: boolean };
} {
  const globalArgs: { "api-key"?: string; help?: boolean; version?: boolean } = {};
  const args: Record<string, unknown> = {};

  // First, scan for global flags anywhere in the args
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      globalArgs.help = true;
    } else if (arg === "--version" || arg === "-v") {
      globalArgs.version = true;
    } else if (arg === "--api-key") {
      globalArgs["api-key"] = argv[++i];
    }
  }

  // If help or version is requested, return early
  if (globalArgs.help || globalArgs.version) {
    return { command: "", action: "", args, globalArgs };
  }

  // Find command (first non-flag)
  let command = "";
  let commandIndex = -1;
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) {
      command = argv[i];
      commandIndex = i;
      break;
    }
  }

  if (!command) {
    return { command: "", action: "", args, globalArgs };
  }

  // Find action (second non-flag)
  let action = "";
  let actionIndex = -1;
  for (let i = commandIndex + 1; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) {
      action = argv[i];
      actionIndex = i;
      break;
    }
  }

  // Parse all remaining arguments after the action
  for (let i = actionIndex + 1; i < argv.length; i++) {
    const arg = argv[i];

    // Skip global flags (already processed)
    if (arg === "--help" || arg === "-h" || arg === "--version" || arg === "-v" ||
      arg === "--api-key" || (i > 0 && argv[i - 1] === "--api-key")) {
      continue;
    }

    // Boolean flags
    if (arg === "--archived" || arg === "--review-reverse" || arg === "--show-sides" ||
      arg === "--sort-by-direction" || arg === "--all") {
      const key = arg.replace(/^--/, "").replace(/-$/, "");
      args[key] = true;
      continue;
    }

    // Key-value arguments
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[i + 1];

      // Check if next arg is a value (not a flag)
      if (value && !value.startsWith("--") && !value.startsWith("-")) {
        args[key] = value;
        i++; // Skip next argument since we consumed it
      } else {
        // Boolean flag without value
        args[key] = true;
      }
    } else if (!args.id) {
      // Positional argument (typically ID for get/update/delete)
      args.id = arg;
    }
  }

  return { command, action, args, globalArgs };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  if (argv.length === 0) {
    printHelp();
    process.exit(0);
  }

  let { command: rawCommand, action: rawSubcommand, args, globalArgs } = parseArgs(argv);

  if (globalArgs.help) {
    printHelp();
    process.exit(0);
  }

  if (globalArgs.version) {
    printVersion();
    process.exit(0);
  }

  // Set up API key if provided
  if (globalArgs["api-key"]) {
    setApiKey(globalArgs["api-key"]);
  }

  // Validate combined command structure
  if (!rawCommand) {
    printSimpleError("No command provided");
    console.error("");
    console.error("Available commands: card, deck, template, due, help");
    console.error("Example: mochi deck list");
    process.exit(1);
  }

  // Default subcommand for "due" is "list"
  const subcommand = rawCommand === "due" && !rawSubcommand ? "list" : rawSubcommand;

  const parsed = Command({ command: rawCommand, subcommand });
  if (parsed instanceof type.errors) {
    formatAndPrintErrors(parsed, { command: rawCommand, subcommand });
    process.exit(1);
  }

  try {
    await handleCommand(parsed, args, globalArgs);
  } catch (error) {
    if (error instanceof Error) {
      printSimpleError(error.message);
    } else {
      printSimpleError(String(error));
    }
    process.exit(1);
  }
}

async function handleCommand(
  cmd: TCommand,
  args: Record<string, unknown>,
  globalArgs: { "api-key"?: string }
): Promise<void> {
  switch (cmd.command) {
    case "card":
      await handleCardCommand(cmd.subcommand, args, globalArgs);
      break;
    case "deck":
      await handleDeckCommand(cmd.subcommand, args, globalArgs);
      break;
    case "template":
      await handleTemplateCommand(cmd.subcommand, args, globalArgs);
      break;
    case "due":
      await handleDueCommand(cmd.subcommand, args, globalArgs);
      break;
    case "help":
      printHelp();
      break;
    default:
      return unreachableCase(cmd, Promise.resolve(undefined));
  }
}

main();
