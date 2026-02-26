import os

# Optional Google OAuth credentials. Leave blank if you are not using Google login.
CLIENT_ID = os.environ.get(
    "GOOGLE_CLIENT_ID",
    "788619937055-1j4rk9f4nvqjb9np3jju73tr6uu9td64.apps.googleusercontent.com",
)
CLIENT_SECRET = os.environ.get(
    "GOOGLE_CLIENT_SECRET",
    "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",
)
