from flask import Blueprint, abort, redirect, render_template, request, url_for
from ..extensions import db
from ..models import MyTask
from ..services.auth import current_user, login_required

bp = Blueprint("tasks", __name__)

@bp.route("/dashboard", methods=["GET", "POST"])
@login_required
def dashboard():
    user = current_user()
    if user is None:
        return redirect(url_for("auth.home"))

    show = request.args.get("show", "active")
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
            db.session.add(MyTask(content=content, description=description, user_id=user.id))

        db.session.commit()
        return redirect(url_for("tasks.dashboard", show=show))

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

@bp.post("/tasks/<int:id>/delete")
@login_required
def delete_task(id: int):
    user = current_user()
    task = MyTask.query.get_or_404(id)
    if not user or task.user_id != user.id:
        abort(403)

    show = request.args.get("show", "active")
    db.session.delete(task)
    db.session.commit()
    return redirect(url_for("tasks.dashboard", show=show))

@bp.post("/tasks/<int:id>/toggle")
@login_required
def toggle_task(id: int):
    user = current_user()
    task = MyTask.query.get_or_404(id)
    if not user or task.user_id != user.id:
        abort(403)

    show = request.args.get("show", "active")
    task.completed = ("completed" in request.form)
    db.session.commit()
    return redirect(url_for("tasks.dashboard", show=show))