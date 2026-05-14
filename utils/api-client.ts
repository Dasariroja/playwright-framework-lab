import { APIRequestContext, APIResponse, request } from '@playwright/test';

export class ApiClient {
  private context: APIRequestContext | null = null;
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async init(): Promise<void> {
    if (!this.context) {
      this.context = await request.newContext({
        baseURL: this.baseURL,
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
    }
  }

  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
  }

  async get(
    url: string,
    options: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
    } = {}
  ): Promise<APIResponse> {
    await this.init();
    return this.context!.get(url, {
      params: options.params,
      headers: options.headers,
    });
  }

  /**
   * Send a POST request
   */
  async post(
    url: string,
    options: {
      data?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<APIResponse> {
    await this.init();
    return this.context!.post(url, {
      data: options.data,
      headers: options.headers,
    });
  }

  /**
   * Send a PUT request
   */
  async put(
    url: string,
    options: {
      data?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<APIResponse> {
    await this.init();
    return this.context!.put(url, {
      data: options.data,
      headers: options.headers,
    });
  }

  /**
   * Send a DELETE request
   */
  async delete(
    url: string,
    options: {
      headers?: Record<string, string>;
    } = {}
  ): Promise<APIResponse> {
    await this.init();
    return this.context!.delete(url, {
      headers: options.headers,
    });
  }

  /**
   * Parse response body as JSON
   */
  async getJsonResponse(response: APIResponse): Promise<any> {
    return response.json();
  }
}