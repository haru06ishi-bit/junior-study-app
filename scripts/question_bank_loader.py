"""Shared validated question-bank loader for built-in and v0.44.9 supplement."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SUPPLEMENT = ROOT / "data/question-supplement-v0449.js"
PREFIX = "window.QUESTION_SUPPLEMENT = "


def load_questions():
    questions = json.loads((ROOT / "data/questions.json").read_text(encoding="utf-8"))["questions"]
    if SUPPLEMENT.exists():
        raw = SUPPLEMENT.read_text(encoding="utf-8").strip()
        if not raw.startswith(PREFIX) or not raw.endswith(";"):
            raise ValueError("Supplement JS format is invalid")
        more = json.loads(raw[len(PREFIX):-1])["questions"]
        questions = questions + more
    ids = [q["id"] for q in questions]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate question IDs across built-in and supplemental banks")
    return questions
