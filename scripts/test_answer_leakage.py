from answer_leakage import passage_overlap

def check(condition, message):
    if not condition:
        raise AssertionError(message)

check(passage_overlap("We should explain each photo to visitors.", "We should also explain each photo.") is not None, "Inserted word not detected")
check(passage_overlap("I can come after club practice.", "I can come then.") is None, "Three-word overlap should not trigger")
check(passage_overlap("We should explain each photo to visitors.", "We should explain each photo to visitors.") is not None, "Copied answer not detected")
check(passage_overlap("Visitors can learn how the river looked in the past.", "We should explain each photo.") is None, "Unrelated text triggered")
check(passage_overlap("The wooden bridge was repaired by local carpenters last year.", "") is None, "Empty passage triggered")
print("PASS answer leakage regression cases")
