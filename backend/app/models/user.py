# ==============================================================================
#  User ORM Model
# ==============================================================================
"""
[INPUT]: 依赖 app.db.base 的 Base, TimestampMixin, UUIDMixin
[OUTPUT]: 对外提供 User ORM 模型
[POS]: models 模块的用户实体，被 Board 关联
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


class User(Base, UUIDMixin, TimestampMixin):
    """用户模型"""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str] = mapped_column(String(100))

    # -------------------------------------------------------------------------
    #  关系
    # -------------------------------------------------------------------------
    boards: Mapped[list["Board"]] = relationship(  # noqa: F821
        "Board", back_populates="owner", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User {self.email}>"
