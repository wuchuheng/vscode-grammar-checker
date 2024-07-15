import { describe, test } from "mocha";
import {
  RemovedChartType,
  removeInvalidedChart,
  restoreRemovedText,
} from "./checkCommandUtil";
import * as assert from "assert";

describe("CheckCommandUtil test", () => {
  const unformattedText: string[] = [
    "  ",
    "  test1",
    "test2",
    "  test3",
    "test4",
    "  ",
  ];
  const formattedText: string[] = ["test1", "test2", "test3", "test4"];
  const removedTextList: RemovedChartType[] = [
    { lineIndex: 0, prefix: "  ", isEntireLine: true },
    { lineIndex: 1, prefix: "  ", isEntireLine: false },
    { lineIndex: 2, prefix: "", isEntireLine: false },
    { lineIndex: 3, prefix: "  ", isEntireLine: false },
    { lineIndex: 4, prefix: "", isEntireLine: false },
    { lineIndex: 5, prefix: "  ", isEntireLine: true },
  ];

  test("Test function removeInvalidedChart ", () => {
    const result = removeInvalidedChart(unformattedText);

    assert.deepEqual(result.value, formattedText);

    assert.deepEqual(result.removedTextList, removedTextList);
  });

  test(" Test function restoreRemovedText ", () => {
    const result = restoreRemovedText(formattedText, removedTextList);
    assert.deepEqual(result, unformattedText);
  });
});
