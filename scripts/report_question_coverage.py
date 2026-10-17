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
    adoption = json.loads((ROOT / "data/textbooks.json").read_text(encoding="utf-8"))
    district = next(d for d in adoption["districts"] if d["id"] == "shizuoka")
    counts = collections.Counter()
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
            counts[key] += 1
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
                        "all_publishers_count": eligible,
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
                    row["shortfall"] = max(0, args.minimum-row["all_publishers_count"])
                    row["below_minimum"] = row["all_publishers_count"] < args.minimum
                    rows.append(row)
    rows.sort(key=lambda r: (r["all_publishers_count"], r["subject"], r["grade"], r["unit"]))
    material_rows = [
        {"publisher": p, "subject": s, "grade": g, "material_id": m, "count": n}
        for (p, s, g, m), n in sorted(materials.items())
    ]
    catalog = json.loads((ROOT / "candidates.json").read_text(encoding="utf-8"))
    material_catalog = []
    for subject in ("japanese", "english"):
        p = district["adoptions"][subject]["language" if subject == "japanese" else "main"]
        for grade, items in catalog.get(subject, {}).get(p, {}).items():
            for item in items:
                material_catalog.append({"subject": subject, "publisher": p, "grade": int(grade), "title": item[0] if isinstance(item, list) else item, "count": None, "status": "material ID mapping not verified"})
    output = {
        "total_questions": len(questions),
        "minimum": args.minimum,
        "below_minimum_units": sum(r["below_minimum"] for r in rows),
        "shortfall": sum(r["shortfall"] for r in rows),
        "unit_rows": rows,
        "material_counts_observed_only": material_rows,
        "material_catalog_including_unresolved": material_catalog,
        "note": "Material catalog is complete for the selected district, but coverage for catalog entries is unknown until material ID mapping is verified. Never treat unknown as zero. Counts are not a quality score.",
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
