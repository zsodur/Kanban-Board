# ==============================================================================
#  WebSocket Event Schemas
# ==============================================================================
"""
[INPUT]: 依赖 pydantic
[OUTPUT]: 对外提供 WebSocket 事件类型
[POS]: schemas 模块的事件模式定义
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel


class WebSocketEvent(BaseModel):
    """WebSocket 事件基类"""

    type: str
    board_id: UUID
    ts: datetime
    payload: dict


class TaskCreatedPayload(BaseModel):
    """任务创建事件载荷"""

    id: UUID
    column_id: UUID
    title: str
    description: Optional[str]
    position: int


class TaskUpdatedPayload(BaseModel):
    """任务更新事件载荷"""

    id: UUID
    title: Optional[str] = None
    description: Optional[str] = None


class TaskMovedPayload(BaseModel):
    """任务移动事件载荷"""

    id: UUID
    from_column_id: UUID
    to_column_id: UUID
    position: int


class TaskDeletedPayload(BaseModel):
    """任务删除事件载荷"""

    id: UUID


# 事件类型联合
EventType = Literal["task_created", "task_updated", "task_moved", "task_deleted"]
