import { ApiError, AuthenticationError, ApiResponse } from '@/types/api';

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let details: unknown;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
        details = errorData;
      } catch {
        // Response might not be JSON
      }

      if (response.status === 401) {
        throw new AuthenticationError(errorMessage);
      }

      throw new ApiError(errorMessage, response.status, details);
    }

    if (contentType && contentType.includes('application/json')) {
      const data: ApiResponse<T> = await response.json();
      
      if ('success' in data && !data.success) {
        throw new ApiError(data.error.message, 400, data.error.details);
      }

      return ('data' in data ? data.data : data) as T;
    }

    return response.text() as Promise<T>;
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value);
        }
      });
    }

    return url.toString();
  }

  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, ...init } = config;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeader(),
        ...init.headers,
      },
      ...init,
    });

    return this.parseResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    const { params, ...init } = config;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeader(),
        ...init.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...init,
    });

    return this.parseResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    const { params, ...init } = config;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeader(),
        ...init.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...init,
    });

    return this.parseResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    const { params, ...init } = config;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeader(),
        ...init.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...init,
    });

    return this.parseResponse<T>(response);
  }

  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, ...init } = config;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeader(),
        ...init.headers,
      },
      ...init,
    });

    return this.parseResponse<T>(response);
  }

  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }
}

// Create singleton instance
export const apiClient = new HttpClient(
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
);

export default HttpClient;
