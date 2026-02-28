from datetime import datetime, time

from ..models import Task

def get_sidebar_counts(user_id: int, today_date=None):
    if today_date is None:
        today_date = datetime.utcnow().date()

    start = datetime.combine(today_date, time.min)
    end = datetime.combine(today_date, time.max)

    inbox = Task.query.filter_by(user_id=user_id, is_done=False, list_id=None).count()
    
    overdue = Task.query.filter(
        Task.user_id == user_id,
        Task.is_done.is_(False),
        Task.due_at.isnot(None),
        Task.due_at < start,
    ).count()

    today = Task.query.filter(
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
    
    return {
        "inbox": inbox,
        "overdue": overdue,
        "today": today,
        "upcoming": upcoming,
    }
