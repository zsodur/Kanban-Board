# ==============================================================================
#  Task ORM Model
# ==============================================================================
"""
[INPUT]: 依赖 app.db.base 的 Base, TimestampMixin, UUIDMixin
[OUTPUT]: 对外提供 Task ORM 模型
[POS]: models 模块的任务实体，属于 Board 和 Column
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from __future__ import annotations

from typing import Optional
from uuid import UUID

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


class Task(Base, UUIDMixin, TimestampMixin):
    """任务模型"""

    __tablename__ = "tasks"

    board_id: Mapped[UUID] = mapped_column(ForeignKey("boards.id", ondelete="CASCADE"))
    column_id: Mapped[UUID] = mapped_column(ForeignKey("columns.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    position: Mapped[int] = mapped_column(Integer, default=0)

    # -------------------------------------------------------------------------
    #  关系
    # -------------------------------------------------------------------------
    board: Mapped["Board"] = relationship("Board", back_populates="tasks")  # noqa: F821
    column: Mapped["Column"] = relationship("Column", back_populates="tasks")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Task {self.title}>"
