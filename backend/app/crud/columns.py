# ==============================================================================
#  Column CRUD Operations
# ==============================================================================
"""
[INPUT]: 依赖 SQLAlchemy AsyncSession, app.models.Column
[OUTPUT]: 对外提供 create_column, get_columns_by_board, get_column, update_column, delete_column
[POS]: crud 模块的列数据访问
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from __future__ import annotations

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Column
from app.schemas import ColumnCreate, ColumnUpdate


async def create_column(
    db: AsyncSession, column_in: ColumnCreate, board_id: UUID
) -> Column:
    """创建列"""
    column = Column(
        title=column_in.title,
        board_id=board_id,
        order_index=column_in.order_index,
    )
    db.add(column)
    await db.commit()
    await db.refresh(column)
    return column


async def get_columns_by_board(db: AsyncSession, board_id: UUID) -> List[Column]:
    """获取看板的所有列"""
    result = await db.execute(
        select(Column).where(Column.board_id == board_id).order_by(Column.order_index)
    )
    return list(result.scalars().all())


async def get_column(db: AsyncSession, column_id: UUID) -> Optional[Column]:
    """通过 ID 获取列"""
    result = await db.execute(select(Column).where(Column.id == column_id))
    return result.scalar_one_or_none()


async def update_column(
    db: AsyncSession, column: Column, column_in: ColumnUpdate
) -> Column:
    """更新列"""
    update_data = column_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(column, field, value)
    await db.commit()
    await db.refresh(column)
    return column


async def delete_column(db: AsyncSession, column: Column) -> None:
    """删除列"""
    await db.delete(column)
    await db.commit()
