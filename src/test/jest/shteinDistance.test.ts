import { describe, test } from "@jest/globals";
import {
  IndexMapToken,
  indexMapToken,
  tokenize,
  wordLevenshteinDistance,
} from "../../utils/shteinDistance";

describe("The test for the wordLevenshteinDistance", () => {
  test("Corrected the tracking of the comments", () => {
    // Test cases with various sentences
    let testItem: { source: string; target: string } = {
      source: "There are an dog",
      target: "There is a dog",
    };
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
  });

  test("Corrected the tracking of the comments #2", () => {
    const testItem = {
      source: "/ comment1: helo",
      target: "// comment1: hello",
    };
    const result = wordLevenshteinDistance(testItem.source, testItem.target);
    expect(result).toEqual([
      {
        type: "modify",
        sourceCharIndex: 0,
        sourceCharToIndex: 1,
        targetCharIndex: 0,
        targetCharToIndex: 2,
        fromWord: "/",
        toWord: "//",
      },
      {
        type: "modify",
        sourceCharIndex: 12,
        sourceCharToIndex: 16,
        targetCharIndex: 13,
        targetCharToIndex: 18,
        fromWord: "helo",
        toWord: "hello",
      },
    ]);
  });

  test("Corrected the tracking of the comments #3", () => {
    // Inserted test case
    const testItem = { source: "There a dog", target: "There is a dog" };
    const result = wordLevenshteinDistance(testItem.source, testItem.target);
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
  });

  test("Corrected the tracking of the comments #4", () => {
    // Nothing to change test case
    const testItem = { source: "There is a dog", target: "There is a dog" };
    const result = wordLevenshteinDistance(testItem.source, testItem.target);
    expect(result).toEqual([]);
  });

  test("Corrected the tracking of the comments #5", () => {
    // const testItem = { source: "There are a dogs", target: "There is dog" };
    // const testItem = { source: "There are a dogs", target: "There is dog" };
    const testItem = { source: "There are a dogs", target: "There is dog" };
    const result = wordLevenshteinDistance(testItem.source, testItem.target);
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
        targetCharToIndex: 12,
        fromWord: "a",
        toWord: "dog",
      },
      {
        type: "delete",
        sourceCharIndex: 11,
        sourceCharToIndex: 16,
        targetCharIndex: 12,
        targetCharToIndex: 12,
        fromWord: " dogs",
        toWord: "",
      },
    ]);
  });

  test("Corrected the tracking of the comments #6", () => {
    // Test the deleted test case
    const testItem = { source: "There   a is a dog", target: "There is a dog" }; // Deleted test case
    const result = wordLevenshteinDistance(testItem.source, testItem.target);
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
  });

  test("Test function `tokenize`", () => {
    const testItem = "There are a dogs";
    const result = tokenize(testItem);
    const expected = ["There", " ", "are", " ", "a", " ", "dogs"];
    expect(result).toEqual(expected);

    const testItem2 = "There    are a        dogs";
    const result2 = tokenize(testItem2);
    const expected2 = ["There", "    ", "are", " ", "a", "        ", "dogs"];
    expect(result2).toEqual(expected2);
  });

  test("Test function `indexMapToken`", () => {
    const testItem = "There are a dogs";
    const result: IndexMapToken = indexMapToken(testItem);
    // Create map like the following:
    // Map(7) {
    //   0 => { start: 0, end: 5, length: 5 },
    //   1 => { start: 5, end: 6, length: 1 },
    //   2 => { start: 6, end: 9, length: 3 },
    //   3 => { start: 9, end: 10, length: 1 },
    //   4 => { start: 10, end: 11, length: 1 },
    //   5 => { start: 11, end: 12, length: 1 },
    //   6 => { start: 12, end: 16, length: 4 }
    // }
    const expected: IndexMapToken = new Map();
    expected.set(0, { start: 0, end: 5, length: 5 });
    expected.set(1, { start: 5, end: 6, length: 1 });
    expected.set(2, { start: 6, end: 9, length: 3 });
    expected.set(3, { start: 9, end: 10, length: 1 });
    expected.set(4, { start: 10, end: 11, length: 1 });
    expected.set(5, { start: 11, end: 12, length: 1 });
    expected.set(6, { start: 12, end: 16, length: 4 });
    expect(result).toEqual(expected);
  });
});
