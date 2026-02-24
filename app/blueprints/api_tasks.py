from __future__ import annotations

from flask import Blueprint, abort, jsonify, request

from app.services.auth import login_required

from ..extensions import db
from ..models import MyTask, User
from flask_jwt_extended import current_user, jwt_required, get_jwt_identity

bp = Blueprint("api_tasks", __name__, url_prefix="/api")


def task_to_dict(t: MyTask) -> dict:
    return {
        "id": t.id,
        "content": t.content,
        "description": t.description,
        "completed": t.completed,
        "created_at": t.created_at.isoformat() if t.created_at else None,
    }


@bp.get("/tasks")
@jwt_required()
def list_tasks():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        abort(401)

    show = request.args.get("show", "active")  # active|done|all

    q = MyTask.query.filter_by(user_id=user.id)
    if show == "done":
        q = q.filter_by(completed=True)
    elif show == "all":
        pass
    else:
        q = q.filter_by(completed=False)

    tasks = q.order_by(MyTask.created_at.desc()).all()
    return jsonify({"items": [task_to_dict(t) for t in tasks]})


@bp.post("/tasks")
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        abort(401)

    data = request.get_json(silent=True) or {}
    content = (data.get("content") or "").strip()
    description = (data.get("description") or "").strip()

    if not content:
        return jsonify({"error": "Task content is required"}), 400

    t = MyTask(content=content, description=description, user_id=user.id)
    db.session.add(t)
    db.session.commit()
    return jsonify({"item": task_to_dict(t)}), 201


@bp.patch("/tasks/<int:task_id>")
@jwt_required()
def update_task(task_id: int):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    t = MyTask.query.get_or_404(task_id)
    if not user or t.user_id != user.id:
        abort(403)

    data = request.get_json(silent=True) or {}

    if "content" in data:
        content = (data.get("content") or "").strip()
        if not content:
            return jsonify({"error": "Task content is required"}), 400
        t.content = content

    if "description" in data:
        t.description = (data.get("description") or "").strip()

    db.session.commit()
    return jsonify({"item": task_to_dict(t)})


@bp.patch("/tasks/<int:task_id>/toggle")
@jwt_required()
def toggle_task(task_id: int):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    t = MyTask.query.get_or_404(task_id)
    if not user or t.user_id != user.id:
        abort(403)

    data = request.get_json(silent=True) or {}
    # If client provides completed: true/false, use it; else toggle.
    if "completed" in data:
        t.completed = bool(data["completed"])
    else:
        t.completed = not t.completed

    db.session.commit()
    return jsonify({"item": task_to_dict(t)})


@bp.delete("/tasks/<int:task_id>")
@jwt_required()
def delete_task(task_id: int):
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    t = MyTask.query.get_or_404(task_id)
    if not user or t.user_id != user.id:
        abort(403)

    db.session.delete(t)
    db.session.commit()
    return jsonify({"ok": True})