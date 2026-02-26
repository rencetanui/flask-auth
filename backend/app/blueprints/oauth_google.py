from __future__ import annotations

from urllib.parse import urljoin

from flask import Blueprint, abort, current_app, redirect, url_for

from ..extensions import db, oauth
from ..models import User
from ..services.auth import login_user

bp = Blueprint("oauth_google", __name__)


@bp.get("/login/google")
def login_with_google():
    if not current_app.config.get("GOOGLE_OAUTH_ENABLED"):
        abort(404)

    client = oauth.create_client("google")
    if client is None:
        abort(404)

    redirect_uri = current_app.config.get("GOOGLE_REDIRECT_URI") or url_for(
        "oauth_google.authorize_google", _external=True
    )
    return client.authorize_redirect(redirect_uri)


@bp.get("/authorize/google")
def authorize_google():
    if not current_app.config.get("GOOGLE_OAUTH_ENABLED"):
        abort(404)

    client = oauth.create_client("google")
    if client is None:
        abort(404)

    client.authorize_access_token()

    userinfo_endpoint = client.server_metadata["userinfo_endpoint"]
    info = client.get(userinfo_endpoint).json()

    email = info.get("email")
    if not email:
        abort(400)

    user = User.query.filter_by(username=email).first()
    if not user:
        user = User(username=email)
        db.session.add(user)
        db.session.commit()

    login_user(user)

    frontend_url = current_app.config.get("FRONTEND_URL") or "http://localhost:5173/"
    return redirect(urljoin(frontend_url, "/"))
