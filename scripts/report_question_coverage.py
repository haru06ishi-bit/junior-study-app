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

def run():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON")
    parser.add_argument("--minimum", type=int, default=15)
    args = parser.parse_args()
    questions = json.loads((ROOT / "data/questions.json").read_text(encoding="utf-8"))["questions"]
    supplement_path = ROOT / "data/question-supplement-v0449.js"
    if supplement_path.exists():
        raw = supplement_path.read_text(encoding="utf-8").strip()
        prefix = "window.QUESTION_SUPPLEMENT = "
        if not raw.startswith(prefix) or not raw.endswith(";"):
            raise ValueError("Unexpected supplemental question format")
        extras = json.loads(raw[len(prefix):-1]).get("questions", [])
        existing = {q["id"] for q in questions}
        overlap = existing.intersection(q["id"] for q in extras)
        if overlap or len({q["id"] for q in extras}) != len(extras):
            raise ValueError("Duplicate supplement question IDs")
        questions.extend(extras)
    from question_bank_loader import load_questions
    questions = load_questions()
    curriculum = json.loads((ROOT / "data/curriculum.json").read_text(encoding="utf-8"))
    adoption = json.loads((ROOT / "data/textbooks.json").read_text(encoding="utf-8"))
    district = next(d for d in adoption["districts"] if d["id"] == "shizuoka")
    exclusive = collections.Counter()
    materials = collections.Counter()
    selected_items = collections.defaultdict(list)
    for q in questions:
        subject = q.get("subject")
        if subject not in MAIN:
            continue
        publisher = q.get("textbookPublisher") or "common"
        for grade in q.get("grades") or []:
            key = (subject, grade, q.get("unit"))
            exclusive[(publisher, *key)] += 1
            selected_items[key].append(q)
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
                    field_id = field.get("id")
                    part = field_id if sid == "social" else ("language" if sid == "japanese" else "main")
                    selected = district["adoptions"][sid][part]
                    eligible = exclusive[("common", sid, grade, unit.get("id"))] + exclusive[(selected, sid, grade, unit.get("id"))]
                    row = {
                        "subject": sid,
                        "grade": grade,
                        "field": field.get("id"),
                        "unit": unit.get("id"),
                        "unit_name": unit.get("name"),
                        "shizuoka_eligible_count": eligible,
                        "common": exclusive[("common", sid, grade, unit.get("id"))],
                        "publishers": {
                            p: exclusive[(p, sid, grade, unit.get("id"))]
                            for p in (selected,)
                        },
                    }
                    matched = [q for q in selected_items[(sid, grade, unit.get("id"))] if (q.get("textbookPublisher") or "common") in ("common", selected)]
                    row["difficulty"] = dict(collections.Counter(str(q.get("difficulty", "unknown")) for q in matched))
                    row["question_types"] = dict(collections.Counter(q.get("type", "unknown") for q in matched))
                    row["with_stimulus"] = sum(bool(q.get("passage") or q.get("table") or q.get("figure")) for q in matched)
                    row["shortfall"] = max(0, args.minimum-row["shizuoka_eligible_count"])
                    row["below_minimum"] = row["shizuoka_eligible_count"] < args.minimum
                    rows.append(row)
    rows.sort(key=lambda r: (r["shizuoka_eligible_count"], r["subject"], r["grade"], r["unit"]))

    catalog = json.loads((ROOT / "candidates.json").read_text(encoding="utf-8"))
    material_catalog = []
    for subject in ("japanese", "english"):
        publisher = district["adoptions"][subject]["language" if subject == "japanese" else "main"]
        prefix = "j" if subject == "japanese" else "e"
        for grade_text, items in catalog.get(subject, {}).get(publisher, {}).items():
            grade = int(grade_text)
            for index, item in enumerate(items):
                material_id = f"{prefix}-{publisher}-{grade}-{index}"
                common_count = materials[("common", subject, grade, material_id)]
                dedicated_count = materials[(publisher, subject, grade, material_id)]
                count = common_count + dedicated_count
                material_catalog.append({
                    "subject": subject, "publisher": publisher, "grade": grade,
                    "material_id": material_id,
                    "title": item[0] if isinstance(item, list) else item,
                    "count": count, "common": common_count,
                    "publisher_specific": dedicated_count,
                    "shortfall": max(0, args.minimum - count),
                    "status": "zero" if count == 0 else ("under_minimum" if count < args.minimum else "sufficient"),
                })
    material_catalog.sort(key=lambda r: (r["count"], r["subject"], r["grade"], r["material_id"]))
    output = {
        "total_questions": len(questions),
        "minimum": args.minimum,
        "below_minimum_units": sum(r["below_minimum"] for r in rows),
        "shortfall": sum(r["shortfall"] for r in rows),
        "unit_rows": rows,
        "material_catalog": material_catalog,
        "note": "Unit shortfall sums grade-specific gaps; multi-grade questions count once in each grade. It is not the number of distinct questions to author. Counts are not a quality score.",
    }
    if args.json:
        print(json.dumps(output, ensure_ascii=False, indent=2))
    else:
        print(f"Total questions: {len(questions)}")
        print(f"Shizuoka eligible unit/grade rows below {args.minimum}: {output['below_minimum_units']}/{len(rows)}")
        print(f"Unit/grade shortfall: {output['shortfall']} (multi-grade questions may cover multiple rows; not unique questions required)")
        for r in rows:
            pub = ", ".join(f"{p}={n}" for p, n in r["publishers"].items())
            print(f"{r['subject']:9s} G{r['grade']} {str(r['unit']):25s} eligible={r['shizuoka_eligible_count']:3d} shortfall={r['shortfall']:3d} common={r['common']:3d} {pub} difficulty={r['difficulty']} types={r['question_types']} stimulus={r['with_stimulus']}")
        print(f"Shizuoka adopted textbook materials: {len(material_catalog)}")
        for m in material_catalog:
            print(f"{m['subject']:9s} G{m['grade']} {m['material_id']} {m['title']} count={m['count']} shortfall={m['shortfall']} status={m['status']} common={m['common']} dedicated={m['publisher_specific']}")


if __name__ == "__main__":
    run()
