// Templates API

import { getClient } from "./client.ts";
import type { 
  Template, 
  TemplateListParams, 
  TemplateCreateInput, 
  PaginatedResponse 
} from "../types/index.ts";

export class TemplatesApi {
  private get client() {
    return getClient();
  }

  async list(params?: TemplateListParams): Promise<PaginatedResponse<Template>> {
    return this.client.get<PaginatedResponse<Template>>("/templates", params);
  }

  async *listAll(params?: Omit<TemplateListParams, "bookmark">): AsyncGenerator<Template, void, unknown> {
    yield* this.client.paginate<Template>("/templates", params);
  }

  async get(id: string): Promise<Template> {
    return this.client.get<Template>(`/templates/${encodeURIComponent(id)}`);
  }

  async create(input: TemplateCreateInput): Promise<Template> {
    return this.client.post<Template>("/templates", input);
  }
}

export const templates = new TemplatesApi();
