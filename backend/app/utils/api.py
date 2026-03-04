from __future__ import annotations

from flask import jsonify


def ok(data=None, status: int = 200):
    return jsonify(data or {}), status


def err(message: str, status: int = 400):
    return jsonify({"error": message}), status
