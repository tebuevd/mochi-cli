import type { ArkErrors } from "arktype";
import {
  TOP_LEVEL_COMMANDS,
  getActionsForCommand,
  type TopLevelCommand,
} from "../commands/commands.ts";
import { formatActualValue } from "./arktype.ts";
import { findClosestMatches } from "./fuzzy.ts";
import type { FormattedError, ValidationInput } from "./types.ts";

type CommandWithActions = Exclude<TopLevelCommand, "help">;

export function formatCliErrors(
  errors: ArkErrors,
  input: ValidationInput
): FormattedError {
  for (const error of errors) {
    const path = error.path.join(".");
    const actual = formatActualValue(error.actual);

    if (path === "command") return formatUnknownCommandError(actual);

    if (path === "subcommand") {
      const command = input.command as CommandWithActions;
      return actual
        ? formatInvalidActionError(command, actual)
        : formatMissingActionError(command);
    }
  }

  return {
    title: "Invalid command",
    description: "The command you entered could not be parsed.",
    validOptions: [...TOP_LEVEL_COMMANDS],
    helpText: "Please check your command and try again.",
    example: "mochi deck list",
  };
}

function formatUnknownCommandError(invalidCommand: string): FormattedError {
  const suggestions = findClosestMatches(invalidCommand, TOP_LEVEL_COMMANDS, 2);

  return {
    title: `Unknown command: ${invalidCommand}`,
    description: `${invalidCommand} is not a valid Mochi CLI command.`,
    invalidValue: invalidCommand,
    validOptions: [...TOP_LEVEL_COMMANDS],
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    helpText:
      suggestions.length > 0
        ? didYouMeanText(suggestions)
        : "Use one of the available commands listed above.",
    example: "mochi deck list",
  };
}

function formatMissingActionError(command: CommandWithActions): FormattedError {
  const validActions = getActionsForCommand(command);

  return {
    title: `Missing action for "${command}" command`,
    description: `The "${command}" command requires an action to perform.`,
    validOptions: [...validActions],
    helpText: `Specify an action after "${command}"`,
    example: `mochi ${command} ${validActions[0]}`,
  };
}

function formatInvalidActionError(
  command: CommandWithActions,
  invalidAction: string
): FormattedError {
  const validActions = getActionsForCommand(command);
  const suggestions = findClosestMatches(invalidAction, validActions, 2);

  return {
    title: `Unknown action: ${invalidAction}`,
    description: `${invalidAction} is not a valid action for the "${command}" command.`,
    invalidValue: invalidAction,
    validOptions: [...validActions],
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    helpText:
      suggestions.length > 0
        ? didYouMeanText(suggestions)
        : `Use one of the available actions for "${command}"`,
    example: `mochi ${command} ${validActions[0]}`,
  };
}

function didYouMeanText(suggestions: readonly string[]): string {
  return `Did you mean: ${suggestions.map((s) => `"${s}"`).join(" or ")}?`;
}
