from __future__ import annotations

from flask import Blueprint

from ..services.auth import api_login_required, current_user
from ..utils import ok
from .sidebar import build_lists_payload, build_sidebar_counts

bp = Blueprint("bootstrap", __name__, url_prefix="/api")


@bp.get("/bootstrap")
@api_login_required
def bootstrap():
    user = current_user()
    return ok({
        "counts": build_sidebar_counts(user.id),
        "lists": build_lists_payload(user.id),
    })
