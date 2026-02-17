export interface FormattedError {
  title: string;
  description: string;
  invalidValue?: string;
  validOptions: string[];
  suggestions?: string[];
  helpText: string;
  example?: string;
}

export interface ValidationInput {
  command?: string;
  subcommand?: string;
}

export interface Output {
  write: (str: string) => void;
}

export interface PrintOptions {
  output?: Output;
}
