# ==============================================================================
#  WebSocket Endpoint
# ==============================================================================
"""
[INPUT]: 依赖 fastapi.WebSocket, app.services.realtime
[OUTPUT]: 对外提供 WebSocket /ws/boards/{board_id} 端点
[POS]: api/v1/endpoints 的 WebSocket 端点
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.realtime import manager

router = APIRouter()


@router.websocket("/ws/boards/{board_id}")
async def websocket_endpoint(websocket: WebSocket, board_id: UUID) -> None:
    """WebSocket 连接端点"""
    await manager.connect(websocket, board_id)

    try:
        while True:
            # 保持连接，等待消息（可用于心跳）
            data = await websocket.receive_text()
            # 目前忽略客户端消息，仅用于保持连接
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, board_id)
