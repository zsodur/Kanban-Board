/**
 * [INPUT]: 无外部依赖
 * [OUTPUT]: 对外提供 API 响应类型
 * [POS]: types 模块的 API 响应类型
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}
