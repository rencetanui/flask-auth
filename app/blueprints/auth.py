from flask import Blueprint, abort, redirect, render_template, request, session, url_for
from ..extensions import db, oauth
from ..models import User

bp = Blueprint("auth", __name__)

@bp.get("/")
def home():
    if "user_id" in session:
        return redirect(url_for("tasks.dashboard"))
    return render_template("index.html")

@bp.route("/login", methods=["GET", "POST"])
def login():
    if "user_id" in session:
        return redirect(url_for("tasks.dashboard"))

    error = None
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        user = User.query.filter_by(username=username).first()
        if user is None or not user.check_password(password):
            error = "Invalid username or password."
        else:
            session["user_id"] = user.id
            session["username"] = user.username
            return redirect(url_for("tasks.dashboard"))

    return render_template("index.html", error=error)

@bp.route("/register", methods=["GET", "POST"])
def register():
    if "user_id" in session:
        return redirect(url_for("tasks.dashboard"))

    error = None
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")

        if not username or not password or not confirm_password:
            error = "All fields are required."
        elif len(username) < 3:
            error = "Username must be at least 3 characters."
        elif len(password) < 6:
            error = "Password must be at least 6 characters."
        elif password != confirm_password:
            error = "Passwords do not match."
        elif User.query.filter_by(username=username).first():
            error = "Username already exists."

        if error:
            return render_template("register.html", error=error)

        user = User(username=username)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        session["user_id"] = user.id
        session["username"] = user.username
        return redirect(url_for("tasks.dashboard"))

    return render_template("register.html")

@bp.get("/logout")
def logout():
    session.clear()
    return redirect(url_for("auth.home"))

# Google OAuth
@bp.get("/login/google")
def login_with_google():
    client = oauth.create_client("google")
    redirect_uri = url_for("auth.authorize_google", _external=True)
    return client.authorize_redirect(redirect_uri)

@bp.get("/authorize/google")
def authorize_google():
    client = oauth.create_client("google")
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

    session["user_id"] = user.id
    session["username"] = user.username
    return redirect(url_for("tasks.dashboard"))