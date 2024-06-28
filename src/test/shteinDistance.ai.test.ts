import { describe, test } from "@jest/globals";
import {
  calculateLevenshteinDistance,
  tokenize,
  wordLevenshteinDistance,
} from "../utils/shteinDistance";
import {
  formatSingleLineComment,
  formatTrackComment,
} from "../utils/typescriptUtil";
import { correctComments } from "../api/correctComments";
import { log } from "console";

describe("The test for the algorithm of the Levenshtein distance", () => {
  test('The test for the "calculateLevenshteinDistance" function', () => {
    const sourceTokens: string[] = tokenize("There are an dog");
    const targetTokens: string[] = tokenize("There is dog");
    const result = calculateLevenshteinDistance(sourceTokens, targetTokens);
    log(result);
  });
});
