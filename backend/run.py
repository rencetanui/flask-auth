from app import create_app
from app.extensions import db

app = create_app()


def _ensure_tables() -> None:
    # Dev convenience so the API works on first run without migrations yet.
    with app.app_context():
        db.create_all()


if __name__ == "__main__":
    _ensure_tables()
    app.run(host="localhost", port=5000, debug=True)
