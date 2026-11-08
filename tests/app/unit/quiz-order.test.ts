import { describe, expect, it } from "vitest";

import { weakestFirst } from "@/lib/quiz/levels";

describe("quiz summary next steps (spec 020 US3)", () => {
  it("puts the topics missed most first", () => {
    const topics = [
      { topic_name: "A", correct: 3, total: 3 },
      { topic_name: "B", correct: 0, total: 2 },
      { topic_name: "C", correct: 1, total: 2 }
    ];
    expect(weakestFirst(topics).map((t) => t.topic_name)).toEqual(["B", "C", "A"]);
  });

  it("keeps the quiz's order on ties and does not change the input", () => {
    const topics = [
      { topic_name: "A", correct: 1, total: 2 },
      { topic_name: "B", correct: 2, total: 4 }
    ];
    expect(weakestFirst(topics).map((t) => t.topic_name)).toEqual(["A", "B"]);
    expect(topics[0].topic_name).toBe("A");
  });
});
