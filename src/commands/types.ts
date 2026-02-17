import { type } from "arktype"

export const DeckCommands = type('"list" | "get" | "create" | "update" | "delete"')
export type TDeckCommands = typeof DeckCommands.infer

export const CardCommands = type('"list" | "get" | "create" | "update" | "delete" | "add-attachment" | "delete-attachment"')
export type TCardCommands = typeof CardCommands.infer

export const TemplateCommands = type('"list" | "get" | "create"')
export type TTemplateCommands = typeof TemplateCommands.infer

export const DueCommands = type('"list" | "list-by-deck"')
export type TDueCommands = typeof DueCommands.infer
