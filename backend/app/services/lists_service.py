from app.models import TaskList

def list_lists_for_user(user_id: int):
    return TaskList.query.filter_by(user_id=user_id).order_by(TaskList.created_at.desc()).all()