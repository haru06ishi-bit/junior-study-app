"""Strict parser of JSON-only QUESTION_SUPPLEMENTS push calls."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PREAMBLE = "window.QUESTION_SUPPLEMENTS = window.QUESTION_SUPPLEMENTS || [];"
PUSH = "window.QUESTION_SUPPLEMENTS.push("

def load_questions():
    questions = json.loads((ROOT / "data/questions.json").read_text(encoding="utf-8"))["questions"]
    for path in sorted((ROOT / "data").glob("question-supplement-v*.js")):
        raw = path.read_text(encoding="utf-8").strip()
        if not raw.startswith(PREAMBLE):
            raise ValueError(f"{path.name}: invalid preamble")
        rest = raw[len(PREAMBLE):].strip()
        if not rest.startswith(PUSH) or not rest.endswith(");"):
            raise ValueError(f"{path.name}: invalid push format")
        payload = json.loads(rest[len(PUSH):-2].strip())
        if not isinstance(payload, dict) or not isinstance(payload.get("questions"), list) or not isinstance(payload.get("version"), str):
            raise ValueError(f"{path.name}: invalid supplement schema")
        questions.extend(payload["questions"])
    ids = [q["id"] for q in questions]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate question IDs across base and supplements")
    return questions
