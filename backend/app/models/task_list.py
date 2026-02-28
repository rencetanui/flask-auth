from datetime import datetime
from ..extensions import db

class TaskList(db.Model):
    __tablename__ = 'task_lists'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    due_at = db.Column(db.DateTime, nullable=True)
    list_id = db.Column(db.Integer, db.ForeignKey('task_lists.id'), nullable=True)  # 