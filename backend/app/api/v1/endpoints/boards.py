# ==============================================================================
#  Boards API Endpoints
# ==============================================================================
"""
[INPUT]: 依赖 app.crud, app.schemas, app.api.deps
[OUTPUT]: 对外提供 boards CRUD API 路由
[POS]: api/v1/endpoints 的看板端点
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.crud import (
    create_board,
    delete_board,
    get_board,
    get_boards_by_owner,
    get_user_by_id,
    update_board,
)
from app.schemas import BoardCreate, BoardRead, BoardUpdate

router = APIRouter(prefix="/boards", tags=["boards"])


# -----------------------------------------------------------------------------
#  临时: 获取默认用户 (M5 将实现真正的鉴权)
# -----------------------------------------------------------------------------
async def get_current_user_id(db: AsyncSession = Depends(get_db)) -> UUID:
    """临时获取默认用户 ID（等待 M5 鉴权实现）"""
    from app.crud import get_user_by_email

    user = await get_user_by_email(db, "demo@example.com")
    if not user:
        raise HTTPException(status_code=401, detail="Demo user not found")
    return user.id


# -----------------------------------------------------------------------------
#  CRUD Endpoints
# -----------------------------------------------------------------------------
@router.get("", response_model=list[BoardRead])
async def list_boards(
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
) -> list[BoardRead]:
    """获取当前用户的所有看板"""
    boards = await get_boards_by_owner(db, user_id)
    return [BoardRead.model_validate(b) for b in boards]


@router.post("", response_model=BoardRead, status_code=status.HTTP_201_CREATED)
async def create_board_endpoint(
    board_in: BoardCreate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
) -> BoardRead:
    """创建新看板"""
    board = await create_board(db, board_in, owner_id=user_id)
    return BoardRead.model_validate(board)


@router.get("/{board_id}", response_model=BoardRead)
async def get_board_endpoint(
    board_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
) -> BoardRead:
    """获取看板详情"""
    board = await get_board(db, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    if board.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return BoardRead.model_validate(board)


@router.patch("/{board_id}", response_model=BoardRead)
async def update_board_endpoint(
    board_id: UUID,
    board_in: BoardUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
) -> BoardRead:
    """更新看板"""
    board = await get_board(db, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    if board.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    board = await update_board(db, board, board_in)
    return BoardRead.model_validate(board)


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_board_endpoint(
    board_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
) -> None:
    """删除看板"""
    board = await get_board(db, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    if board.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    await delete_board(db, board)
