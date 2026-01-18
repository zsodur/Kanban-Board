# ==============================================================================
#  User Pydantic Schemas
# ==============================================================================
"""
[INPUT]: 依赖 pydantic
[OUTPUT]: 对外提供 UserCreate, UserRead, UserUpdate schemas
[POS]: schemas 模块的用户模式定义
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# -----------------------------------------------------------------------------
#  Base
# -----------------------------------------------------------------------------
class UserBase(BaseModel):
    """用户基础字段"""

    email: EmailStr
    display_name: str = Field(..., min_length=1, max_length=100)


# -----------------------------------------------------------------------------
#  Create / Update / Read
# -----------------------------------------------------------------------------
class UserCreate(UserBase):
    """创建用户请求"""

    password: str = Field(..., min_length=6, max_length=100)


class UserUpdate(BaseModel):
    """更新用户请求"""

    display_name: Optional[str] = Field(None, min_length=1, max_length=100)
    password: Optional[str] = Field(None, min_length=6, max_length=100)


class UserRead(UserBase):
    """用户响应"""

    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
