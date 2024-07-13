import assert from "assert";
import {
  ChangedOperation,
  compareSentences,
  convertComparedSentences,
} from "../../utils/compareSentenceUtil";
import { describe, test } from "mocha";

describe("tmp", () => {
  test("Test", () => {
    // const sourceSentence = "* There are next line.";
    const sourceSentence = " There are several numberic next lines.";
    const targetSentence = "* There are next line.";
    const editOperations = compareSentences(sourceSentence, targetSentence);
    const result = convertComparedSentences(sourceSentence, editOperations);

    const expectedValue: ChangedOperation[] = [
      {
        type: "insert",
        fromWord: "",
        toWord: "*",
        chartIndex: 0,
        toChartIndex: 0,
      },
      {
        type: "delete",
        fromWord: " several numberic",
        toWord: "",
        chartIndex: 10,
        toChartIndex: 27,
      },
      {
        type: "modify",
        fromWord: "lines.",
        toWord: "line.",
        chartIndex: 33,
        toChartIndex: 39,
      },
    ];

    assert(result === expectedValue);
  });
});
