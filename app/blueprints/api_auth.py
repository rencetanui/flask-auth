from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from ..extensions import db
from ..models import User

bp = Blueprint("api_auth", __name__, url_prefix="/api/auth")


@bp.post("/register")
def api_register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    confirm = data.get("confirm_password") or ""

    if not username or not password or not confirm:
        return jsonify({"error": "All fields are required"}), 400
    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if password != confirm:
        return jsonify({"error": "Passwords do not match"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409

    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=user.id)
    return jsonify({"access_token": token, "user": {"id": user.id, "username": user.username}}), 201


@bp.post("/login")
def api_login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    user = User.query.filter_by(username=username).first()
    if user is None or not user.check_password(password):
        return jsonify({"error": "Invalid username or password"}), 401

    token = create_access_token(identity=user.id)
    return jsonify({"access_token": token, "user": {"id": user.id, "username": user.username}})


@bp.get("/me")
@jwt_required()
def api_me():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    return jsonify({"id": user.id, "username": user.username})