"""
[INPUT]: 依赖 pydantic-settings 的 BaseSettings
[OUTPUT]: 对外提供 Settings 配置类，settings 单例
[POS]: core 模块的配置中心，被所有模块消费
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置 - 从环境变量加载"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # -------------------------------------------------------------------------
    #  数据库配置
    # -------------------------------------------------------------------------
    database_url: str = "postgresql+asyncpg://user:password@db:5432/kanban"

    # -------------------------------------------------------------------------
    #  JWT 配置
    # -------------------------------------------------------------------------
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # -------------------------------------------------------------------------
    #  应用配置
    # -------------------------------------------------------------------------
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    @property
    def async_database_url(self) -> str:
        """确保使用 asyncpg 驱动"""
        url = self.database_url
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url


@lru_cache
def get_settings() -> Settings:
    """缓存配置单例"""
    return Settings()


settings = get_settings()
