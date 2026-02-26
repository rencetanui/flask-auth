from __future__ import annotations

from functools import wraps

from flask import g, jsonify, session

from ..extensions import db
from ..models import User

SESSION_USER_ID_KEY = "user_id"
SESSION_USERNAME_KEY = "username"


def current_user() -> User | None:
    if hasattr(g, "_current_user"):
        return g._current_user

    user_id = session.get(SESSION_USER_ID_KEY)
    if not user_id:
        g._current_user = None
        return None

    user = db.session.get(User, user_id)
    g._current_user = user
    return user


def login_user(user: User) -> None:
    session[SESSION_USER_ID_KEY] = user.id
    session[SESSION_USERNAME_KEY] = user.username
    g._current_user = user


def logout_user() -> None:
    session.clear()
    g._current_user = None


def user_to_dict(user: User) -> dict:
    return user.to_dict()


def api_login_required(view_func):
    @wraps(view_func)
    def wrapped(*args, **kwargs):
        if current_user() is None:
            return jsonify({"error": "Unauthorized"}), 401
        return view_func(*args, **kwargs)

    return wrapped
