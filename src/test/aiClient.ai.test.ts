import { describe, test } from "@jest/globals";
import { wordLevenshteinDistance } from "../utils/shteinDistance";
import {
  formatSingleLineComment,
  formatTrackComment,
} from "../utils/typescriptUtil";
import { correctComments } from "../api/correctComments";

describe("The test for Correcting the comments", () => {
  test("Corrected Testing", async () => {
    // 1. Input handling
    // 2. Processing Logic
    // 2.1 Create the input for the AI system
    const input: {
      testContent: string;
      expectedContents: string[];
    }[] = [
      {
        testContent: "//This is a incorrect comment",
        expectedContents: ["// This is an incorrect comment."],
      },
      {
        testContent: "//There is a error here",
        expectedContents: ["// There is an error here."],
      },
      {
        testContent: "//There is a dogs here",
        expectedContents: [
          "// There is a dog here.",
          "// There are dogs here.",
          "// There are a few dogs here.",
          "// There are a lot of dogs here.",
        ],
      },
      {
        testContent:
          "/*\nThis is a incorrect comment.\nThere is a error here.\n*/",
        expectedContents: [
          "/**\n* This is an incorrect comment.\n* There is an error here.\n*/",
        ],
      },
      {
        testContent:
          "/*\nThis is a block comment.\nThis block comment has an error: there is a dogs.\n*/",
        expectedContents: [
          "/**\n* This is a block comment.\n* This block comment has an error: there is a dog.\n*/",
          "/**\n* This is a block comment.\n* This block comment has an error: there are dogs.\n*/",
          "/**\n* This is a block comment.\n* This block comment has an error: there is a dog's.\n*/",
          "/**\n* This is a block comment.\n* This block comment has an error: there is a dog(s).\n*/",
        ],
      },
      {
        testContent: "//Are you okay?",
        expectedContents: ["// Are you okay?"],
      },
    ];

    // 2.2 Call the AI system
    const tasks: Promise<string>[] = [];
    for (const item of input) {
      tasks.push(correctComments(item.testContent));
    }

    // 2.3 Wait for all the tasks to be completed
    const result = await Promise.all(tasks);

    // 2.4 Assert the results
    let isTestingPassed: boolean = true;
    for (let i = 0; i < input.length; i++) {
      const item = input[i];
      // 2.4.1 Find the matched result
      let isMatched: boolean = false;
      const response = result[i];
      for (const expectedContentIndex in item.expectedContents) {
        if (item.expectedContents[expectedContentIndex] === response) {
          isMatched = true;
          break;
        }
      }

      // 2.4.2 Assert the result
      if (!isMatched) {
        console.error(`Test failed:
Input: ${item.testContent}
Expected: ${item.expectedContents.join("\n")}
Actual: ${response}`);
        isTestingPassed = false;
      }
    }

    // 2.5 Assert the final result
    expect(isTestingPassed).toBe(true);

    // 3. Output handling
  }, 100000);
});

describe("The test for Correcting the comments", () => {
  test("Corrected the tracking of the comments", async () => {
    const input: string =
      "/*\nThis is a block comment.\nThis block comment has an error: there is a dogs.\n*/";
    const result = formatTrackComment(input);
    expect(result).toBe(
      "/**\n* This is a block comment.\n* This block comment has an error: there is a dogs.\n*/"
    );
  });
  test("Corrected the format for the single line comment", async () => {
    let input: string = "// There is a dogs here.";
    let result = formatSingleLineComment(input);
    const expectedResult = "// There is a dogs here.";
    expect(result).toBe(expectedResult);

    input = "//There is a dogs here.";
    result = formatSingleLineComment(input);
    expect(result).toBe(expectedResult);

    input = "There is a dogs here.";
    result = formatSingleLineComment(input);
    expect(result).toBe(expectedResult);
  });
});

describe("The test for the wordLevenshteinDistance", () => {
  test("Corrected the tracking of the comments", () => {
    // Test cases with various sentences
    let testItem = { source: "There are an dog", target: "There is a dog" };
    let result = wordLevenshteinDistance(testItem.source, testItem.target);
    expect(result).toEqual([
      {
        type: "modify",
        sourceCharIndex: 6,
        sourceCharToIndex: 9,
        targetCharIndex: 6,
        targetCharToIndex: 8,
        fromWord: "are",
        toWord: "is",
      },
      {
        type: "modify",
        sourceCharIndex: 10,
        sourceCharToIndex: 12,
        targetCharIndex: 9,
        targetCharToIndex: 10,
        fromWord: "an",
        toWord: "a",
      },
    ]);

    testItem = { source: "There are a dogs", target: "There is dog" };
    result = wordLevenshteinDistance(testItem.source, testItem.target);
    expect(result).toEqual([
      {
        type: "modify",
        sourceCharIndex: 6,
        sourceCharToIndex: 9,
        targetCharIndex: 6,
        targetCharToIndex: 8,
        fromWord: "are",
        toWord: "is",
      },
      {
        type: "modify",
        sourceCharIndex: 10,
        sourceCharToIndex: 11,
        targetCharIndex: 9,
        targetCharToIndex: undefined,
        fromWord: "a",
        toWord: "dog",
      },
      {
        type: "delete",
        sourceCharIndex: 11,
        sourceCharToIndex: undefined,
        targetCharIndex: undefined,
        targetCharToIndex: undefined,
        fromWord: " dogs",
        toWord: "",
      },
    ]);
    // 3. Test the deleted test case
    testItem = { source: "There   a is a dog", target: "There is a dog" }; // Deleted test case
    result = wordLevenshteinDistance(testItem.source, testItem.target);
    expect(result).toEqual([
      {
        type: "delete",
        sourceCharIndex: 5,
        sourceCharToIndex: 9,
        targetCharIndex: 5,
        targetCharToIndex: 5,
        fromWord: "   a",
        toWord: "",
      },
    ]);

    // 4. Inserted test case
    testItem = { source: "There a dog", target: "There is a dog" };
    result = wordLevenshteinDistance(testItem.source, testItem.target);
    expect(result).toEqual([
      {
        type: "insert",
        sourceCharIndex: 5,
        sourceCharToIndex: 5,
        targetCharIndex: 5,
        targetCharToIndex: 8,
        fromWord: "",
        toWord: " is",
      },
    ]);

    // 4. Nothing to change test case
    testItem = { source: "There is a dog", target: "There is a dog" };
    result = wordLevenshteinDistance(testItem.source, testItem.target);
    expect(result).toEqual([]);
  });
});
