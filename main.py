from __future__ import annotations

from datetime import datetime
from functools import wraps

from flask import Flask, abort, redirect, render_template, request, session, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

from authlib.integrations.flask_client import OAuth
from api_key import CLIENT_ID, CLIENT_SECRET

# -------------------------
# App + Config
# -------------------------
app = Flask(__name__)
app.secret_key = "your_secret_key"  # ✅ replace with an env var in production

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False,  # ✅ True in production (HTTPS)
)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# -------------------------
# OAuth (Google)
# -------------------------
oauth = OAuth(app)
oauth.register(
    name="google",
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

# -------------------------
# Helpers
# -------------------------
def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("home"))
        return view(*args, **kwargs)

    return wrapped


def current_user():
    uid = session.get("user_id")
    if not uid:
        return None
    return db.session.get(User, uid)


# -------------------------
# Models
# -------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=True)  # ✅ allow OAuth-only accounts

    tasks = db.relationship(
        "MyTask", backref="user", lazy=True, cascade="all, delete-orphan"
    )

    def set_password(self, password: str):
        self.password = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        if not self.password:
            return False
        return check_password_hash(self.password, password)


class MyTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    def __repr__(self) -> str:
        return f"<Task {self.id}: {self.content}>"


# -------------------------
# Auth Routes
# -------------------------
@app.route("/")
def home():
    if "user_id" in session:
        return redirect(url_for("dashboard"))
    return render_template("index.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if "user_id" in session:
        return redirect(url_for("dashboard"))

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
            return redirect(url_for("dashboard"))

    return render_template("index.html", error=error)


@app.route("/register", methods=["GET", "POST"])
def register():
    if "user_id" in session:
        return redirect(url_for("dashboard"))

    error = None

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        if not username or not password:
            error = "Username and password are required."
        elif len(username) < 3:
            error = "Username must be at least 3 characters."
        elif len(password) < 6:
            error = "Password must be at least 6 characters."
        elif User.query.filter_by(username=username).first():
            error = "Username already exists."

        if error:
            return render_template("index.html", error=error)

        new_user = User(username=username)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        session["user_id"] = new_user.id
        session["username"] = new_user.username
        return redirect(url_for("dashboard"))

    return render_template("index.html")


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))


# -------------------------
# Dashboard (Tasks)
# -------------------------
@app.route("/dashboard", methods=["GET", "POST"])
@login_required
def dashboard():
    user = current_user()
    if user is None:
        return redirect(url_for("home"))

    show = request.args.get("show", "active")  # active | all | done
    edit_id = request.args.get("edit", type=int)

    task_to_edit = None
    if edit_id:
        task_to_edit = MyTask.query.get_or_404(edit_id)
        if task_to_edit.user_id != user.id:
            abort(403)

    if request.method == "POST":
        content = request.form.get("content", "").strip()
        description = request.form.get("description", "").strip()

        if not content:
            return "Task content is required", 400

        if task_to_edit:
            task_to_edit.content = content
            task_to_edit.description = description
        else:
            db.session.add(
                MyTask(content=content, description=description, user_id=user.id)
            )

        db.session.commit()
        return redirect(url_for("dashboard", show=show))

    q = MyTask.query.filter_by(user_id=user.id)
    if show == "done":
        q = q.filter_by(completed=True)
    elif show == "all":
        pass
    else:
        q = q.filter_by(completed=False)

    tasks = q.order_by(MyTask.created_at.desc()).all()

    return render_template(
        "dashboard.html",
        username=user.username,
        tasks=tasks,
        task_to_edit=task_to_edit,
        show=show,
    )


# -------------------------
# Task Actions
# -------------------------
@app.route("/tasks/<int:id>/delete", methods=["POST"])
@login_required
def delete_task(id: int):
    user = current_user()
    task = MyTask.query.get_or_404(id)

    if not user or task.user_id != user.id:
        abort(403)

    show = request.args.get("show", "active")
    db.session.delete(task)
    db.session.commit()
    return redirect(url_for("dashboard", show=show))


@app.route("/tasks/<int:id>/toggle", methods=["POST"])
@login_required
def toggle_task(id: int):
    user = current_user()
    task = MyTask.query.get_or_404(id)

    if not user or task.user_id != user.id:
        abort(403)

    show = request.args.get("show", "active")
    task.completed = ("completed" in request.form)  # ✅ checkbox-safe
    db.session.commit()
    return redirect(url_for("dashboard", show=show))


# -------------------------
# Google OAuth
# -------------------------
@app.route("/login/google")
def login_with_google():
    client = oauth.create_client("google")
    redirect_uri = url_for("authorize_google", _external=True)
    return client.authorize_redirect(redirect_uri)


@app.route("/authorize/google")
def authorize_google():
    client = oauth.create_client("google")
    client.authorize_access_token()

    userinfo_endpoint = client.server_metadata["userinfo_endpoint"]
    resp = client.get(userinfo_endpoint)
    info = resp.json()

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
    return redirect(url_for("dashboard"))


# -------------------------
# Run
# -------------------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
