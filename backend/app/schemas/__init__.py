# ==============================================================================
#  Schemas Module - Pydantic 数据模型
# ==============================================================================
"""
[INPUT]: 依赖 user, board, column, task 子模块
[OUTPUT]: 对外提供所有 Pydantic schemas
[POS]: schemas 模块入口，统一导出所有 API 数据模式
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from app.schemas.board import BoardCreate, BoardRead, BoardUpdate
from app.schemas.column import ColumnCreate, ColumnRead, ColumnUpdate
from app.schemas.task import TaskCreate, TaskMove, TaskRead, TaskUpdate
from app.schemas.user import UserCreate, UserRead, UserUpdate

__all__ = [
    # User
    "UserCreate",
    "UserRead",
    "UserUpdate",
    # Board
    "BoardCreate",
    "BoardRead",
    "BoardUpdate",
    # Column
    "ColumnCreate",
    "ColumnRead",
    "ColumnUpdate",
    # Task
    "TaskCreate",
    "TaskRead",
    "TaskUpdate",
    "TaskMove",
]
