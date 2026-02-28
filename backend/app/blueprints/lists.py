from flask import Blueprint, jsonify
from ..services.auth import api_login_required, current_user
from ..models.task_list import TaskList

bp = Blueprint("lists", __name__, url_prefix="/api")

@bp.get("/lists")
@api_login_required
def list_lists():
    u = current_user()
    lists = (
        TaskList.query
        .filter(TaskList.user_id == u.id)
        .order_by(TaskList.name.asc())
        .all()
    )
    return jsonify({"items": [{"id": l.id, "name": l.name} for l in lists]})