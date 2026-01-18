# ==============================================================================
#  Task CRUD API Tests
# ==============================================================================
"""
[INPUT]: 依赖 pytest, httpx.AsyncClient
[OUTPUT]: 测试 tasks API 端点
[POS]: tests 模块的任务测试
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
import pytest
from httpx import AsyncClient


@pytest.fixture
async def board_and_column(client: AsyncClient, demo_user) -> tuple[str, str]:
    """创建测试用看板和列，返回 (board_id, column_id)"""
    board_response = await client.post(
        "/api/v1/boards", json={"title": "测试看板"}
    )
    board_id = board_response.json()["id"]

    column_response = await client.post(
        f"/api/v1/boards/{board_id}/columns",
        json={"title": "待办", "order_index": 0},
    )
    column_id = column_response.json()["id"]

    return board_id, column_id


@pytest.mark.asyncio
async def test_create_task(
    client: AsyncClient, board_and_column: tuple[str, str]
) -> None:
    """测试创建任务"""
    board_id, column_id = board_and_column
    response = await client.post(
        f"/api/v1/boards/{board_id}/tasks",
        json={
            "title": "新任务",
            "description": "任务描述",
            "column_id": column_id,
            "position": 0,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "新任务"
    assert data["description"] == "任务描述"
    assert data["column_id"] == column_id


@pytest.mark.asyncio
async def test_list_tasks(
    client: AsyncClient, board_and_column: tuple[str, str]
) -> None:
    """测试获取任务列表"""
    board_id, column_id = board_and_column

    # 创建多个任务
    await client.post(
        f"/api/v1/boards/{board_id}/tasks",
        json={"title": "任务1", "column_id": column_id, "position": 0},
    )
    await client.post(
        f"/api/v1/boards/{board_id}/tasks",
        json={"title": "任务2", "column_id": column_id, "position": 1},
    )

    response = await client.get(f"/api/v1/boards/{board_id}/tasks")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


@pytest.mark.asyncio
async def test_get_task(
    client: AsyncClient, board_and_column: tuple[str, str]
) -> None:
    """测试获取单个任务"""
    board_id, column_id = board_and_column

    create_response = await client.post(
        f"/api/v1/boards/{board_id}/tasks",
        json={"title": "测试任务", "column_id": column_id, "position": 0},
    )
    task_id = create_response.json()["id"]

    response = await client.get(f"/api/v1/tasks/{task_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "测试任务"


@pytest.mark.asyncio
async def test_update_task(
    client: AsyncClient, board_and_column: tuple[str, str]
) -> None:
    """测试更新任务"""
    board_id, column_id = board_and_column

    create_response = await client.post(
        f"/api/v1/boards/{board_id}/tasks",
        json={"title": "原标题", "column_id": column_id, "position": 0},
    )
    task_id = create_response.json()["id"]

    response = await client.patch(
        f"/api/v1/tasks/{task_id}",
        json={"title": "新标题", "description": "新描述"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "新标题"
    assert data["description"] == "新描述"


@pytest.mark.asyncio
async def test_delete_task(
    client: AsyncClient, board_and_column: tuple[str, str]
) -> None:
    """测试删除任务"""
    board_id, column_id = board_and_column

    create_response = await client.post(
        f"/api/v1/boards/{board_id}/tasks",
        json={"title": "待删除", "column_id": column_id, "position": 0},
    )
    task_id = create_response.json()["id"]

    response = await client.delete(f"/api/v1/tasks/{task_id}")
    assert response.status_code == 204

    # 确认删除
    get_response = await client.get(f"/api/v1/tasks/{task_id}")
    assert get_response.status_code == 404
