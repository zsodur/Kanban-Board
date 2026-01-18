# ==============================================================================
#  Task Ordering Service - 任务排序业务逻辑
# ==============================================================================
"""
[INPUT]: 依赖 SQLAlchemy AsyncSession, app.models.Task
[OUTPUT]: 对外提供 move_task, reorder_column
[POS]: services 模块的核心排序逻辑，处理跨列/同列移动
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from __future__ import annotations

from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Task


async def reorder_column(db: AsyncSession, column_id: UUID) -> None:
    """
    整列重排 position (0, 1, 2, ...)

    采用整列重排策略：简单可靠，避免 position 冲突
    """
    result = await db.execute(
        select(Task)
        .where(Task.column_id == column_id)
        .order_by(Task.position)
    )
    tasks = list(result.scalars().all())

    for idx, task in enumerate(tasks):
        if task.position != idx:
            task.position = idx


async def move_task(
    db: AsyncSession,
    task: Task,
    to_column_id: UUID,
    to_position: int,
) -> Task:
    """
    移动任务到目标列的指定位置

    事务逻辑：
    1. 从原列移除（若同列移动则跳过）
    2. 在目标列插入到 to_position
    3. 整列重排受影响的列
    """
    from_column_id = task.column_id
    is_same_column = from_column_id == to_column_id

    # -------------------------------------------------------------------------
    #  Step 1: 从原列移除（仅跨列时需要重排原列）
    # -------------------------------------------------------------------------
    if not is_same_column:
        task.column_id = to_column_id

    # -------------------------------------------------------------------------
    #  Step 2: 获取目标列任务列表（排除当前任务）
    # -------------------------------------------------------------------------
    result = await db.execute(
        select(Task)
        .where(Task.column_id == to_column_id, Task.id != task.id)
        .order_by(Task.position)
    )
    target_tasks = list(result.scalars().all())

    # -------------------------------------------------------------------------
    #  Step 3: 插入到目标位置
    # -------------------------------------------------------------------------
    # 确保 position 在有效范围内
    max_position = len(target_tasks)
    to_position = max(0, min(to_position, max_position))

    # 将任务插入到列表中
    target_tasks.insert(to_position, task)

    # -------------------------------------------------------------------------
    #  Step 4: 整列重排
    # -------------------------------------------------------------------------
    for idx, t in enumerate(target_tasks):
        t.position = idx

    # -------------------------------------------------------------------------
    #  Step 5: 若跨列，重排原列
    # -------------------------------------------------------------------------
    if not is_same_column:
        await reorder_column(db, from_column_id)

    await db.commit()
    await db.refresh(task)

    return task
