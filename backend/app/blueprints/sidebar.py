from datetime import datetime, time, timezone

from flask import Blueprint
from sqlalchemy import func

from ..services.auth import api_login_required, current_user
from ..models import Task, TaskList
from ..extensions import db
from ..utils import ok

bp = Blueprint("sidebar", __name__, url_prefix="/api/sidebar")


def build_sidebar_counts(user_id: int) -> dict:
    today = datetime.now(timezone.utc).date()
    start = datetime.combine(today, time.min)
    end = datetime.combine(today, time.max)

    inbox = Task.query.filter(
        Task.user_id == user_id,
        Task.is_done.is_(False),
        Task.list_id.is_(None),
    ).count()

    today_count = Task.query.filter(
        Task.user_id == user_id,
        Task.is_done.is_(False),
        Task.due_at.isnot(None),
        Task.due_at >= start,
        Task.due_at <= end,
    ).count()

    upcoming = Task.query.filter(
        Task.user_id == user_id,
        Task.is_done.is_(False),
        Task.due_at.isnot(None),
        Task.due_at > end,
    ).count()

    completed = Task.query.filter(
        Task.user_id == user_id,
        Task.is_done.is_(True),
    ).count()

    per_list_rows = (
        db.session.query(Task.list_id, func.count(Task.id))
        .filter(
            Task.user_id == user_id,
            Task.is_done.is_(False),
            Task.list_id.isnot(None),
        )
        .group_by(Task.list_id)
        .all()
    )
    per_list = {list_id: cnt for (list_id, cnt) in per_list_rows}

    return {
        "inbox": inbox,
        "today": today_count,
        "upcoming": upcoming,
        "completed": completed,
        "lists": per_list,
    }


def build_lists_payload(user_id: int) -> list[dict]:
    lists = (
        TaskList.query
        .filter(TaskList.user_id == user_id)
        .order_by(TaskList.name.asc())
        .all()
    )
    return [{"id": item.id, "name": item.name} for item in lists]

@bp.get("/counts")
@api_login_required
def counts():
    u = current_user()
    return ok(build_sidebar_counts(u.id))
