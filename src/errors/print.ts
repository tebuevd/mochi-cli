import type { ArkErrors } from "arktype";
import { formatCliErrors } from "./format-cli-errors.ts";
import type { FormattedError, PrintOptions, ValidationInput } from "./types.ts";

export function printFormattedError(
  error: FormattedError,
  options: PrintOptions = {}
): void {
  const { output = { write: (s: string) => process.stderr.write(s) } } = options;
  const writeLine = (str = ""): void => output.write(str + "\n");

  writeLine(`Error: ${error.title}`);
  writeLine();
  writeLine(error.description);
  writeLine();

  if (error.validOptions.length > 0) {
    writeLine("Available options:");
    for (const option of error.validOptions) {
      writeLine(`  • ${option}`);
    }
    writeLine();
  }

  if (error.suggestions && error.suggestions.length > 0) {
    writeLine(
      `Did you mean: ${error.suggestions.map((s) => `"${s}"`).join(" or ")}?`
    );
  } else if (error.helpText) {
    writeLine(error.helpText);
  }

  if (error.example) {
    writeLine();
    writeLine(`Example: ${error.example}`);
  }
}

export function printSimpleError(message: string, options: PrintOptions = {}): void {
  const { output = { write: (s: string) => process.stderr.write(s) } } = options;
  output.write(`Error: ${message}\n`);
}

export function formatAndPrintErrors(
  errors: ArkErrors,
  input: ValidationInput,
  options: PrintOptions = {}
): void {
  const formatted = formatCliErrors(errors, input);
  printFormattedError(formatted, options);
}
