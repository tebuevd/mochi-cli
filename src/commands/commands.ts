import { type } from "arktype";

type Quote<T extends string> = `'${T}'`;

type TupleToArktypeUnion<T extends readonly string[]> = T extends readonly [
  infer First,
  ...infer Rest,
]
  ? First extends string
    ? Rest extends readonly string[]
      ? Rest extends readonly []
        ? Quote<First>
        : `${Quote<First>} | ${TupleToArktypeUnion<Rest>}`
      : never
    : never
  : "never";

export const TOP_LEVEL_COMMANDS = ["card", "deck", "template", "due", "help"] as const;
export type TopLevelCommand = (typeof TOP_LEVEL_COMMANDS)[number];

export const CARD_ACTIONS = [
  "list",
  "get",
  "create",
  "update",
  "delete",
  "add-attachment",
  "delete-attachment",
] as const;

const CardSchema = type({
  command: "'card'" satisfies Quote<TopLevelCommand>,
  subcommand:
    "'list' | 'get' | 'create' | 'update' | 'delete' | 'add-attachment' | 'delete-attachment'" satisfies TupleToArktypeUnion<
      typeof CARD_ACTIONS
    >,
});

export type CardAction = (typeof CARD_ACTIONS)[number];
export type TCardCommand = typeof CardSchema.infer;

export const DECK_ACTIONS = ["list", "get", "create", "update", "delete"] as const;

const DeckSchema = type({
  command: "'deck'" satisfies Quote<TopLevelCommand>,
  subcommand:
    "'list' | 'get' | 'create' | 'update' | 'delete'" satisfies TupleToArktypeUnion<
      typeof DECK_ACTIONS
    >,
});

export type DeckAction = (typeof DECK_ACTIONS)[number];
export type TDeckCommand = typeof DeckSchema.infer;

export const TEMPLATE_ACTIONS = ["list", "get", "create"] as const;

const TemplateSchema = type({
  command: "'template'" satisfies Quote<TopLevelCommand>,
  subcommand: "'list' | 'get' | 'create'" satisfies TupleToArktypeUnion<
    typeof TEMPLATE_ACTIONS
  >,
});

export type TemplateAction = (typeof TEMPLATE_ACTIONS)[number];
export type TTemplateCommand = typeof TemplateSchema.infer;

export const DUE_ACTIONS = ["list", "list-by-deck"] as const;

const DueSchema = type({
  command: "'due'" satisfies Quote<TopLevelCommand>,
  subcommand: "'list' | 'list-by-deck'" satisfies TupleToArktypeUnion<
    typeof DUE_ACTIONS
  >,
});

export type DueAction = (typeof DUE_ACTIONS)[number];
export type TDueCommand = typeof DueSchema.infer;

export const HELP_ACTIONS = [] as const satisfies readonly [];

const HelpSchema = type({
  command: "'help'" satisfies Quote<TopLevelCommand>,
});

export type THelpCommand = typeof HelpSchema.infer;

export const Command = CardSchema.or(DeckSchema)
  .or(TemplateSchema)
  .or(DueSchema)
  .or(HelpSchema);

export type TCommand = typeof Command.infer;

export interface CommandActionMap {
  card: CardAction;
  deck: DeckAction;
  template: TemplateAction;
  due: DueAction;
  help: never;
}

const ACTIONS_BY_COMMAND = {
  card: CARD_ACTIONS,
  deck: DECK_ACTIONS,
  template: TEMPLATE_ACTIONS,
  due: DUE_ACTIONS,
  help: HELP_ACTIONS,
} as const satisfies { [K in keyof CommandActionMap]: readonly CommandActionMap[K][] };

export function getActionsForCommand(command: "help"): [];
export function getActionsForCommand<
  C extends Exclude<keyof CommandActionMap, "help">,
>(command: C): CommandActionMap[C][];
export function getActionsForCommand(command: keyof CommandActionMap): string[] {
  return [...ACTIONS_BY_COMMAND[command]];
}
