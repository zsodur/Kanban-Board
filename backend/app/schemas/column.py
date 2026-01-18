# ==============================================================================
#  Column Pydantic Schemas
# ==============================================================================
"""
[INPUT]: 依赖 pydantic
[OUTPUT]: 对外提供 ColumnCreate, ColumnRead, ColumnUpdate schemas
[POS]: schemas 模块的列模式定义
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
class ColumnBase(BaseModel):
    """列基础字段"""

    title: str = Field(..., min_length=1, max_length=100)


# -----------------------------------------------------------------------------
#  Create / Update / Read
# -----------------------------------------------------------------------------
class ColumnCreate(ColumnBase):
    """创建列请求"""

    order_index: int = Field(0, ge=0)


class ColumnUpdate(BaseModel):
    """更新列请求"""

    title: Optional[str] = Field(None, min_length=1, max_length=100)
    order_index: Optional[int] = Field(None, ge=0)


class ColumnRead(ColumnBase):
    """列响应"""

    id: UUID
    board_id: UUID
    order_index: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
