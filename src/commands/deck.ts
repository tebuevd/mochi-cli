// Deck commands

import { decks, setApiKey, MochiApiError } from "../api/index.ts";
import type { DeckCreateInput, DeckUpdateInput, DeckSortBy, DeckCardsView } from "../types/index.ts";
import { unreachableCase } from "../utils.ts";
import type { TDeckCommand } from "./commands.ts";

function formatDeck(deck: unknown): string {
  return JSON.stringify(deck, null, 2);
}

const VALID_SORT_BY: DeckSortBy[] = [
  "none", "lexigraphically", "lexicographically", "created-at", "updated-at",
  "retention-rate-asc", "interval-length"
];

const VALID_CARDS_VIEW: DeckCardsView[] = ["list", "grid", "note", "column"];

function buildCreateInput(args: Record<string, unknown>): DeckCreateInput {
  const name = args.name as string | undefined;
  if (!name) throw new Error("--name is required");

  const input: DeckCreateInput = { name };

  if (args["parent-id"]) input["parent-id"] = args["parent-id"] as string;
  if (args.sort !== undefined) input.sort = Number(args.sort);
  if (args["archived"] !== undefined) input["archived?"] = Boolean(args["archived"]);
  if (args["trashed"] !== undefined) input["trashed?"] = args["trashed"] as string;
  if (args["show-sides"] !== undefined) input["show-sides?"] = Boolean(args["show-sides"]);
  if (args["sort-by-direction"] !== undefined) input["sort-by-direction"] = Boolean(args["sort-by-direction"]);
  if (args["review-reverse"] !== undefined) input["review-reverse?"] = Boolean(args["review-reverse"]);

  if (args["sort-by"]) {
    const sortBy = args["sort-by"] as string;
    if (!VALID_SORT_BY.includes(sortBy as DeckSortBy)) {
      throw new Error(`Invalid sort-by: ${sortBy}. Must be one of: ${VALID_SORT_BY.join(", ")}`);
    }
    input["sort-by"] = sortBy as DeckSortBy;
  }

  if (args["cards-view"]) {
    const cardsView = args["cards-view"] as string;
    if (!VALID_CARDS_VIEW.includes(cardsView as DeckCardsView)) {
      throw new Error(`Invalid cards-view: ${cardsView}. Must be one of: ${VALID_CARDS_VIEW.join(", ")}`);
    }
    input["cards-view"] = cardsView as DeckCardsView;
  }

  return input;
}

function buildUpdateInput(args: Record<string, unknown>): DeckUpdateInput {
  const input: DeckUpdateInput = {};

  if (args.name !== undefined) input.name = args.name as string;
  if (args["parent-id"] !== undefined) input["parent-id"] = args["parent-id"] as string | null;
  if (args.sort !== undefined) input.sort = Number(args.sort);
  if (args["archived"] !== undefined) input["archived?"] = Boolean(args["archived"]);
  if (args["trashed"] !== undefined) input["trashed?"] = args["trashed"] as string | null;
  if (args["show-sides"] !== undefined) input["show-sides?"] = Boolean(args["show-sides"]);
  if (args["sort-by-direction"] !== undefined) input["sort-by-direction"] = Boolean(args["sort-by-direction"]);
  if (args["review-reverse"] !== undefined) input["review-reverse?"] = Boolean(args["review-reverse"]);

  if (args["sort-by"] !== undefined) {
    const sortBy = args["sort-by"] as string;
    if (!VALID_SORT_BY.includes(sortBy as DeckSortBy)) {
      throw new Error(`Invalid sort-by: ${sortBy}. Must be one of: ${VALID_SORT_BY.join(", ")}`);
    }
    input["sort-by"] = sortBy as DeckSortBy;
  }

  if (args["cards-view"] !== undefined) {
    const cardsView = args["cards-view"] as string;
    if (!VALID_CARDS_VIEW.includes(cardsView as DeckCardsView)) {
      throw new Error(`Invalid cards-view: ${cardsView}. Must be one of: ${VALID_CARDS_VIEW.join(", ")}`);
    }
    input["cards-view"] = cardsView as DeckCardsView;
  }

  return input;
}

export async function handleDeckCommand(
  action: TDeckCommand["subcommand"],
  args: Record<string, unknown>,
  globalArgs: { "api-key"?: string }
): Promise<void> {
  if (globalArgs["api-key"]) {
    setApiKey(globalArgs["api-key"]);
  }

  try {
    switch (action) {
      case "list": {
        const params: { bookmark?: string } = {};
        if (args.bookmark) params.bookmark = args.bookmark as string;
        if (args.all) {
          for await (const deck of decks.listAll(params)) {
            console.log(formatDeck(deck));
          }
        } else {
          const result = await decks.list(params);
          console.log(formatDeck(result));
        }
        break;
      }

      case "get": {
        const id = args.id as string;
        if (!id) throw new Error("Deck ID is required");
        const deck = await decks.get(id);
        console.log(formatDeck(deck));
        break;
      }

      case "create": {
        const input = buildCreateInput(args);
        const deck = await decks.create(input);
        console.log(formatDeck(deck));
        break;
      }

      case "update": {
        const id = args.id as string;
        if (!id) throw new Error("Deck ID is required");
        const input = buildUpdateInput(args);
        const deck = await decks.update(id, input);
        console.log(formatDeck(deck));
        break;
      }

      case "delete": {
        const id = args.id as string;
        if (!id) throw new Error("Deck ID is required");
        await decks.delete(id);
        console.log(JSON.stringify({ success: true, message: "Deck deleted" }));
        break;
      }

      default:
        return unreachableCase(action, Promise.resolve(undefined))
    }
  } catch (error) {
    if (error instanceof MochiApiError) {
      console.error(JSON.stringify({
        error: error.message,
        statusCode: error.statusCode,
        details: error.errors
      }, null, 2));
      process.exit(1);
    }
    throw error;
  }
}
