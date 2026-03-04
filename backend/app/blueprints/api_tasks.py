from __future__ import annotations

from datetime import datetime, time, timezone

from flask import Blueprint, request

from ..extensions import db
from ..services.auth import api_login_required, current_user
from ..models import TaskList, Task
from ..utils import err, ok

bp = Blueprint("api_tasks", __name__, url_prefix="/api/tasks")

VALID_SHOW_VALUES = {"active", "done", "all"}

def _parse_iso_datetime(value: str) -> datetime | None:
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError("must be an ISO datetime string or null")
    value = value.strip()
    if not value:
        return None
    # Accept both "...Z" and "+00:00"
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    return datetime.fromisoformat(value)

def _require_owned_list_id(list_id: int | None, user_id: int) -> int | None:
    if list_id is None:
        return None
    if not isinstance(list_id, int):
        raise ValueError("list_id must be an integer or null")

    lst = db.session.get(TaskList, list_id)
    if lst is None or lst.user_id != user_id:
        raise PermissionError("Invalid list_id")
    return list_id

def _json_data() -> dict:
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def _require_user_id() -> int:
    user = current_user()
    if user is None:
        raise RuntimeError("api_login_required must run before _require_user_id")
    return user.id


def _get_owned_task(task_id: int, user_id: int) -> Task | None:
    task = db.session.get(Task, task_id)
    if task is None:
        return None
    if task.user_id != user_id:
        return None
    return task


@bp.get("")
@api_login_required
def list_tasks():
    user_id = _require_user_id()
    show = request.args.get("show", "active").lower()
    view = (request.args.get("view") or "").lower()

    if show not in VALID_SHOW_VALUES:
        return err("Invalid show filter. Use active, done, or all", 400)

    query = Task.query.filter_by(user_id=user_id)

    # show filter
    if show == "active":
        query = query.filter_by(is_done=False)
    elif show == "done":
        query = query.filter_by(is_done=True)

    # view filter (for sidebar)
    if view == "inbox":
        query = query.filter(Task.list_id.is_(None))
    elif view == "today":
        today = datetime.now(timezone.utc).date()
        start = datetime.combine(today, time.min)
        end = datetime.combine(today, time.max)
        query = query.filter(Task.due_at.isnot(None), Task.due_at >= start, Task.due_at <= end)
    elif view == "upcoming":
        today = datetime.now(timezone.utc).date()
        end = datetime.combine(today, time.max)
        query = query.filter(Task.due_at.isnot(None), Task.due_at > end)
    elif view.startswith("list:"):
        try:
            list_id = int(view.split(":", 1)[1])
        except ValueError:
            return err("Invalid list view. Use view=list:<id>", 400)
        query = query.filter(Task.list_id == list_id)
    elif view:
        return err("Invalid view. Use inbox, today, upcoming, or list:<id>", 400)

    items = query.order_by(Task.created_at.desc()).all()
    return ok({"items": [item.to_dict() for item in items]})

@bp.post("")
@api_login_required
def create_task():
    user_id = _require_user_id()
    data = _json_data()

    content = (data.get("content") or "").strip()
    raw_description = data.get("description", "")
    description = raw_description.strip() if isinstance(raw_description, str) else None

    if not content:
        return err("Task content is required", 400)

    try:
        due_at = _parse_iso_datetime(data.get("due_at"))
    except ValueError:
        return err("Invalid due_at format. Use ISO datetime string or null.", 400)
    try:
        list_id = _require_owned_list_id(data.get("list_id"), user_id)
    except (ValueError, PermissionError):
        return err("Invalid list_id", 403)
    
    task = Task(
        title=content,
        notes=description,
        user_id=user_id,
        due_at=due_at,
        list_id=list_id,
    )
    db.session.add(task)
    db.session.commit()
    return ok({"item": task.to_dict()}, 201)


@bp.patch("/<int:task_id>")
@api_login_required
def update_task(task_id: int):
    user_id = _require_user_id()
    task = _get_owned_task(task_id, user_id)
    if task is None:
        return err("Task not found", 404)

    data = _json_data()

    if "content" in data:
        content = (data.get("content") or "").strip()
        if not content:
            return err("Task content is required", 400)
        task.title = content

    if "description" in data:
        raw_description = data.get("description")
        if raw_description is None:
            task.notes = None
        elif isinstance(raw_description, str):
            task.notes = raw_description.strip()
        else:
            return err("Description must be a string or null", 400)

    if "due_at" in data:
        try:
            task.due_at = _parse_iso_datetime(data.get("due_at"))
        except ValueError as e:
            return err(f"due_at {e}", 400)

    if "list_id" in data:
        try:
            task.list_id = _require_owned_list_id(data.get("list_id"), user_id)
        except ValueError as e:
            return err(str(e), 400)
        except PermissionError:
            return err("Invalid list_id", 403)
    
    db.session.commit()
    return ok({"item": task.to_dict()})


@bp.patch("/<int:task_id>/toggle")
@api_login_required
def toggle_task(task_id: int):
    user_id = _require_user_id()
    task = _get_owned_task(task_id, user_id)
    if task is None:
        return err("Task not found", 404)

    data = _json_data()
    if "completed" in data:
        completed = data["completed"]
        if not isinstance(completed, bool):
            return err("completed must be true or false", 400)
        task.is_done = completed
    else:
        task.is_done = not task.is_done

    db.session.commit()
    return ok({"item": task.to_dict()})


@bp.delete("/<int:task_id>")
@api_login_required
def delete_task(task_id: int):
    user_id = _require_user_id()
    task = _get_owned_task(task_id, user_id)
    if task is None:
        return err("Task not found", 404)

    db.session.delete(task)
    db.session.commit()
    return ok({"ok": True})
