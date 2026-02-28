from datetime import datetime
from ..extensions import db

class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    list_id = db.Column(db.Integer, db.ForeignKey("task_lists.id"), nullable=True, index=True)  # NULL = Inbox

    title = db.Column(db.String(200), nullable=False)
    notes = db.Column(db.Text, nullable=True)

    priority = db.Column(db.Integer, default=1, nullable=False)  # 0 low,1 med,2 high
    due_at = db.Column(db.DateTime, nullable=True, index=True)
    remind_at = db.Column(db.DateTime, nullable=True, index=True)

    is_done = db.Column(db.Boolean, default=False, nullable=False, index=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            # keep the API stable for the frontend:
            "content": self.title,
            "description": self.notes,
            "completed": bool(self.is_done),
            "due_at": self.due_at.isoformat() if self.due_at else None,
            "list_id": self.list_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "priority": self.priority,
            "remind_at": self.remind_at.isoformat() if self.remind_at else None,
            "user_id": self.user_id,
        }