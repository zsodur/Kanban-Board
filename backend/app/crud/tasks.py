# ==============================================================================
#  Task CRUD Operations
# ==============================================================================
"""
[INPUT]: 依赖 SQLAlchemy AsyncSession, app.models.Task
[OUTPUT]: 对外提供 create_task, get_tasks_by_board, get_tasks_by_column, get_task, update_task, delete_task
[POS]: crud 模块的任务数据访问
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from __future__ import annotations

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Task
from app.schemas import TaskCreate, TaskUpdate


async def create_task(db: AsyncSession, task_in: TaskCreate, board_id: UUID) -> Task:
    """创建任务"""
    task = Task(
        title=task_in.title,
        description=task_in.description,
        board_id=board_id,
        column_id=task_in.column_id,
        position=task_in.position,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


async def get_tasks_by_board(db: AsyncSession, board_id: UUID) -> List[Task]:
    """获取看板的所有任务"""
    result = await db.execute(
        select(Task).where(Task.board_id == board_id).order_by(Task.position)
    )
    return list(result.scalars().all())


async def get_tasks_by_column(db: AsyncSession, column_id: UUID) -> List[Task]:
    """获取列的所有任务"""
    result = await db.execute(
        select(Task).where(Task.column_id == column_id).order_by(Task.position)
    )
    return list(result.scalars().all())


async def get_task(db: AsyncSession, task_id: UUID) -> Optional[Task]:
    """通过 ID 获取任务"""
    result = await db.execute(select(Task).where(Task.id == task_id))
    return result.scalar_one_or_none()


async def update_task(db: AsyncSession, task: Task, task_in: TaskUpdate) -> Task:
    """更新任务"""
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    await db.commit()
    await db.refresh(task)
    return task


async def delete_task(db: AsyncSession, task: Task) -> None:
    """删除任务"""
    await db.delete(task)
    await db.commit()
