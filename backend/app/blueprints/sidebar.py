from datetime import datetime, time
from flask import Blueprint, jsonify
from sqlalchemy import func

from ..services.auth import api_login_required, current_user
from ..models import Task, TaskList
from ..extensions import db

bp = Blueprint("sidebar", __name__, url_prefix="/api/sidebar")

@bp.get("/counts")
@api_login_required
def counts():
    u = current_user()

    today = datetime.utcnow().date()
    start = datetime.combine(today, time.min)
    end = datetime.combine(today, time.max)

    inbox = Task.query.filter(
        Task.user_id == u.id,
        Task.is_done.is_(False),
        Task.list_id.is_(None),
    ).count()

    today_count = Task.query.filter(
        Task.user_id == u.id,
        Task.is_done.is_(False),
        Task.due_at.isnot(None),
        Task.due_at >= start,
        Task.due_at <= end,
    ).count()

    upcoming = Task.query.filter(
        Task.user_id == u.id,
        Task.is_done.is_(False),
        Task.due_at.isnot(None),
        Task.due_at > end,
    ).count()

    completed = Task.query.filter(
        Task.user_id == u.id,
        Task.is_done.is_(True),
    ).count()

    # Optional: counts per list (for badges next to School/Home/etc.)
    per_list_rows = (
        db.session.query(Task.list_id, func.count(Task.id))
        .filter(
            Task.user_id == u.id,
            Task.is_done.is_(False),
            Task.list_id.isnot(None),
        )
        .group_by(Task.list_id)
        .all()
    )
    per_list = {list_id: cnt for (list_id, cnt) in per_list_rows}

    return jsonify({
        "inbox": inbox,
        "today": today_count,
        "upcoming": upcoming,
        "completed": completed,
        "lists": per_list,  # { list_id: active_task_count }
    })