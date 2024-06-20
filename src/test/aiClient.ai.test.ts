import { describe, expect, test } from "@jest/globals";
import "dotenv/config";
import ResponseType, { aiClient, InputType, step1 } from "../utils/aiClient";

describe("AI testing", () => {
  test("Test deleteing words", async () => {
    const testAi = async () => {
      // 1. Define the input data for the AI system
      const res = await step1({
        fileName: "README.md",
        items: [
          {
            id: 1,
            content: "She are the best among students.",
          },
          {
            id: 2,
            content: "There is of 2 mitsake.",
          },
        ],
        // content: "There are a mitsake.",
      });

      // 2. Assert the response from the AI system
      // 2.1 Assert the count of the response items is 2;
      expect(res.length).toBe(2);

      // 2.2 Assert the first response item
      const firstItem = res[0];
      expect(firstItem.id).toBe(1);
      firstItem.items.forEach((item) => {
        expect(typeof item.range.start).toBe("number");
        expect(typeof item.range.end).toBe("number");
        expect(typeof item.replacement).toBe("string");
      });

      // 2.3 Assert the second response item
      const secondItem = res[1];
      expect(secondItem.id).toBe(2);
      firstItem.items.forEach((item) => {
        expect(typeof item.range.start).toBe("number");
        expect(typeof item.range.end).toBe("number");
        expect(typeof item.replacement).toBe("string");
      });
    };

    // 3. Run the test 100 times.
    const task: Promise<void>[] = [];
    for (let i = 0; i < 100; i++) {
      task.push(testAi());
    }
    // 4. Wait for all the tests to finish
    await Promise.all(task);
  }, 600000);
});
