import { describe, test } from "mocha";
import * as fs from "fs";
import * as path from "path";
import {
  extractMultiLineComments,
  extractSingleLineComments,
} from "../commentUtil";
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

const multiLineCommentExpectedValue = [
  {
    text: "/**\n*File: MultiLineCommentDemo.dart\n*\n*Calculates the factorial of a number.\n*\n*This function takes an integer `n` and returns its factorial.\n*The factorial of a number is the product of all positive integers less than or equal to that number.\n*For example, the factorial of 5 (5!) is 5 * 4 * 3 * 2 * 1 = 120.\n*\n*Note: The factorial of 0 is defined to be 1.\n*/",
    start: {
      line: 10,
      character: 0,
    },
    end: {
      line: 10,
      character: 2,
    },
  },
  {
    text: "/*Calculates the nth Fibonacci number.\n\nThe Fibonacci sequence is a series of numbers where each number is the sum of the two preceding ones, starting from 0 and 1.\nThis function returns the nth number in the Fibonacci sequence.\n\n*/",
    start: {
      line: 27,
      character: 0,
    },
    end: {
      line: 27,
      character: 2,
    },
  },
  {
    text: "/**\n     * If n is less than or equal to 0, return 0.\n     */",
    start: {
      line: 31,
      character: 4,
    },
    end: {
      line: 31,
      character: 7,
    },
  },
  {
    text: "/** * If n is equal to 1, return 1.  */",
    start: {
      line: 34,
      character: 8,
    },
    end: {
      line: 34,
      character: 47,
    },
  },
];

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

  test("Should return a list of multi line comments", () => {
    // 2. Processing logic.
    // 2.1 Read the dart file.
    const dartFile = path.resolve(
      __dirname,
      "../../../../src/adapters/dartAdapter/dartAdapter.test",
      "TrackLineCommentDemo.dart"
    );
    const text = fs.readFileSync(dartFile, "utf-8");
    // 2.2 Extract comments from the dart file.

    const comments: Comment[] = [];
    extractMultiLineComments(text, ({ text, startChart, endChart, line }) => {
      comments.push({
        text,
        start: new vscode.Position(line, startChart),
        end: new vscode.Position(line, endChart),
      });
    });
    const expectedValue = JSON.stringify(multiLineCommentExpectedValue);
    const actualValue = JSON.stringify(comments);

    assert.strictEqual(actualValue, expectedValue);
  });
});
