from __future__ import annotations


def strip_private_fields(doc: dict) -> dict:
    doc.pop("_id", None)
    doc.pop("password_hash", None)
    return doc

