import { describe, test } from "mocha";
import * as fs from "fs";
import * as path from "path";
import { extractSingleLineComments } from "../commentUtil";
import { Comment } from "../../../utils/diagnosticUtil";
import * as vscode from "vscode";
import * as assert from "assert";

const singleLineCommentExpectedValue: string = `
[
  {
    "text": "// This function calculates the sum of two numbers and returns the result.",
    "start": {
      "line": 0,
      "character": 0
    },
    "end": {
      "line": 0,
      "character": 74
    }
  },
  {
    "text": "// This function calculates the difference between two numbers and returns the result.",
    "start": {
      "line": 5,
      "character": 0
    },
    "end": {
      "line": 5,
      "character": 86
    }
  },
  {
    "text": "// This function calculates the product of two numbers and returns the result.",
    "start": {
      "line": 10,
      "character": 0
    },
    "end": {
      "line": 10,
      "character": 78
    }
  },
  {
    "text": "// This function divides one number by another and returns the result.",
    "start": {
      "line": 15,
      "character": 0
    },
    "end": {
      "line": 15,
      "character": 70
    }
  },
  {
    "text": "// Throws an exception if the divisor is zero.",
    "start": {
      "line": 16,
      "character": 0
    },
    "end": {
      "line": 16,
      "character": 46
    }
  },
  {
    "text": "// Return the result of the division.",
    "start": {
      "line": 21,
      "character": 4
    },
    "end": {
      "line": 21,
      "character": 41
    }
  },
  {
    "text": "// This is a single-line comment.",
    "start": {
      "line": 22,
      "character": 18
    },
    "end": {
      "line": 22,
      "character": 51
    }
  }
]
`;

describe("Dart Adapter", () => {
  test("Should return a list of single line comments", () => {
    // 2. Processing logic.
    // 2.1 Read the dart file.
    const dartFile = path.resolve(
      __dirname,
      "../../../../src/adapters/dartAdapter/dartAdapter.test",
      "SingleLineCommentDemo.dart"
    );
    const text = fs.readFileSync(dartFile, "utf-8");
    // 2.2 Extract comments from the dart file.

    const result: Comment[] = [];
    extractSingleLineComments(text, ({ text, startChart, endChart, line }) => {
      result.push({
        text,
        start: new vscode.Position(line, startChart),
        end: new vscode.Position(line, endChart),
      });
    });

    const expectedValue = JSON.stringify(
      JSON.parse(singleLineCommentExpectedValue)
    );
    const actualValue = JSON.stringify(result);

    assert.strictEqual(actualValue, expectedValue);
  });

  test("Should return a list of multi line comments", () => {});
});
