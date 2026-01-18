/**
 * [INPUT]: 依赖 react, components/layout, components/kanban, api/boards
 * [OUTPUT]: 对外提供 BoardPage 页面组件
 * [POS]: pages 模块的看板页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { BoardView } from "../components/kanban/BoardView";
import { boardsApi } from "../api/boards";
import type { Board } from "../types/kanban";

function BoardPage() {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBoard = async () => {
      try {
        const boards = await boardsApi.list();
        if (boards.length > 0) {
          setBoard(boards[0]);
        } else {
          // 创建默认看板
          const newBoard = await boardsApi.create({ title: "我的看板" });
          setBoard(newBoard);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, []);

  if (loading) {
    return (
      <AppShell title="Kanban Board">
        <div className="flex items-center justify-center h-full text-gray-500">
          加载中...
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Kanban Board">
        <div className="flex items-center justify-center h-full text-red-500">
          {error}
        </div>
      </AppShell>
    );
  }

  if (!board) {
    return (
      <AppShell title="Kanban Board">
        <div className="flex items-center justify-center h-full text-gray-500">
          无看板数据
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={board.title}>
      <BoardView boardId={board.id} />
    </AppShell>
  );
}

export default BoardPage;
