import { Comment } from "../../utils/diagnosticUtil";
import * as vscode from "vscode";
import LogUtil from "../../utils/logUtil";

export const extractComment = (text: string): Comment[] => {
  // 1. Handling input.
  // 2. Processing logic.
  const result: Comment[] = [];

  // 2.1 Extract single line comments.
  const singLineComments: Comment[] = extractSingleLineComments(text);
  result.push(...singLineComments);
  // 2.2 Extract trailing comments.

  // 3. Return output.
  return result;
};

/**
 * Extract single line comments from the given text.
 *
 * @param text
 */
export function extractSingleLineComments(text: string): Comment[] {
  // 2. Processing logic.
  // 2.1 Capture all single line comments.
  const regex = /\/\/.*$/gm;
  const matchedResult = text.match(regex);

  // 2.2 If no single line comments found, return empty array.
  if (!matchedResult) {
    return [];
  }

  // 2.3 Deduplicate data.
  const deduplicatedResult: string[] = Array.from(new Set(matchedResult));

  // 2.3 Convert matched result to Comment object.
  const result: Comment[] = [];
  for (const commentText of deduplicatedResult) {
    const codeBlockList = text.split(commentText);
    codeBlockList.pop();

    let previous = "";
    const previousLines: string[] = [];
    for (const codeBlock of codeBlockList) {
      previous = `${previous}${codeBlock}`;
      const codeBlockLines = codeBlock.split("\n");
      // 2.3.1 If the last line is empty, remove it.
      if (
        codeBlockLines.length > 0 &&
        codeBlockLines[codeBlockLines.length - 1] === ""
      ) {
        codeBlockLines.pop();
      }

      previousLines.push(...codeBlockLines);
      // 2.4 Extract line number.
      const lineNumber = previousLines.length;
      // 2.5 Extract column number.
      let startColumnNumber: number = 0;
      if (lineNumber > 0) {
        startColumnNumber = previousLines[lineNumber - 1].length;
      }

      const endColumnNumber: number = startColumnNumber + commentText.length;
      LogUtil.debug(`
        Line number: ${lineNumber}
        Start column number: ${startColumnNumber}
        End column number: ${endColumnNumber}
        `);

      const start = new vscode.Position(lineNumber, startColumnNumber);
      const end = new vscode.Position(lineNumber, endColumnNumber);

      // 2.6 Create Comment object.
      const comment: Comment = { text: commentText, start, end };

      result.push(comment);

      previous = `${previous}${commentText}`;
    }
  }

  // 3. Return result.
  return result;
}
