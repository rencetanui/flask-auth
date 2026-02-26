from __future__ import annotations

from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models import MyTask
from ..services.auth import api_login_required, current_user

bp = Blueprint("api_tasks", __name__, url_prefix="/api/tasks")

VALID_SHOW_VALUES = {"active", "done", "all"}


def _error(message: str, status: int):
    return jsonify({"error": message}), status


def _json_data() -> dict:
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def _require_user_id() -> int:
    user = current_user()
    if user is None:
        raise RuntimeError("api_login_required must run before _require_user_id")
    return user.id


def _get_owned_task(task_id: int, user_id: int) -> MyTask | None:
    task = db.session.get(MyTask, task_id)
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

    if show not in VALID_SHOW_VALUES:
        return _error("Invalid show filter. Use active, done, or all", 400)

    query = MyTask.query.filter_by(user_id=user_id)
    if show == "active":
        query = query.filter_by(completed=False)
    elif show == "done":
        query = query.filter_by(completed=True)

    items = query.order_by(MyTask.created_at.desc()).all()
    return jsonify({"items": [item.to_dict() for item in items]})


@bp.post("")
@api_login_required
def create_task():
    user_id = _require_user_id()
    data = _json_data()

    content = (data.get("content") or "").strip()
    raw_description = data.get("description", "")
    description = raw_description.strip() if isinstance(raw_description, str) else None

    if not content:
        return _error("Task content is required", 400)

    task = MyTask(content=content, description=description, user_id=user_id)
    db.session.add(task)
    db.session.commit()
    return jsonify({"item": task.to_dict()}), 201


@bp.patch("/<int:task_id>")
@api_login_required
def update_task(task_id: int):
    user_id = _require_user_id()
    task = _get_owned_task(task_id, user_id)
    if task is None:
        return _error("Task not found", 404)

    data = _json_data()

    if "content" in data:
        content = (data.get("content") or "").strip()
        if not content:
            return _error("Task content is required", 400)
        task.content = content

    if "description" in data:
        raw_description = data.get("description")
        if raw_description is None:
            task.description = None
        elif isinstance(raw_description, str):
            task.description = raw_description.strip()
        else:
            return _error("Description must be a string or null", 400)

    db.session.commit()
    return jsonify({"item": task.to_dict()})


@bp.patch("/<int:task_id>/toggle")
@api_login_required
def toggle_task(task_id: int):
    user_id = _require_user_id()
    task = _get_owned_task(task_id, user_id)
    if task is None:
        return _error("Task not found", 404)

    data = _json_data()
    if "completed" in data:
        completed = data["completed"]
        if not isinstance(completed, bool):
            return _error("completed must be true or false", 400)
        task.completed = completed
    else:
        task.completed = not task.completed

    db.session.commit()
    return jsonify({"item": task.to_dict()})


@bp.delete("/<int:task_id>")
@api_login_required
def delete_task(task_id: int):
    user_id = _require_user_id()
    task = _get_owned_task(task_id, user_id)
    if task is None:
        return _error("Task not found", 404)

    db.session.delete(task)
    db.session.commit()
    return jsonify({"ok": True})
