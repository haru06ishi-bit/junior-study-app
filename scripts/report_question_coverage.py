#!/usr/bin/env python3
"""Report coverage without changing question data.

Run: python3 scripts/report_question_coverage.py
     python3 scripts/report_question_coverage.py --json
"""
import argparse
import collections
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAIN = ("japanese", "math", "english", "science", "social")
PUBLISHERS = {
    "japanese": ("sanseido",),
    "math": ("keirinkan",),
    "english": ("mitsumura",),
    "science": ("keirinkan",),
    "social": ("teikoku", "tokyo-shoseki"),
}


def run():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON")
    parser.add_argument("--minimum", type=int, default=15)
    args = parser.parse_args()
    questions = json.loads((ROOT / "data/questions.json").read_text(encoding="utf-8"))["questions"]
    curriculum = json.loads((ROOT / "data/curriculum.json").read_text(encoding="utf-8"))
    counts = collections.Counter()
    exclusive = collections.Counter()
    materials = collections.Counter()
    for q in questions:
        subject = q.get("subject")
        if subject not in MAIN:
            continue
        publisher = q.get("textbookPublisher") or "common"
        for grade in q.get("grades") or []:
            key = (subject, grade, q.get("unit"))
            counts[key] += 1
            exclusive[(publisher, *key)] += 1
            for material in set(q.get("materialIds") or []):
                materials[(publisher, subject, grade, material)] += 1

    rows = []
    for subject in curriculum.get("subjects", []):
        sid = subject.get("id")
        if sid not in MAIN:
            continue
        for field in subject.get("fields", []):
            for unit in field.get("units", []):
                for grade in unit.get("grades", []):
                    row = {
                        "subject": sid,
                        "grade": grade,
                        "field": field.get("id"),
                        "unit": unit.get("id"),
                        "unit_name": unit.get("name"),
                        "all_publishers_count": counts[(sid, grade, unit.get("id"))],
                        "common": exclusive[("common", sid, grade, unit.get("id"))],
                        "publishers": {
                            p: exclusive[(p, sid, grade, unit.get("id"))]
                            for p in PUBLISHERS[sid]
                        },
                    }
                    row["below_minimum"] = row["all_publishers_count"] < args.minimum
                    rows.append(row)
    rows.sort(key=lambda r: (r["all_publishers_count"], r["subject"], r["grade"], r["unit"]))
    material_rows = [
        {"publisher": p, "subject": s, "grade": g, "material_id": m, "count": n}
        for (p, s, g, m), n in sorted(materials.items())
    ]
    output = {
        "total_questions": len(questions),
        "minimum": args.minimum,
        "below_minimum_units": sum(r["below_minimum"] for r in rows),
        "unit_rows": rows,
        "material_counts_observed_only": material_rows,
        "note": "Material IDs with zero questions cannot be inferred from questions.json. Compare against the textbook material catalog separately. Counts are not a quality score.",
    }
    if args.json:
        print(json.dumps(output, ensure_ascii=False, indent=2))
    else:
        print(f"Total questions: {len(questions)}")
        print(f"Unit/grade rows below {args.minimum}: {output['below_minimum_units']}/{len(rows)}")
        print("All-publisher counts include common questions; publisher counts exclude common questions.")
        for r in rows:
            pub = ", ".join(f"{p}={n}" for p, n in r["publishers"].items())
            print(f"{r['subject']:9s} G{r['grade']} {str(r['unit']):25s} all={r['all_publishers_count']:3d} common={r['common']:3d} {pub}")
        print(f"Material assignments observed: {len(material_rows)}; zero-material coverage requires catalog comparison.")


if __name__ == "__main__":
    run()
