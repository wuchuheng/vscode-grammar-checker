import { describe, test } from "mocha";
import { RemovedChartType, removeInvalideChart } from "./checkCommandUtil";
import * as assert from "assert";

describe("CheckCommandUtil test", () => {
  test("Test function removeInvalideChart ", () => {
    const testInput: string[] = [
      "  ",
      "  test1",
      "test2",
      "  test3",
      "test4",
      "  ",
    ];
    const result = removeInvalideChart(testInput);

    const expectedValue = ["test1", "test2", "test3", "test4"];
    assert.deepEqual(result.value, expectedValue);

    const expectedRemovedTextList: RemovedChartType[] = [
      { lineIndex: 0, prefix: "  ", isEntireLine: true },
      { lineIndex: 1, prefix: "  ", isEntireLine: false },
      { lineIndex: 2, prefix: "", isEntireLine: false },
      { lineIndex: 3, prefix: "  ", isEntireLine: false },
      { lineIndex: 4, prefix: "", isEntireLine: false },
      { lineIndex: 5, prefix: "  ", isEntireLine: true },
    ];
    assert.deepEqual(result.removedTextList, expectedRemovedTextList);
  });
});
