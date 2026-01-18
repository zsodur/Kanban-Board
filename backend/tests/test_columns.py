# ==============================================================================
#  Column CRUD API Tests
# ==============================================================================
"""
[INPUT]: 依赖 pytest, httpx.AsyncClient
[OUTPUT]: 测试 columns API 端点
[POS]: tests 模块的列测试
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
import pytest
from httpx import AsyncClient


@pytest.fixture
async def board_id(client: AsyncClient, demo_user) -> str:
    """创建测试用看板并返回 ID"""
    response = await client.post("/api/v1/boards", json={"title": "测试看板"})
    return response.json()["id"]


@pytest.mark.asyncio
async def test_list_columns(client: AsyncClient, board_id: str) -> None:
    """测试获取列列表"""
    # 先创建列
    await client.post(
        f"/api/v1/boards/{board_id}/columns",
        json={"title": "待办", "order_index": 0},
    )
    await client.post(
        f"/api/v1/boards/{board_id}/columns",
        json={"title": "进行中", "order_index": 1},
    )

    response = await client.get(f"/api/v1/boards/{board_id}/columns")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] == "待办"
    assert data[1]["title"] == "进行中"


@pytest.mark.asyncio
async def test_create_column(client: AsyncClient, board_id: str) -> None:
    """测试创建列"""
    response = await client.post(
        f"/api/v1/boards/{board_id}/columns",
        json={"title": "新列", "order_index": 0},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "新列"
    assert data["board_id"] == board_id


@pytest.mark.asyncio
async def test_update_column(client: AsyncClient, board_id: str) -> None:
    """测试更新列"""
    # 先创建
    create_response = await client.post(
        f"/api/v1/boards/{board_id}/columns",
        json={"title": "原标题", "order_index": 0},
    )
    column_id = create_response.json()["id"]

    # 再更新
    response = await client.patch(
        f"/api/v1/columns/{column_id}",
        json={"title": "新标题"},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "新标题"


@pytest.mark.asyncio
async def test_delete_column(client: AsyncClient, board_id: str) -> None:
    """测试删除列"""
    # 先创建
    create_response = await client.post(
        f"/api/v1/boards/{board_id}/columns",
        json={"title": "待删除", "order_index": 0},
    )
    column_id = create_response.json()["id"]

    # 再删除
    response = await client.delete(f"/api/v1/columns/{column_id}")
    assert response.status_code == 204
