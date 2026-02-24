from flask import Flask, app
import jwt
from .config import Config
from .extensions import db, migrate, oauth
from .blueprints.auth import bp as auth_bp
from .blueprints.tasks import bp as tasks_bp
from .blueprints.api_tasks import bp as api_tasks_bp
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .blueprints.api_auth import bp as api_auth_bp

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    oauth.init_app(app)

    # OAuth register
    from api_key import CLIENT_ID, CLIENT_SECRET
    oauth.register(
        name="google",
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(api_tasks_bp)
    app.register_blueprint(api_auth_bp)

    return app

CORS(app, supports_credentials=False) 
jwt.init_app(app)