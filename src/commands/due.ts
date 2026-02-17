// Due commands

import { due, setApiKey, MochiApiError } from "../api/index.ts";
import { unreachableCase } from "../utils.ts";
import type { TDueCommand } from "./types.ts";

export async function handleDueCommand(
  action: TDueCommand["subcommand"],
  args: Record<string, unknown>,
  globalArgs: { "api-key"?: string }
): Promise<void> {
  if (globalArgs["api-key"]) {
    setApiKey(globalArgs["api-key"]);
  }
  
  try {
    const params: { date?: string } = {};
    if (args.date) params.date = args.date as string;
    
    switch (action) {
      case "list": {
        const cards = await due.list(params);
        console.log(JSON.stringify({ cards }, null, 2));
        break;
      }
      
      case "list-by-deck": {
        const deckId = args["deck-id"] as string;
        if (!deckId) throw new Error("--deck-id is required");
        const cards = await due.listByDeck(deckId, params);
        console.log(JSON.stringify({ cards }, null, 2));
        break;
      }
      
      default:
        return unreachableCase(action, Promise.resolve(undefined));
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
