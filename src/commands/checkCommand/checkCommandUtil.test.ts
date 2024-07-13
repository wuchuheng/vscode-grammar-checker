import { describe, test } from "mocha";
import {
  RemovedChartType,
  removeInvalideChart,
  restoreRemovedText,
} from "./checkCommandUtil";
import * as assert from "assert";

describe("CheckCommandUtil test", () => {
  const unformatedText: string[] = [
    "  ",
    "  test1",
    "test2",
    "  test3",
    "test4",
    "  ",
  ];
  const formatedText: string[] = ["test1", "test2", "test3", "test4"];
  const removedTextList: RemovedChartType[] = [
    { lineIndex: 0, prefix: "  ", isEntireLine: true },
    { lineIndex: 1, prefix: "  ", isEntireLine: false },
    { lineIndex: 2, prefix: "", isEntireLine: false },
    { lineIndex: 3, prefix: "  ", isEntireLine: false },
    { lineIndex: 4, prefix: "", isEntireLine: false },
    { lineIndex: 5, prefix: "  ", isEntireLine: true },
  ];

  test("Test function removeInvalideChart ", () => {
    const result = removeInvalideChart(unformatedText);

    assert.deepEqual(result.value, formatedText);

    assert.deepEqual(result.removedTextList, removedTextList);
  });

  test(" Test function restoreRemovedText ", () => {
    const result = restoreRemovedText(formatedText, removedTextList);
    assert.deepEqual(result, unformatedText);
  });
});
