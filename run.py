from pathlib import Path
import sys

# Root shim: prioritize the refactored backend app package over the legacy root app/.
BACKEND_DIR = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app import create_app  # type: ignore  # noqa: E402
from app.extensions import db  # type: ignore  # noqa: E402

app = create_app()


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="localhost", port=5000, debug=True)
