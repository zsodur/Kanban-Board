/**
 * [INPUT]: 依赖 react, @tanstack/react-query
 * [OUTPUT]: 对外提供 useWebSocket hook
 * [POS]: hooks 模块的 WebSocket 实时同步
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { boardKeys } from "./useBoard";
import type { Task } from "../types/kanban";

interface WebSocketEvent {
  type: string;
  board_id: string;
  ts: string;
  payload: Record<string, unknown>;
}

interface UseWebSocketOptions {
  /** 是否有进行中的移动操作，用于避免干扰乐观更新 */
  isMovePending?: boolean;
}

export function useWebSocket(
  boardId: string | null,
  options: UseWebSocketOptions = {}
) {
  const { isMovePending = false } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const reconnectTimeoutRef = useRef<number | null>(null);
  // 用 ref 追踪最新的 isMovePending，避免 callback 依赖变化
  const isMovePendingRef = useRef(isMovePending);
  isMovePendingRef.current = isMovePending;

  const connect = useCallback(() => {
    if (!boardId) return;

    // WebSocket 直连后端，绕过 Vite 代理
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = window.location.hostname;
    const wsPort = "8000"; // 后端端口
    const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}/api/v1/ws/boards/${boardId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected to board:", boardId);
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketEvent = JSON.parse(event.data);
        handleEvent(data);
      } catch (err) {
        console.error("[WS] Failed to parse message:", err);
      }
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected, reconnecting in 3s...");
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (err) => {
      console.error("[WS] Error:", err);
      ws.close();
    };
  }, [boardId]);

  const handleEvent = useCallback(
    (event: WebSocketEvent) => {
      if (!boardId) return;

      const { type, payload } = event;
      const tasksKey = boardKeys.tasks(boardId);

      switch (type) {
        case "task_created": {
          // 添加新任务到缓存
          queryClient.setQueryData<Task[]>(tasksKey, (old) => {
            if (!old) return old;
            const newTask: Task = {
              id: payload.id as string,
              board_id: boardId,
              column_id: payload.column_id as string,
              title: payload.title as string,
              description: (payload.description as string) || null,
              position: payload.position as number,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            // 检查是否已存在（避免重复）
            if (old.some((t) => t.id === newTask.id)) return old;
            return [...old, newTask];
          });
          break;
        }

        case "task_updated": {
          queryClient.setQueryData<Task[]>(tasksKey, (old) => {
            if (!old) return old;
            return old.map((task) =>
              task.id === payload.id
                ? {
                    ...task,
                    title: (payload.title as string) ?? task.title,
                    description:
                      payload.description !== undefined
                        ? (payload.description as string | null)
                        : task.description,
                    updated_at: new Date().toISOString(),
                  }
                : task
            );
          });
          break;
        }

        case "task_moved": {
          // 自己正在移动时忽略，避免干扰乐观更新
          if (isMovePendingRef.current) {
            break;
          }
          // 其他客户端的移动，触发完整刷新
          queryClient.invalidateQueries({ queryKey: tasksKey });
          break;
        }

        case "task_deleted": {
          queryClient.setQueryData<Task[]>(tasksKey, (old) => {
            if (!old) return old;
            return old.filter((task) => task.id !== payload.id);
          });
          break;
        }
      }
    },
    [boardId, queryClient]
  );

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // 发送心跳
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send("ping");
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);
}
