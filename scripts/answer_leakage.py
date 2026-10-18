"""Detect copied English model answers while tolerating short insertions."""
import re

def words(text):
    return re.findall(r"[a-z]+(?:'[a-z]+)?", str(text).lower())

def passage_overlap(answer, passage):
    """Return evidence for >=4 contiguous words or 5 matching words with one insertion."""
    a, p = words(answer), words(passage)
    if len(a) < 4 or len(p) < 4:
        return None
    # Short dialogue lines: three-word copied opening plus changed ending.
    # Diagnostic-only to catch cases like "I can come then" -> "I can come after ...".
    for line in str(passage).splitlines():
        line_words = words(re.sub(r"^[A-Za-z]:\s*", "", line))
        if 4 <= len(line_words) <= 6 and len(a) >= 5 and a[:3] == line_words[:3]:
            return " ".join(a[:3])
    for i in range(len(a)-3):
        four = a[i:i+4]
        for j in range(len(p)-3):
            if four == p[j:j+4]:
                return " ".join(four)
    if len(a) < 5 or len(p) < 5:
        return None
    # Five matching words in order, with at most one extra word in one side.
    for i in range(len(a)-4):
        x = a[i:i+5]
        for j in range(len(p)-5):
            y = p[j:j+6]
            for skip in range(6):
                if x == y[:skip]+y[skip+1:]:
                    return " ".join(x)
    for i in range(len(a)-5):
        x = a[i:i+6]
        for j in range(len(p)-4):
            y = p[j:j+5]
            for skip in range(6):
                if x[:skip]+x[skip+1:] == y:
                    return " ".join(y)
    return None
