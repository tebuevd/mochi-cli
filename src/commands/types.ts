import { type } from "arktype"

export const DeckCommands = type('"list" | "get" | "create" | "update" | "delete"')
export type TDeckCommands = typeof DeckCommands.infer
