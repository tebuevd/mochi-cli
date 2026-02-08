// Decks API

import { getClient } from "./client.ts";
import type { 
  Deck, 
  DeckListParams, 
  DeckCreateInput, 
  DeckUpdateInput, 
  PaginatedResponse 
} from "../types/index.ts";

export class DecksApi {
  private get client() {
    return getClient();
  }

  async list(params?: DeckListParams): Promise<PaginatedResponse<Deck>> {
    return this.client.get<PaginatedResponse<Deck>>("/decks", params);
  }

  async *listAll(params?: Omit<DeckListParams, "bookmark">): AsyncGenerator<Deck, void, unknown> {
    yield* this.client.paginate<Deck>("/decks", params);
  }

  async get(id: string): Promise<Deck> {
    return this.client.get<Deck>(`/decks/${encodeURIComponent(id)}`);
  }

  async create(input: DeckCreateInput): Promise<Deck> {
    return this.client.post<Deck>("/decks", input);
  }

  async update(id: string, input: DeckUpdateInput): Promise<Deck> {
    return this.client.post<Deck>(`/decks/${encodeURIComponent(id)}`, input);
  }

  async delete(id: string): Promise<void> {
    return this.client.delete<void>(`/decks/${encodeURIComponent(id)}`);
  }
}

export const decks = new DecksApi();
