// Template commands

import { templates, setApiKey, MochiApiError } from "../api/index.ts";
import type { TemplateCreateInput, TemplateFields, TemplateFieldType, TemplateStyle, TemplateOptions } from "../types/index.ts";
import { unreachableCase } from "../utils.ts";
import type { TTemplateCommand } from "./types.ts";

function formatTemplate(template: unknown): string {
  return JSON.stringify(template, null, 2);
}

const VALID_FIELD_TYPES: TemplateFieldType[] = [
  "text", "boolean", "number", "draw", "ai", "speech", "image", 
  "translate", "transcription", "dictionary", "pinyin", "furigana"
];

const VALID_TEXT_ALIGNMENTS = ["left", "center", "right"];

function parseFields(fieldsStr?: string): TemplateFields | undefined {
  if (!fieldsStr) return undefined;
  
  try {
    const parsed = JSON.parse(fieldsStr);
    // Validate field types if provided
    for (const [key, field] of Object.entries(parsed)) {
      const f = field as Record<string, unknown>;
      if (f.type && !VALID_FIELD_TYPES.includes(f.type as TemplateFieldType)) {
        throw new Error(`Field "${key}" has invalid type: ${f.type}. Must be one of: ${VALID_FIELD_TYPES.join(", ")}`);
      }
      // Ensure id is set
      if (!f.id) f.id = key;
    }
    return parsed as TemplateFields;
  } catch (error) {
    throw new Error(`Invalid fields JSON: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function parseStyle(styleStr?: string): TemplateStyle | undefined {
  if (!styleStr) return undefined;
  
  try {
    const parsed = JSON.parse(styleStr) as TemplateStyle;
    if (parsed["text-alignment"] && !VALID_TEXT_ALIGNMENTS.includes(parsed["text-alignment"])) {
      throw new Error(`Invalid text-alignment: ${parsed["text-alignment"]}. Must be one of: ${VALID_TEXT_ALIGNMENTS.join(", ")}`);
    }
    return parsed;
  } catch (error) {
    throw new Error(`Invalid style JSON: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function parseOptions(optionsStr?: string): TemplateOptions | undefined {
  if (!optionsStr) return undefined;
  
  try {
    return JSON.parse(optionsStr) as TemplateOptions;
  } catch (error) {
    throw new Error(`Invalid options JSON: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function buildCreateInput(args: Record<string, unknown>): TemplateCreateInput {
  const name = args.name as string | undefined;
  const content = args.content as string | undefined;
  const fields = parseFields(args.fields as string);
  
  if (!name) throw new Error("--name is required");
  if (!content) throw new Error("--content is required");
  if (!fields) throw new Error("--fields is required");
  
  const input: TemplateCreateInput = {
    name,
    content,
    fields,
  };
  
  if (args.pos) input.pos = args.pos as string;
  if (args.style) input.style = parseStyle(args.style as string);
  if (args.options) input.options = parseOptions(args.options as string);
  
  return input;
}

export async function handleTemplateCommand(
  action: TTemplateCommand["subcommand"],
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
          for await (const template of templates.listAll(params)) {
            console.log(formatTemplate(template));
          }
        } else {
          const result = await templates.list(params);
          console.log(formatTemplate(result));
        }
        break;
      }
      
      case "get": {
        const id = args.id as string;
        if (!id) throw new Error("Template ID is required");
        const template = await templates.get(id);
        console.log(formatTemplate(template));
        break;
      }
      
      case "create": {
        const input = buildCreateInput(args);
        const template = await templates.create(input);
        console.log(formatTemplate(template));
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
