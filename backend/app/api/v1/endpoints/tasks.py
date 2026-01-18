# ==============================================================================
#  Tasks API Endpoints
# ==============================================================================
"""
[INPUT]: 依赖 app.crud, app.schemas, app.api.deps, app.services
[OUTPUT]: 对外提供 tasks CRUD + move API 路由
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
from app.schemas import TaskCreate, TaskMove, TaskRead, TaskUpdate
from app.services import move_task
from app.services.realtime import broadcast_event

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

    # 广播事件
    await broadcast_event(
        board_id,
        "task_created",
        {
            "id": str(task.id),
            "column_id": str(task.column_id),
            "title": task.title,
            "description": task.description,
            "position": task.position,
        },
    )

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

    # 广播事件
    await broadcast_event(
        task.board_id,
        "task_updated",
        {
            "id": str(task.id),
            "title": task.title,
            "description": task.description,
        },
    )

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

    board_id = task.board_id
    task_id_str = str(task.id)

    await delete_task(db, task)

    # 广播事件
    await broadcast_event(board_id, "task_deleted", {"id": task_id_str})


# -----------------------------------------------------------------------------
#  Move Endpoint (拖拽核心)
# -----------------------------------------------------------------------------
@router.patch("/tasks/{task_id}/move", response_model=TaskRead)
async def move_task_endpoint(
    task_id: UUID,
    move_in: TaskMove,
    db: AsyncSession = Depends(get_db),
) -> TaskRead:
    """移动任务到目标列的指定位置"""
    task = await get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    from_column_id = task.column_id
    task = await move_task(db, task, move_in.column_id, move_in.position)

    # 广播事件
    await broadcast_event(
        task.board_id,
        "task_moved",
        {
            "id": str(task.id),
            "from_column_id": str(from_column_id),
            "to_column_id": str(task.column_id),
            "position": task.position,
        },
    )

    return TaskRead.model_validate(task)
