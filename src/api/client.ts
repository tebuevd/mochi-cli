// HTTP Client for Mochi API

import type { ApiError, PaginatedResponse } from "../types/index.ts";

const BASE_URL = "https://app.mochi.cards/api";
const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 500;
const MAX_RETRY_DELAY_MS = 10000;
const PAGINATION_DELAY_MS = 75;

export class MochiApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: string[] | Record<string, string>
  ) {
    super(message);
    this.name = "MochiApiError";
  }
}

export class MochiClient {
  private _apiKey: string;
  private static requestQueue: Promise<void> = Promise.resolve();

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim() === "") {
      throw new Error("API key is required");
    }
    this._apiKey = apiKey;
  }

  get apiKey(): string {
    return this._apiKey;
  }

  private getAuthHeader(): string {
    // HTTP Basic Auth: base64(apiKey:)
    const credentials = `${this._apiKey}:`;
    return `Basic ${btoa(credentials)}`;
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  private parseRetryAfterMs(retryAfterHeader: string | null): number | null {
    if (!retryAfterHeader) return null;

    const seconds = Number(retryAfterHeader);
    if (!Number.isNaN(seconds) && Number.isFinite(seconds) && seconds >= 0) {
      return seconds * 1000;
    }

    const dateMs = Date.parse(retryAfterHeader);
    if (!Number.isNaN(dateMs)) {
      return Math.max(0, dateMs - Date.now());
    }

    return null;
  }

  private getRetryDelayMs(attempt: number, response?: Response): number {
    const retryAfterMs = this.parseRetryAfterMs(response?.headers.get("retry-after") ?? null);
    if (retryAfterMs !== null) {
      return Math.min(Math.max(250, retryAfterMs), MAX_RETRY_DELAY_MS);
    }

    const backoff = Math.min(BASE_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS);
    const jitter = Math.floor(Math.random() * 250);
    return backoff + jitter;
  }

  private async withConcurrencyLimit<T>(fn: () => Promise<T>): Promise<T> {
    const run = MochiClient.requestQueue.then(fn, fn);
    MochiClient.requestQueue = run.then(() => undefined, () => undefined);
    return run;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    const url = `${BASE_URL}${path}`;

    const headers: Record<string, string> = {
      "Authorization": this.getAuthHeader(),
      "Accept": "application/json",
      ...additionalHeaders,
    };

    if (body && !(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    return this.withConcurrencyLimit(async () => {
      let lastNetworkError: unknown;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        let response: Response;

        try {
          response = await fetch(url, options);
        } catch (error) {
          lastNetworkError = error;

          if (attempt < MAX_RETRIES) {
            await this.sleep(this.getRetryDelayMs(attempt));
            continue;
          }

          throw new MochiApiError(
            `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
            0
          );
        }

        if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_RETRIES) {
          await this.sleep(this.getRetryDelayMs(attempt, response));
          continue;
        }

        // Handle empty responses (like DELETE)
        if (response.status === 204 || response.headers.get("content-length") === "0") {
          return undefined as T;
        }

        let data: unknown;
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          try {
            data = await response.json();
          } catch {
            data = null;
          }
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          const errorData = data as ApiError;
          const errorMessage = typeof errorData?.errors === "string"
            ? errorData.errors
            : Array.isArray(errorData?.errors)
              ? errorData.errors.join(", ")
              : errorData?.errors
                ? Object.entries(errorData.errors).map(([k, v]) => `${k}: ${v}`).join(", ")
                : `HTTP ${response.status}: ${response.statusText}`;

          throw new MochiApiError(
            errorMessage || `Request failed with status ${response.status}`,
            response.status,
            errorData?.errors
          );
        }

        return data as T;
      }

      throw new MochiApiError(
        `Network error: ${lastNetworkError instanceof Error ? lastNetworkError.message : "Unknown error"}`,
        0
      );
    });
  }

  async get<T>(path: string, queryParams?: Record<string, string | number | undefined>): Promise<T> {
    let url = path;
    if (queryParams) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      }
      const queryString = params.toString();
      if (queryString) {
        url = `${path}?${queryString}`;
      }
    }
    return this.request<T>("GET", url);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }

  // Helper to handle pagination for list endpoints
  async *paginate<T>(
    path: string,
    params: Record<string, string | number | undefined> = {},
    limit?: number
  ): AsyncGenerator<T, void, unknown> {
    let bookmark: string | undefined;

    while (true) {
      const response = await this.get<PaginatedResponse<T>>(path, {
        ...params,
        bookmark,
        limit,
      });

      const docs = response.docs ?? [];
      for (const doc of docs) {
        yield doc;
      }

      const nextBookmark = response.bookmark;
      if (!nextBookmark || docs.length === 0 || nextBookmark === bookmark) {
        break;
      }

      bookmark = nextBookmark;
      await this.sleep(PAGINATION_DELAY_MS);
    }
  }
}

// Singleton instance management
let clientInstance: MochiClient | null = null;
let globalApiKey: string | undefined;

export function setApiKey(apiKey: string): void {
  globalApiKey = apiKey;
  // Reset client so it will be recreated with new key
  clientInstance = null;
}

export function getClient(): MochiClient {
  if (clientInstance) {
    return clientInstance;
  }
  
  const key = globalApiKey || process.env.MOCHI_API_KEY;
  if (!key) {
    throw new Error(
      "API key is required. Set MOCHI_API_KEY environment variable or provide --api-key option."
    );
  }
  
  clientInstance = new MochiClient(key);
  return clientInstance;
}

export function resetClient(): void {
  clientInstance = null;
  globalApiKey = undefined;
}
