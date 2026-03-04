from flask import Blueprint
from ..services.auth import api_login_required, current_user
from ..utils import ok
from .sidebar import build_lists_payload

bp = Blueprint("lists", __name__, url_prefix="/api")

@bp.get("/lists")
@api_login_required
def list_lists():
    u = current_user()
    return ok({"items": build_lists_payload(u.id)})
