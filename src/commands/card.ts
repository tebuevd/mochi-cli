// Card commands

import { cards, setApiKey, MochiApiError } from "../api/index.ts";
import type { CardCreateInput, CardUpdateInput, CardFields } from "../types/index.ts";
import { unreachableCase } from "../utils.ts";
import type { TCardCommand } from "./commands.ts";

function formatCard(card: unknown): string {
  return JSON.stringify(card, null, 2);
}

function parseFields(fieldsStr?: string): CardFields | undefined {
  if (!fieldsStr) return undefined;
  
  try {
    const parsed = JSON.parse(fieldsStr);
    // Validate that it's a proper fields object
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") {
        // Convert simple string values to proper field format
        parsed[key] = { id: key, value };
      } else if (value && typeof value === "object" && !("id" in value && "value" in value)) {
        throw new Error(`Field "${key}" must have "id" and "value" properties or be a string`);
      }
    }
    return parsed as CardFields;
  } catch (error) {
    throw new Error(`Invalid fields JSON: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function buildCreateInput(args: Record<string, unknown>): CardCreateInput {
  const content = args.content as string | undefined;
  const deckId = args["deck-id"] as string | undefined;
  
  if (!content) throw new Error("--content is required");
  if (!deckId) throw new Error("--deck-id is required");
  
  const input: CardCreateInput = {
    content,
    "deck-id": deckId,
  };
  
  if (args["template-id"]) input["template-id"] = args["template-id"] as string;
  if (args["archived"] !== undefined) input["archived?"] = Boolean(args["archived"]);
  if (args["review-reverse"] !== undefined) input["review-reverse?"] = Boolean(args["review-reverse"]);
  if (args.pos) input.pos = args.pos as string;
  if (args["manual-tags"]) input["manual-tags"] = (args["manual-tags"] as string).split(",").map(t => t.trim());
  if (args.fields) input.fields = parseFields(args.fields as string);
  
  return input;
}

function buildUpdateInput(args: Record<string, unknown>): CardUpdateInput {
  const input: CardUpdateInput = {};
  
  if (args.content !== undefined) input.content = args.content as string;
  if (args["deck-id"] !== undefined) input["deck-id"] = args["deck-id"] as string;
  if (args["template-id"] !== undefined) input["template-id"] = args["template-id"] as string | null;
  if (args["archived"] !== undefined) input["archived?"] = Boolean(args["archived"]);
  if (args["trashed"] !== undefined) input["trashed?"] = args["trashed"] as string;
  if (args["review-reverse"] !== undefined) input["review-reverse?"] = Boolean(args["review-reverse"]);
  if (args.pos !== undefined) input.pos = args.pos as string;
  if (args["manual-tags"] !== undefined) input["manual-tags"] = (args["manual-tags"] as string).split(",").map(t => t.trim());
  if (args.fields !== undefined) input.fields = parseFields(args.fields as string);
  
  return input;
}

export async function handleCardCommand(
  action: TCardCommand["subcommand"],
  args: Record<string, unknown>,
  globalArgs: { "api-key"?: string }
): Promise<void> {
  if (globalArgs["api-key"]) {
    setApiKey(globalArgs["api-key"]);
  }
  
  try {
    switch (action) {
      case "list": {
        const params: Record<string, string | number | undefined> = {};
        if (args["deck-id"]) params["deck-id"] = args["deck-id"] as string;
        if (args.limit) params.limit = Number(args.limit);
        if (args.bookmark) params.bookmark = args.bookmark as string;
        if (args.all) {
          // Stream all cards
          for await (const card of cards.listAll(params)) {
            console.log(formatCard(card));
          }
        } else {
          const result = await cards.list(params);
          console.log(formatCard(result));
        }
        break;
      }
      
      case "get": {
        const id = args.id as string;
        if (!id) throw new Error("Card ID is required");
        const card = await cards.get(id);
        console.log(formatCard(card));
        break;
      }
      
      case "create": {
        const input = buildCreateInput(args);
        const card = await cards.create(input);
        console.log(formatCard(card));
        break;
      }
      
      case "update": {
        const id = args.id as string;
        if (!id) throw new Error("Card ID is required");
        const input = buildUpdateInput(args);
        const card = await cards.update(id, input);
        console.log(formatCard(card));
        break;
      }
      
      case "delete": {
        const id = args.id as string;
        if (!id) throw new Error("Card ID is required");
        await cards.delete(id);
        console.log(JSON.stringify({ success: true, message: "Card deleted" }));
        break;
      }
      
      case "add-attachment": {
        const id = args.id as string;
        const file = args.file as string;
        if (!id) throw new Error("Card ID is required");
        if (!file) throw new Error("--file is required");
        
        const filename = args.filename as string || file.split("/").pop() || "attachment";
        
        await cards.addAttachment(id, filename, file);
        console.log(JSON.stringify({ success: true, message: "Attachment added" }));
        break;
      }
      
      case "delete-attachment": {
        const id = args.id as string;
        const filename = args.filename as string;
        if (!id) throw new Error("Card ID is required");
        if (!filename) throw new Error("--filename is required");
        
        await cards.deleteAttachment(id, filename);
        console.log(JSON.stringify({ success: true, message: "Attachment deleted" }));
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
