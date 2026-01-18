/**
 * [INPUT]: 无外部依赖
 * [OUTPUT]: 对外提供 apiClient fetch 封装
 * [POS]: api 模块的 HTTP 客户端基础
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const BASE_URL = "/api/v1";

// ============================================================================
//  通用请求封装
// ============================================================================
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP error: ${response.status}`);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ============================================================================
//  导出便捷方法
// ============================================================================
export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),

  patch: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(data) }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
