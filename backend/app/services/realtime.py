# ==============================================================================
#  Realtime Service - WebSocket 连接管理与广播
# ==============================================================================
"""
[INPUT]: 依赖 fastapi.WebSocket, app.schemas.events
[OUTPUT]: 对外提供 ConnectionManager, broadcast_event
[POS]: services 模块的实时通信逻辑
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from fastapi import WebSocket


class ConnectionManager:
    """WebSocket 连接管理器（单实例内存广播）"""

    def __init__(self) -> None:
        # board_id -> list of WebSocket connections
        self._connections: dict[UUID, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, board_id: UUID) -> None:
        """接受连接并加入看板房间"""
        await websocket.accept()
        if board_id not in self._connections:
            self._connections[board_id] = []
        self._connections[board_id].append(websocket)

    def disconnect(self, websocket: WebSocket, board_id: UUID) -> None:
        """断开连接"""
        if board_id in self._connections:
            if websocket in self._connections[board_id]:
                self._connections[board_id].remove(websocket)
            if not self._connections[board_id]:
                del self._connections[board_id]

    async def broadcast(
        self,
        board_id: UUID,
        event_type: str,
        payload: dict[str, Any],
    ) -> None:
        """向看板所有连接广播事件"""
        if board_id not in self._connections:
            return

        message = json.dumps(
            {
                "type": event_type,
                "board_id": str(board_id),
                "ts": datetime.now(timezone.utc).isoformat(),
                "payload": payload,
            },
            default=str,
        )

        # 广播给所有连接（失败的连接会被跳过）
        dead_connections = []
        for connection in self._connections[board_id]:
            try:
                await connection.send_text(message)
            except Exception:
                dead_connections.append(connection)

        # 清理死连接
        for conn in dead_connections:
            self.disconnect(conn, board_id)


# 全局连接管理器实例
manager = ConnectionManager()


async def broadcast_event(
    board_id: UUID,
    event_type: str,
    payload: dict[str, Any],
) -> None:
    """广播事件的便捷函数"""
    await manager.broadcast(board_id, event_type, payload)
