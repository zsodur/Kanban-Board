/**
 * [INPUT]: 依赖 @testing-library/react-hooks, vitest, @tanstack/react-query
 * [OUTPUT]: 对外提供 useBoard hook 测试
 * [POS]: hooks/__tests__ 模块的 useBoard 测试
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { boardKeys } from "../useBoard";

// Mock fetch
global.fetch = vi.fn();

describe("useBoard hooks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe("boardKeys", () => {
    it("generates correct query keys", () => {
      expect(boardKeys.all).toEqual(["boards"]);
      expect(boardKeys.columns("board-1")).toEqual(["boards", "board-1", "columns"]);
      expect(boardKeys.tasks("board-1")).toEqual(["boards", "board-1", "tasks"]);
    });
  });

  describe("query key structure", () => {
    it("has correct hierarchy", () => {
      const boardId = "test-board";
      const columnsKey = boardKeys.columns(boardId);
      const tasksKey = boardKeys.tasks(boardId);

      expect(columnsKey).toContain(boardId);
      expect(tasksKey).toContain(boardId);
      expect(columnsKey).toContain("columns");
      expect(tasksKey).toContain("tasks");
    });
  });
});
