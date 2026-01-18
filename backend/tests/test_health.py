"""
[INPUT]: 依赖 pytest, httpx
[OUTPUT]: 对外提供 health 端点测试
[POS]: tests 模块的健康检查测试
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_returns_ok(client: AsyncClient):
    """测试 health 端点返回 ok"""
    response = await client.get("/api/v1/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "database" in data


@pytest.mark.asyncio
async def test_root_returns_service_info(client: AsyncClient):
    """测试根路径返回服务信息"""
    response = await client.get("/")

    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Kanban Board API"
    assert data["version"] == "0.1.0"
