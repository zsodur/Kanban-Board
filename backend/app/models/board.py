# ==============================================================================
#  Board ORM Model
# ==============================================================================
"""
[INPUT]: 依赖 app.db.base 的 Base, TimestampMixin, UUIDMixin
[OUTPUT]: 对外提供 Board ORM 模型
[POS]: models 模块的看板实体，拥有 Column 和 Task
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from uuid import UUID

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


class Board(Base, UUIDMixin, TimestampMixin):
    """看板模型"""

    __tablename__ = "boards"

    owner_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(200))

    # -------------------------------------------------------------------------
    #  关系
    # -------------------------------------------------------------------------
    owner: Mapped["User"] = relationship("User", back_populates="boards")  # noqa: F821
    columns: Mapped[list["Column"]] = relationship(  # noqa: F821
        "Column", back_populates="board", cascade="all, delete-orphan"
    )
    tasks: Mapped[list["Task"]] = relationship(  # noqa: F821
        "Task", back_populates="board", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Board {self.title}>"
