# ==============================================================================
#  Columns API Endpoints
# ==============================================================================
"""
[INPUT]: 依赖 app.crud, app.schemas, app.api.deps
[OUTPUT]: 对外提供 columns CRUD API 路由
[POS]: api/v1/endpoints 的列端点
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.crud import (
    create_column,
    delete_column,
    get_board,
    get_column,
    get_columns_by_board,
    update_column,
)
from app.schemas import ColumnCreate, ColumnRead, ColumnUpdate

router = APIRouter(tags=["columns"])


# -----------------------------------------------------------------------------
#  Board-scoped Endpoints
# -----------------------------------------------------------------------------
@router.get("/boards/{board_id}/columns", response_model=list[ColumnRead])
async def list_columns(
    board_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> list[ColumnRead]:
    """获取看板的所有列"""
    board = await get_board(db, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    columns = await get_columns_by_board(db, board_id)
    return [ColumnRead.model_validate(c) for c in columns]


@router.post(
    "/boards/{board_id}/columns",
    response_model=ColumnRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_column_endpoint(
    board_id: UUID,
    column_in: ColumnCreate,
    db: AsyncSession = Depends(get_db),
) -> ColumnRead:
    """创建新列"""
    board = await get_board(db, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    column = await create_column(db, column_in, board_id=board_id)
    return ColumnRead.model_validate(column)


# -----------------------------------------------------------------------------
#  Column-scoped Endpoints
# -----------------------------------------------------------------------------
@router.patch("/columns/{column_id}", response_model=ColumnRead)
async def update_column_endpoint(
    column_id: UUID,
    column_in: ColumnUpdate,
    db: AsyncSession = Depends(get_db),
) -> ColumnRead:
    """更新列"""
    column = await get_column(db, column_id)
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")
    column = await update_column(db, column, column_in)
    return ColumnRead.model_validate(column)


@router.delete("/columns/{column_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_column_endpoint(
    column_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    """删除列"""
    column = await get_column(db, column_id)
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")
    await delete_column(db, column)
