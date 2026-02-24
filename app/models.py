from __future__ import annotations
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
from .extensions import db

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

