# ==============================================================================
#  Tasks API Endpoints
# ==============================================================================
"""
[INPUT]: 依赖 app.crud, app.schemas, app.api.deps
[OUTPUT]: 对外提供 tasks CRUD API 路由
[POS]: api/v1/endpoints 的任务端点
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.crud import (
    create_task,
    delete_task,
    get_board,
    get_task,
    get_tasks_by_board,
    update_task,
)
from app.schemas import TaskCreate, TaskRead, TaskUpdate

router = APIRouter(tags=["tasks"])


# -----------------------------------------------------------------------------
#  Board-scoped Endpoints
# -----------------------------------------------------------------------------
@router.get("/boards/{board_id}/tasks", response_model=list[TaskRead])
async def list_tasks(
    board_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> list[TaskRead]:
    """获取看板的所有任务"""
    board = await get_board(db, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    tasks = await get_tasks_by_board(db, board_id)
    return [TaskRead.model_validate(t) for t in tasks]


@router.post(
    "/boards/{board_id}/tasks",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_task_endpoint(
    board_id: UUID,
    task_in: TaskCreate,
    db: AsyncSession = Depends(get_db),
) -> TaskRead:
    """创建新任务"""
    board = await get_board(db, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    task = await create_task(db, task_in, board_id=board_id)
    return TaskRead.model_validate(task)


# -----------------------------------------------------------------------------
#  Task-scoped Endpoints
# -----------------------------------------------------------------------------
@router.get("/tasks/{task_id}", response_model=TaskRead)
async def get_task_endpoint(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> TaskRead:
    """获取任务详情"""
    task = await get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskRead.model_validate(task)


@router.patch("/tasks/{task_id}", response_model=TaskRead)
async def update_task_endpoint(
    task_id: UUID,
    task_in: TaskUpdate,
    db: AsyncSession = Depends(get_db),
) -> TaskRead:
    """更新任务"""
    task = await get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task = await update_task(db, task, task_in)
    return TaskRead.model_validate(task)


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task_endpoint(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    """删除任务"""
    task = await get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await delete_task(db, task)
