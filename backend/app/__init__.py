from __future__ import annotations

import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from .config import Config
from .extensions import db, migrate, oauth


def create_app(config_object: type[Config] = Config) -> Flask:
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_object)

    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)
    oauth.init_app(app)

    CORS(
        app,
        resources={r"/api/*": {"origins": ["http://localhost:5173"]}},
        supports_credentials=True,
    )

    _register_oauth_client(app)
    _register_blueprints(app)
    _register_error_handlers(app)

    @app.get("/health")
    @app.get("/api/health")
    def health() -> tuple[dict, int]:
        return {
            "ok": True,
            "google_oauth_enabled": bool(app.config.get("GOOGLE_OAUTH_ENABLED")),
        }, 200

    return app


def _register_blueprints(app: Flask) -> None:
    from .blueprints.oauth_google import bp as oauth_google_bp
    from .blueprints.api_auth import bp as api_auth_bp
    from .blueprints.api_tasks import bp as api_tasks_bp
    from .blueprints.sidebar import bp as sidebar_bp
    from .blueprints.lists import bp as lists_bp
    
    app.register_blueprint(oauth_google_bp)
    app.register_blueprint(api_auth_bp)
    app.register_blueprint(api_tasks_bp)
    app.register_blueprint(sidebar_bp)
    app.register_blueprint(lists_bp)


def _register_oauth_client(app: Flask) -> None:
    try:
        from api_key import CLIENT_ID, CLIENT_SECRET
    except Exception:
        app.config["GOOGLE_OAUTH_ENABLED"] = False
        return

    if not CLIENT_ID or not CLIENT_SECRET:
        app.config["GOOGLE_OAUTH_ENABLED"] = False
        return

    oauth.register(
        name="google",
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )
    app.config["GOOGLE_OAUTH_ENABLED"] = True


def _register_error_handlers(app: Flask) -> None:
    @app.errorhandler(HTTPException)
    def handle_http_error(error: HTTPException):
        if request.path.startswith("/api/"):
            message = error.description or error.name
            return jsonify({"error": message}), error.code
        return error

    @app.errorhandler(Exception)
    def handle_unexpected_error(error: Exception):
        if request.path.startswith("/api/"):
            return jsonify({"error": "Internal server error"}), 500
        raise error
