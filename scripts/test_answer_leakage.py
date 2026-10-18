from answer_leakage import passage_overlap

def check(condition, message):
    if not condition:
        raise AssertionError(message)

old_g1 = "A: Where are the history books?\nB: Next to the art books.\nA: I need a book about old castles.\nB: Look near the window."
old_g2 = "A: Can you help us with rehearsal on Thursday?\nB: I have club practice until four.\nA: We meet at four thirty in the music room.\nB: Great. I can come then."
old_g3 = "A: Our museum wants photos of the river in the past.\nB: We can ask older residents about their memories.\nA: We should also explain each photo.\nB: That's a good idea for visitors."

check(passage_overlap("They are next to the art books.", old_g1) is not None, "Old G1 copied answer missed")
check(passage_overlap("I can come after club practice.", old_g2) is not None, "Old G2 copied answer missed with Great.")
check(passage_overlap("We should explain each photo to visitors.", old_g3) is not None, "Old G3 copied answer missed")
check(passage_overlap("We should explain each photo to visitors.", "We should explain each photo to visitors.") is not None, "Exact copy missed")
negatives = [
    ("I want to visit the museum tomorrow.", "B: I want to go home today."),
    ("It is a beautiful morning here.", "A: It is a very cold night."),
    ("I have a book about history.", "B: I have a new camera."),
    ("We can play tennis next week.", "A: We can watch a film this evening."),
    ("Visitors can learn how the river looked in the past.", "A: We should explain each photo."),
    ("The wooden bridge was repaired by local carpenters last year.", ""),
]
for idx, (answer, passage) in enumerate(negatives):
    check(passage_overlap(answer, passage) is None, f"False positive case {idx+1}")
print("PASS answer leakage regression cases")
