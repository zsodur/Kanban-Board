# ==============================================================================
#  User CRUD Operations
# ==============================================================================
"""
[INPUT]: 依赖 SQLAlchemy AsyncSession, app.models.User
[OUTPUT]: 对外提供 create_user, get_user_by_email, get_user_by_id
[POS]: crud 模块的用户数据访问
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from __future__ import annotations

from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.schemas import UserCreate


async def create_user(
    db: AsyncSession, user_in: UserCreate, hashed_password: str
) -> User:
    """创建用户"""
    user = User(
        email=user_in.email,
        display_name=user_in.display_name,
        hashed_password=hashed_password,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """通过邮箱获取用户"""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
    """通过 ID 获取用户"""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
