import { Position } from "vscode";
import { EditOperation } from "./shteinDistance";
import { Comment } from "./typescriptUtil";
import * as vscode from "vscode";

export const convertEditionIndexToStartPotion = (
  comment: Comment,
  edition: EditOperation
): Position => {
  // 1. Handling input.
  // 2. Progressing Logic.
  // 2.1 Calculate the start position of the edition.

  const start = comment.start.translate(0, edition.sourceCharIndex);

  // 3. Return result.

  return start;
};

export const convertEditionIndexToEndPotion = (
  comment: Comment,
  edition: EditOperation
): Position => {
  // 1. Handling input.
  // 2. Progressing Logic.
  // 2.1 Calculate the end position of the edition.
  const lines = comment.text
    .substring(0, edition.sourceCharToIndex)
    .split("\n");
  let lineNumberInEditior = comment.start.line;
  let { sourceCharToIndex } = edition;
  if (lines.length > 1) {
    // 2.1.1 Inrease the line number when the comment has multiple lines.and calculate the char index.
    for (let i = 0; i < lines.length - 1; i++) {
      lineNumberInEditior++;
      sourceCharToIndex -= lines[i].length + 1;
    }
  }
  const endPostion = new vscode.Position(
    lineNumberInEditior,
    sourceCharToIndex
  );

  // 3. Return result.

  return endPostion;
};
