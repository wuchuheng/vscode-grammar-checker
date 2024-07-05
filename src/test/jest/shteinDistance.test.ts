import { describe, test } from "@jest/globals";
import { tokenize } from "../../utils/shteinDistance";
import {
  convertComparedSentences,
  compareSentences,
  ChangedOperation,
} from "./../../utils/compareSentenceUtil";

describe("The test for the wordLevenshteinDistance", () => {
  test("Corrected the tracking of the comments", () => {
    // Test cases with various sentences
    let testItem: { source: string; target: string } = {
      source: "There are an dog",
      target: "There is a dog",
    };
    const editions = compareSentences(testItem.source, testItem.target);
    let result = convertComparedSentences(testItem.source, editions);

    const expectedValue: ChangedOperation[] = [
      {
        type: "modify",
        chartIndex: 6,
        toChartIndex: 9,
        fromWord: "are",
        toWord: "is",
      },
      {
        type: "modify",
        chartIndex: 10,
        toChartIndex: 12,
        fromWord: "an",
        toWord: "a",
      },
    ];

    expect(result).toEqual(expectedValue);
  });

  test("Corrected the tracking of the comments #2", () => {
    const testItem = {
      source: "/ comment1: helo",
      target: "// comment1: hello",
    };

    const editions = compareSentences(testItem.source, testItem.target);
    let result = convertComparedSentences(testItem.source, editions);
    const expectedValue: ChangedOperation[] = [
      {
        type: "modify",
        chartIndex: 0,
        toChartIndex: 1,
        fromWord: "/",
        toWord: "//",
      },
      {
        type: "modify",
        chartIndex: 12,
        toChartIndex: 16,
        fromWord: "helo",
        toWord: "hello",
      },
    ];

    expect(result).toEqual(expectedValue);
  });

  test("Corrected the tracking of the comments #3", () => {
    // Inserted test case
    const testItem = { source: "There a dog", target: "There is a dog" };

    const editions = compareSentences(testItem.source, testItem.target);
    let result = convertComparedSentences(testItem.source, editions);
    const expectedValue: ChangedOperation[] = [
      {
        type: "insert",
        chartIndex: 5,
        toChartIndex: 5,
        fromWord: "",
        toWord: " is",
      },
    ];

    expect(result).toEqual(expectedValue);
  });

  test("Corrected the tracking of the comments #4", () => {
    // Nothing to change test case
    const testItem = { source: "There is a dog", target: "There is a dog" };
    const editions = compareSentences(testItem.source, testItem.target);
    let result = convertComparedSentences(testItem.source, editions);

    expect(result).toEqual([]);
  });

  test("Corrected the tracking of the comments #5", () => {
    // const testItem = { source: "There are a dogs", target: "There is dog" };
    // const testItem = { source: "There are a dogs", target: "There is dog" };
    const testItem = { source: "There are a dogs", target: "There is dog" };
    const editions = compareSentences(testItem.source, testItem.target);
    let result = convertComparedSentences(testItem.source, editions);
    const expectedValue: ChangedOperation[] = [
      {
        type: "delete",
        fromWord: " are",
        toWord: "",
        chartIndex: 5,
        toChartIndex: 9,
      },
      {
        type: "modify",
        fromWord: "a",
        toWord: "is",
        chartIndex: 10,
        toChartIndex: 11,
      },
      {
        type: "modify",
        fromWord: "dogs",
        toWord: "dog",
        chartIndex: 12,
        toChartIndex: 16,
      },
    ];

    expect(result).toEqual(expectedValue);
  });

  test("Corrected the tracking of the comments #6", () => {
    // Test the deleted test case
    const testItem = { source: "There   a is a dog", target: "There is a dog" }; // Deleted test case
    const editions = compareSentences(testItem.source, testItem.target);
    let result = convertComparedSentences(testItem.source, editions);
    const expectedValue: ChangedOperation[] = [
      {
        type: "delete",
        chartIndex: 5,
        toChartIndex: 9,
        fromWord: "   a",
        toWord: "",
      },
    ];

    expect(result).toEqual(expectedValue);
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
});
