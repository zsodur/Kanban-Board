# ==============================================================================
#  Board CRUD API Tests
# ==============================================================================
"""
[INPUT]: 依赖 pytest, httpx.AsyncClient
[OUTPUT]: 测试 boards API 端点
[POS]: tests 模块的看板测试
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_board(client: AsyncClient, demo_user) -> None:
    """测试创建看板"""
    response = await client.post(
        "/api/v1/boards",
        json={"title": "测试看板"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "测试看板"
    assert "id" in data
    assert data["owner_id"] == str(demo_user.id)


@pytest.mark.asyncio
async def test_list_boards(client: AsyncClient, demo_user) -> None:
    """测试获取看板列表"""
    # 先创建一个看板
    await client.post("/api/v1/boards", json={"title": "看板1"})
    await client.post("/api/v1/boards", json={"title": "看板2"})

    response = await client.get("/api/v1/boards")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


@pytest.mark.asyncio
async def test_get_board(client: AsyncClient, demo_user) -> None:
    """测试获取单个看板"""
    # 先创建
    create_response = await client.post(
        "/api/v1/boards", json={"title": "测试看板"}
    )
    board_id = create_response.json()["id"]

    # 再获取
    response = await client.get(f"/api/v1/boards/{board_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "测试看板"


@pytest.mark.asyncio
async def test_get_board_not_found(client: AsyncClient, demo_user) -> None:
    """测试获取不存在的看板"""
    fake_id = "00000000-0000-0000-0000-000000000000"
    response = await client.get(f"/api/v1/boards/{fake_id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_board(client: AsyncClient, demo_user) -> None:
    """测试更新看板"""
    # 先创建
    create_response = await client.post(
        "/api/v1/boards", json={"title": "原标题"}
    )
    board_id = create_response.json()["id"]

    # 再更新
    response = await client.patch(
        f"/api/v1/boards/{board_id}",
        json={"title": "新标题"},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "新标题"


@pytest.mark.asyncio
async def test_delete_board(client: AsyncClient, demo_user) -> None:
    """测试删除看板"""
    # 先创建
    create_response = await client.post(
        "/api/v1/boards", json={"title": "待删除"}
    )
    board_id = create_response.json()["id"]

    # 再删除
    response = await client.delete(f"/api/v1/boards/{board_id}")
    assert response.status_code == 204

    # 确认删除
    get_response = await client.get(f"/api/v1/boards/{board_id}")
    assert get_response.status_code == 404
