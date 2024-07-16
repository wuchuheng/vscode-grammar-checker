import * as assert from "assert";
import { describe, test } from "mocha";
import path from "path";
import fs from "fs";
import {
  CommentType,
  extractMultiLineComments,
  extractSingleLineComments,
} from "../commentUtil";

describe("Dart Adapter", () => {
  test("Should return a list of dart comments", () => {
    // 2. Processing logic.

    // 2.1 Read the dart file.
    const dartFile = path.resolve(__dirname, "SingleLineCommentDemo.dart");
    const text = fs.readFileSync(dartFile, "utf-8");
    // 2.2 Extract comments from the dart file.
    const comments: CommentType[] = extractSingleLineComments(text);

    const expectedValue: CommentType[] = [
      {
        text: "// This function calculates the sum of two numbers and returns the result.",
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 74 },
        },
      },
      {
        text: "// This function calculates the difference between two numbers and returns the result.",
        range: {
          start: { line: 5, character: 0 },
          end: { line: 5, character: 86 },
        },
      },
      {
        text: "// This function calculates the product of two numbers and returns the result.",
        range: {
          start: { line: 10, character: 0 },
          end: { line: 10, character: 78 },
        },
      },
      {
        text: "// This function divides one number by another and returns the result.",
        range: {
          start: { line: 15, character: 0 },
          end: { line: 15, character: 70 },
        },
      },
      {
        text: "// Throws an exception if the divisor is zero.",
        range: {
          start: { line: 16, character: 0 },
          end: { line: 16, character: 46 },
        },
      },
      {
        text: "// Return the result of the division.",
        range: {
          start: { line: 21, character: 4 },
          end: { line: 21, character: 41 },
        },
      },
      {
        text: "// This is a single-line comment.",
        range: {
          start: { line: 22, character: 18 },
          end: { line: 22, character: 51 },
        },
      },
    ];
    assert.deepEqual(comments, expectedValue);
  });

  test("Should return a list of multi-line comments", () => {
    // 2. Processing logic.
    // 2.1 Read the dart file.
    const dartFile = path.resolve(__dirname, "TrackLineCommentDemo.dart");
    const text = fs.readFileSync(dartFile, "utf-8");
    // 2.2 Extract comments from the dart file.
    const comments: CommentType[] = extractMultiLineComments(text);
    const expectedValue: CommentType[] = [
      {
        text: "/**\n*File: MultiLineCommentDemo.dart\n*\n*Calculates the factorial of a number.\n*\n*This function takes an integer `n` and returns its factorial.\n*The factorial of a number is the product of all positive integers less than or equal to that number.\n*For example, the factorial of 5 (5!) is 5 * 4 * 3 * 2 * 1 = 120.\n*\n*Note: The factorial of 0 is defined to be 1.\n*/",
        range: {
          start: { line: 0, character: 0 },
          end: { line: 10, character: 2 },
        },
      },
      {
        text: "/*Calculates the nth Fibonacci number.\n\nThe Fibonacci sequence is a series of numbers where each number is the sum of the two preceding ones, starting from 0 and 1.\nThis function returns the nth number in the Fibonacci sequence.\n\n*/",
        range: {
          start: { line: 22, character: 0 },
          end: { line: 27, character: 2 },
        },
      },
      {
        text: "/**\n     * If n is less than or equal to 0, return 0.\n     */",
        range: {
          start: { line: 29, character: 4 },
          end: { line: 31, character: 7 },
        },
      },
      {
        text: "/** * If n is equal to 1, return 1.  */",
        range: {
          start: { line: 34, character: 8 },
          end: { line: 34, character: 47 },
        },
      },
    ];

    assert.deepEqual(comments, expectedValue);
  });
});
