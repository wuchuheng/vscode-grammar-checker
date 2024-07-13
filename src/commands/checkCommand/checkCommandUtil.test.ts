import * as assert from "assert";
import { describe, test } from "mocha";
import { removeInvalideChart } from "./checkCommandUtil";
import { log } from "console";

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
    log("hello");
    debugger;
  });
});
