import * as assert from "assert";
import { describe, test } from "mocha";
import path from "path";
import fs from "fs";
import LogUtil from "../../../utils/logUtil";
import { CommentType, extractSingleLineComments } from "../commentUtil";

const expectedValue: CommentType[] = [
  {
    text: "// This function calculates the sum of two numbers and returns the result.",
    range: {
      start: {
        line: 0,
        character: 0,
      },
      end: {
        line: 0,
        character: 74,
      },
    },
  },
  {
    text: "// This function calculates the difference between two numbers and returns the result.",
    range: {
      start: {
        line: 5,
        character: 0,
      },
      end: {
        line: 5,
        character: 86,
      },
    },
  },
  {
    text: "// This function calculates the product of two numbers and returns the result.",
    range: {
      start: {
        line: 10,
        character: 0,
      },
      end: {
        line: 10,
        character: 78,
      },
    },
  },
  {
    text: "// This function divides one number by another and returns the result.",
    range: {
      start: {
        line: 15,
        character: 0,
      },
      end: {
        line: 15,
        character: 70,
      },
    },
  },
  {
    text: "// Throws an exception if the divisor is zero.",
    range: {
      start: {
        line: 16,
        character: 0,
      },
      end: {
        line: 16,
        character: 46,
      },
    },
  },
  {
    text: "// Return the result of the division.",
    range: {
      start: {
        line: 21,
        character: 4,
      },
      end: {
        line: 21,
        character: 41,
      },
    },
  },
  {
    text: "// This is a single-line comment.",
    range: {
      start: {
        line: 22,
        character: 18,
      },
      end: {
        line: 22,
        character: 51,
      },
    },
  },
];

describe("Dart Adapter", () => {
  test("Should return a list of dart comments", () => {
    // 2. Processing logic.
    // 2.1 Read the dart file.
    const dartFile = path.resolve(__dirname, "SingleLineCommentDemo.dart");
    const text = fs.readFileSync(dartFile, "utf-8");
    // 2.2 Extract comments from the dart file.
    const comments: CommentType[] = extractSingleLineComments(text);
    assert.deepEqual(comments, expectedValue);
  });
});
