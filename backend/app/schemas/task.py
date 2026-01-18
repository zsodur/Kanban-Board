# ==============================================================================
#  Task Pydantic Schemas
# ==============================================================================
"""
[INPUT]: 依赖 pydantic
[OUTPUT]: 对外提供 TaskCreate, TaskRead, TaskUpdate, TaskMove schemas
[POS]: schemas 模块的任务模式定义
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# -----------------------------------------------------------------------------
#  Base
# -----------------------------------------------------------------------------
class TaskBase(BaseModel):
    """任务基础字段"""

    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)


# -----------------------------------------------------------------------------
#  Create / Update / Read / Move
# -----------------------------------------------------------------------------
class TaskCreate(TaskBase):
    """创建任务请求"""

    column_id: UUID
    position: int = Field(0, ge=0)


class TaskUpdate(BaseModel):
    """更新任务请求"""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)


class TaskMove(BaseModel):
    """移动任务请求"""

    column_id: UUID
    position: int = Field(..., ge=0)


class TaskRead(TaskBase):
    """任务响应"""

    id: UUID
    board_id: UUID
    column_id: UUID
    position: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
