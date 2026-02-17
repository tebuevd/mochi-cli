import { type } from "arktype"

const CardCommand = type({
  command: "'card'",
  subcommand: "'list' | 'get' | 'create' | 'update' | 'delete' | 'add-attachment' | 'delete-attachment'"
})

const DeckCommand = type({
  command: "'deck'",
  subcommand: "'list' | 'get' | 'create' | 'update' | 'delete'"
})

const TemplateCommand = type({
  command: "'template'",
  subcommand: "'list' | 'get' | 'create'"
})

const DueCommand = type({
  command: "'due'",
  subcommand: "'list' | 'list-by-deck'"
})

const HelpCommand = type({
  command: "'help'"
})

export const Command = CardCommand.or(DeckCommand).or(TemplateCommand).or(DueCommand).or(HelpCommand)

export type TCommand = typeof Command.infer
export type TCardCommand = typeof CardCommand.infer
export type TDeckCommand = typeof DeckCommand.infer
export type TTemplateCommand = typeof TemplateCommand.infer
export type TDueCommand = typeof DueCommand.infer
export type THelpCommand = typeof HelpCommand.infer
