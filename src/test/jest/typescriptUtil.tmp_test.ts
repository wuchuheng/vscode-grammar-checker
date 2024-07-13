import assert from "assert";
import {
  formatSingleLineComment,
  formatTrackComment,
} from "../../adapters/typescriptAdapter/typescriptUtil";
import { describe, test } from "mocha";

describe("The test for Correcting the comments", () => {
  test("Corrected the tracking of the comments", async () => {
    const input: string =
      "/*\nThis is a block comment.\nThis block comment has an error: there is a dogs.\n*/";
    const result = formatTrackComment(input);
    const expectedResult =
      "/**\n* This is a block comment.\n* This block comment has an error: there is a dogs.\n*/";
    assert(result === expectedResult);
  });
  test("Corrected the format for the single line comment", async () => {
    let input: string = "// There is a dogs here.";
    let result = formatSingleLineComment(input);
    const expectedResult = "// There is a dogs here.";
    assert(result === expectedResult);

    input = "//There is a dogs here.";
    result = formatSingleLineComment(input);
    assert(result === expectedResult);

    input = "There is a dogs here.";
    result = formatSingleLineComment(input);
    assert(result === expectedResult);
  });
});
