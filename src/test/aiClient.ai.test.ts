import { describe, test } from "@jest/globals";
import { InputType } from "../utils/aiClient";
import { commentsFilter } from "../api/correctedSentenceFilter";

describe("AI testing", () => {
  test("Prompt filter test", async () => {
    // 1. Input handling

    // 2. Processing Logic
    const tasks: Promise<number[]>[] = [];

    // 2.1 Create 100 tasks to test the AI system
    for (let i = 0; i < 100; i++) {
      const input: InputType = {
        fileName: "README.md",
        items: [
          {
            id: 1,
            content: `There is the first line.
There is the second line.
There is a incorrect line: there is a mitsake.`,
          },
          {
            id: 2,
            content: "There is a correct line.",
          },
          {
            id: 3,
            content: "There is a dogs.",
          },
        ],
      };

      tasks.push(commentsFilter(input));
    }

    // 2.3. Wait for all the tasks to be completed
    const results = await Promise.all(tasks);

    // 2.3 Check the results
    for (const result of results) {
      expect(result).toEqual([1, 3]);
    }
  }, 600000);
});
