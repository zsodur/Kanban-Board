# ==============================================================================
#  Board CRUD Operations
# ==============================================================================
"""
[INPUT]: 依赖 SQLAlchemy AsyncSession, app.models.Board
[OUTPUT]: 对外提供 create_board, get_boards_by_owner, get_board, update_board, delete_board
[POS]: crud 模块的看板数据访问
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from __future__ import annotations

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Board
from app.schemas import BoardCreate, BoardUpdate


async def create_board(db: AsyncSession, board_in: BoardCreate, owner_id: UUID) -> Board:
    """创建看板"""
    board = Board(title=board_in.title, owner_id=owner_id)
    db.add(board)
    await db.commit()
    await db.refresh(board)
    return board


async def get_boards_by_owner(db: AsyncSession, owner_id: UUID) -> List[Board]:
    """获取用户的所有看板"""
    result = await db.execute(
        select(Board).where(Board.owner_id == owner_id).order_by(Board.created_at.desc())
    )
    return list(result.scalars().all())


async def get_board(db: AsyncSession, board_id: UUID) -> Optional[Board]:
    """通过 ID 获取看板"""
    result = await db.execute(select(Board).where(Board.id == board_id))
    return result.scalar_one_or_none()


async def update_board(
    db: AsyncSession, board: Board, board_in: BoardUpdate
) -> Board:
    """更新看板"""
    update_data = board_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(board, field, value)
    await db.commit()
    await db.refresh(board)
    return board


async def delete_board(db: AsyncSession, board: Board) -> None:
    """删除看板"""
    await db.delete(board)
    await db.commit()
