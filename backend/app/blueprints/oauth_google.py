from __future__ import annotations

from urllib.parse import urljoin

from flask import Blueprint, abort, current_app, redirect, request, url_for

from ..extensions import db, oauth
from ..models import User
from ..services.auth import login_user

bp = Blueprint("oauth_google", __name__, url_prefix="/api/auth/google")


@bp.get("/start")
def login_with_google():
    if not current_app.config.get("GOOGLE_OAUTH_ENABLED"):
        abort(404)

    client = oauth.create_client("google")
    if client is None:
        abort(404)

    # where frontend should go after login
    next_url = request.args.get("next")

    redirect_uri = url_for("oauth_google.callback", _external=True)

    return client.authorize_redirect(
        redirect_uri,
        state=next_url or ""
    )


@bp.get("/callback")
def callback():
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
        user.password = None
        db.session.add(user)
        db.session.commit()

    login_user(user)

    frontend_url = current_app.config.get("FRONTEND_URL") or "http://localhost:5173/"
    next_url = request.args.get("state")

    if next_url:
        return redirect(next_url)

    return redirect(urljoin(frontend_url, "/inbox"))