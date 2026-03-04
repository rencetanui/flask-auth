from __future__ import annotations

from flask import Blueprint, request

from ..extensions import db
from ..models import User
from ..services.auth import api_login_required, current_user, login_user, logout_user, user_to_dict
from ..utils import err, ok

bp = Blueprint("api_auth", __name__, url_prefix="/api/auth")


def _json_data() -> dict:
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}

@bp.post("/login")
def login():
    data = _json_data()
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return err("Username and password are required", 400)

    user = User.query.filter_by(username=username).first()
    if user is None or not user.check_password(password):
        return err("Invalid username or password", 401)

    login_user(user)
    return ok({"user": user_to_dict(user)})


@bp.post("/register")
def register():
    data = _json_data()
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    confirm_password = data.get("confirm_password") or ""

    if not username or not password or not confirm_password:
        return err("All fields are required", 400)
    if len(username) < 3:
        return err("Username must be at least 3 characters", 400)
    if len(password) < 6:
        return err("Password must be at least 6 characters", 400)
    if password != confirm_password:
        return err("Passwords do not match", 400)
    if User.query.filter_by(username=username).first():
        return err("Username already exists", 409)

    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    login_user(user)
    return ok({"user": user_to_dict(user)}, 201)


@bp.post("/logout")
def logout():
    logout_user()
    return ok({"ok": True})


@bp.get("/me")
@api_login_required
def me():
    user = current_user()
    if user is None:
        return err("Unauthorized", 401)
    return ok({"user": user_to_dict(user)})
