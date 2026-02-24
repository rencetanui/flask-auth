from functools import wraps
from flask import redirect, session, url_for
from ..extensions import db
from ..models import User

def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("auth.home"))
        return view(*args, **kwargs)
    return wrapped

def current_user():
    uid = session.get("user_id")
    if not uid:
        return None
    return db.session.get(User, uid)