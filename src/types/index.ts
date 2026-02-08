// Mochi API Types

// Common types
export interface Timestamp {
  date: string;
}

export interface PaginatedResponse<T> {
  docs: T[];
  bookmark?: string;
}

// Card types
export interface CardField {
  id: string;
  value: string;
}

export interface CardFields {
  [key: string]: CardField;
}

export interface Review {
  date: Timestamp;
  due: Timestamp;
  "remembered?": boolean;
}

export interface Card {
  id: string;
  "deck-id": string;
  content?: string;
  name?: string | null;
  pos?: string;
  "template-id"?: string | null;
  "archived?"?: boolean;
  "trashed?"?: string | null;
  "review-reverse?"?: boolean;
  "new?"?: boolean;
  "manual-tags"?: string[];
  tags?: string[];
  fields?: CardFields;
  references?: string[];
  reviews?: Review[];
  attachments?: Record<string, unknown>;
  "created-at"?: Timestamp;
  "updated-at"?: Timestamp;
}

export interface CardListParams {
  "deck-id"?: string;
  limit?: number;
  bookmark?: string;
  [key: string]: string | number | undefined;
}

export interface CardCreateInput {
  content: string;
  "deck-id": string;
  "template-id"?: string;
  "archived?"?: boolean;
  "review-reverse?"?: boolean;
  pos?: string;
  "manual-tags"?: string[];
  fields?: CardFields;
}

export interface CardUpdateInput {
  content?: string;
  "deck-id"?: string;
  "template-id"?: string | null;
  "archived?"?: boolean;
  "trashed?"?: string | null;
  "review-reverse?"?: boolean;
  pos?: string;
  "manual-tags"?: string[];
  fields?: CardFields;
}

// Deck types
export type DeckSortBy = "none" | "lexigraphically" | "lexicographically" | "created-at" | "updated-at" | "retention-rate-asc" | "interval-length";
export type DeckCardsView = "list" | "grid" | "note" | "column";
export type TextAlignment = "left" | "center" | "right";

export interface Deck {
  id: string;
  name: string;
  "parent-id"?: string | null;
  sort?: number;
  "trashed?"?: string | null;
  "archived?"?: boolean;
  "sort-by"?: DeckSortBy;
  "cards-view"?: DeckCardsView;
  "show-sides?"?: boolean;
  "sort-by-direction"?: boolean;
  "review-reverse?"?: boolean;
  "created-at"?: Timestamp;
  "updated-at"?: Timestamp;
}

export interface DeckListParams {
  bookmark?: string;
  [key: string]: string | undefined;
}

export interface DeckCreateInput {
  name: string;
  "parent-id"?: string;
  sort?: number;
  "trashed?"?: string;
  "archived?"?: boolean;
  "sort-by"?: DeckSortBy;
  "cards-view"?: DeckCardsView;
  "show-sides?"?: boolean;
  "sort-by-direction"?: boolean;
  "review-reverse?"?: boolean;
}

export interface DeckUpdateInput {
  name?: string;
  "parent-id"?: string | null;
  sort?: number;
  "trashed?"?: string | null;
  "archived?"?: boolean;
  "sort-by"?: DeckSortBy;
  "cards-view"?: DeckCardsView;
  "show-sides?"?: boolean;
  "sort-by-direction"?: boolean;
  "review-reverse?"?: boolean;
}

// Template field types
export type TemplateFieldType = 
  | "text" 
  | "boolean" 
  | "number" 
  | "draw" 
  | "ai" 
  | "speech" 
  | "image" 
  | "translate" 
  | "transcription" 
  | "dictionary" 
  | "pinyin" 
  | "furigana";

export interface TemplateFieldOptions {
  "multi-line?"?: boolean;
  "hide-term"?: unknown;
  "ai-task"?: unknown;
  [key: string]: unknown;
}

export interface TemplateField {
  id: string;
  name?: string;
  type?: TemplateFieldType;
  pos?: string;
  content?: string;
  options?: TemplateFieldOptions;
}

export interface TemplateFields {
  [key: string]: TemplateField;
}

export interface TemplateStyle {
  "text-alignment"?: TextAlignment;
}

export interface TemplateOptions {
  "show-sides-separately?"?: boolean;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  pos?: string;
  fields: TemplateFields;
  style?: TemplateStyle;
  options?: TemplateOptions;
}

export interface TemplateListParams {
  bookmark?: string;
  [key: string]: string | undefined;
}

export interface TemplateCreateInput {
  name: string;
  content: string;
  fields: TemplateFields;
  pos?: string;
  style?: TemplateStyle;
  options?: TemplateOptions;
}

// Due cards
export interface DueCardsResponse {
  cards: Card[];
}

export interface DueCardsParams {
  date?: string;
  [key: string]: string | undefined;
}

// API Error
export interface ApiError {
  errors?: string[] | Record<string, string>;
}
