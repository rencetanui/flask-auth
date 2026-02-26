from __future__ import annotations

from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models import User
from ..services.auth import api_login_required, current_user, login_user, logout_user, user_to_dict

bp = Blueprint("api_auth", __name__, url_prefix="/api/auth")


def _json_data() -> dict:
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def _error(message: str, status: int):
    return jsonify({"error": message}), status


@bp.post("/login")
def login():
    data = _json_data()
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return _error("Username and password are required", 400)

    user = User.query.filter_by(username=username).first()
    if user is None or not user.check_password(password):
        return _error("Invalid username or password", 401)

    login_user(user)
    return jsonify({"user": user_to_dict(user)})


@bp.post("/register")
def register():
    data = _json_data()
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    confirm_password = data.get("confirm_password") or ""

    if not username or not password or not confirm_password:
        return _error("All fields are required", 400)
    if len(username) < 3:
        return _error("Username must be at least 3 characters", 400)
    if len(password) < 6:
        return _error("Password must be at least 6 characters", 400)
    if password != confirm_password:
        return _error("Passwords do not match", 400)
    if User.query.filter_by(username=username).first():
        return _error("Username already exists", 409)

    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    login_user(user)
    return jsonify({"user": user_to_dict(user)}), 201


@bp.post("/logout")
def logout():
    logout_user()
    return jsonify({"ok": True})


@bp.get("/me")
@api_login_required
def me():
    user = current_user()
    if user is None:
        return _error("Unauthorized", 401)
    return jsonify({"user": user_to_dict(user)})
