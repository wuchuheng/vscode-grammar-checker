import { describe, test } from "@jest/globals";
import { InputType } from "../utils/aiClient";
import { commentsFilter } from "../api/correctedSentenceFilter";
import { correctComments } from "../api/correctComments";

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
          {
            id: 4,
            content: "# This is a incorrect comment.\n# There is a error here.",
          },
          {
            id: 5,
            content:
              "/*\nThis is a block comment.\nThis block comment has an error: there is a dogs.\n */",
          },
        ],
      };

      tasks.push(commentsFilter(input));
    }

    // 2.3. Wait for all the tasks to be completed
    const results = await Promise.all(tasks);

    // 2.3 Check the results
    for (const result of results) {
      expect(result).toEqual([1, 3, 4, 5]);
    }
  }, 600000);
});

describe("The test for Correcting the comments", () => {
  test("Corrected Testing", async () => {
    // 1. Input handling
    // 2. Processing Logic
    // 2.1 Create the input data for the AI system
    const input: InputType = {
      fileName: "tmp.ts",
      items: [
        {
          id: 1,
          content: `There is the first line.
There is the second line.
There is a incorrect line: there is a mitsake.`,
        },
        {
          id: 3,
          content: "There is a dogs.",
        },
        {
          id: 4,
          content: "/* This is a incorrect comment.\n There is a error here.*/",
        },
        {
          id: 5,
          content:
            "/*\nThis is a block comment.\nThis block comment has an error: there is a dogs.\n */",
        },
      ],
    };

    // 2.2 Send the request to the OpenAI API
    await correctComments(input);

    // 2.3 Parse the response.
    // 3. Output handling
  });
});
