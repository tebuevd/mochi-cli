// Due Cards API

import { getClient } from "./client.ts";
import type { 
  Card, 
  DueCardsResponse, 
  DueCardsParams 
} from "../types/index.ts";

export class DueApi {
  private get client() {
    return getClient();
  }

  async list(params?: DueCardsParams): Promise<Card[]> {
    const response = await this.client.get<DueCardsResponse>("/due", params);
    return response.cards;
  }

  async listByDeck(deckId: string, params?: DueCardsParams): Promise<Card[]> {
    const response = await this.client.get<DueCardsResponse>(
      `/due/${encodeURIComponent(deckId)}`,
      params
    );
    return response.cards;
  }
}

export const due = new DueApi();
