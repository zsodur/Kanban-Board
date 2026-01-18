# ==============================================================================
#  Board Pydantic Schemas
# ==============================================================================
"""
[INPUT]: 依赖 pydantic
[OUTPUT]: 对外提供 BoardCreate, BoardRead, BoardUpdate schemas
[POS]: schemas 模块的看板模式定义
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
class BoardBase(BaseModel):
    """看板基础字段"""

    title: str = Field(..., min_length=1, max_length=200)


# -----------------------------------------------------------------------------
#  Create / Update / Read
# -----------------------------------------------------------------------------
class BoardCreate(BoardBase):
    """创建看板请求"""

    pass


class BoardUpdate(BaseModel):
    """更新看板请求"""

    title: Optional[str] = Field(None, min_length=1, max_length=200)


class BoardRead(BoardBase):
    """看板响应"""

    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
