// Cards API

import { getClient } from "./client.ts";
import type { 
  Card, 
  CardListParams, 
  CardCreateInput, 
  CardUpdateInput, 
  PaginatedResponse 
} from "../types/index.ts";

export class CardsApi {
  private get client() {
    return getClient();
  }

  async list(params?: CardListParams): Promise<PaginatedResponse<Card>> {
    return this.client.get<PaginatedResponse<Card>>("/cards", params);
  }

  async *listAll(params?: Omit<CardListParams, "bookmark">): AsyncGenerator<Card, void, unknown> {
    yield* this.client.paginate<Card>("/cards", params);
  }

  async get(id: string): Promise<Card> {
    return this.client.get<Card>(`/cards/${encodeURIComponent(id)}`);
  }

  async create(input: CardCreateInput): Promise<Card> {
    return this.client.post<Card>("/cards", input);
  }

  async update(id: string, input: CardUpdateInput): Promise<Card> {
    return this.client.post<Card>(`/cards/${encodeURIComponent(id)}`, input);
  }

  async delete(id: string): Promise<void> {
    return this.client.delete<void>(`/cards/${encodeURIComponent(id)}`);
  }

  async addAttachment(cardId: string, filename: string, filePath: string): Promise<void> {
    const file = Bun.file(filePath);
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type || "application/octet-stream" });
    
    const formData = new FormData();
    formData.append("file", blob, filename);
    
    // Need to use raw request for form data
    const url = `https://app.mochi.cards/api/cards/${encodeURIComponent(cardId)}/attachments/${encodeURIComponent(filename)}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${this.client.apiKey}:`)}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload attachment: ${response.status} ${response.statusText}`);
    }
  }

  async deleteAttachment(cardId: string, filename: string): Promise<void> {
    return this.client.delete<void>(
      `/cards/${encodeURIComponent(cardId)}/attachments/${encodeURIComponent(filename)}`
    );
  }
}

export const cards = new CardsApi();
