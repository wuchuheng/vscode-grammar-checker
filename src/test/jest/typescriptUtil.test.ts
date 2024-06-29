import { describe, test } from "@jest/globals";
import {
  formatSingleLineComment,
  formatTrackComment,
} from "../../utils/typescriptUtil";

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
