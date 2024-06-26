import { Position, Range } from "vscode";
import { EditOperation } from "./shteinDistance";
import { Comment } from "./typescriptUtil";

/**
 * Translate the edition to the Range in the editor.
 *
 * @param comment
 * @param edition
 * @returns
 */
export const translateEditionToRange = (
  comment: Comment,
  edition: EditOperation
): Range => {
  // 1. Handling input.
  // 2. Progressing Logic.
  // 2.1 Get the start position and end position based on the edition.
  let start: Position;
  let end: Position;

  // 2.1.1 Get the position from the multi-line comment.
  let lines = comment.text.substring(0, edition.sourceCharToIndex).split("\n");
  const isMultiLine = lines.length > 1;
  if (isMultiLine) {
    let accessedChartCount = 0;
    let lineCount = 0;
    let isGetStartPostion: boolean = false;
    let isGetEndPostion: boolean = false;

    for (const line of lines) {
      // 2.1.2 Get the start position of the edition.
      if (!isGetStartPostion) {
        if (accessedChartCount + line.length >= edition.sourceCharIndex) {
          const lineNumber = comment.start.line + lineCount;
          const character = edition.sourceCharIndex - accessedChartCount;
          start = new Position(lineNumber, character);
          isGetStartPostion = true;
        }
      }
      // 2.1.3 Get the end position of the edition.
      if (!isGetEndPostion) {
        if (accessedChartCount + line.length >= edition.sourceCharToIndex) {
          const lineNumber = comment.start.line + lineCount;
          const character = edition.sourceCharToIndex - accessedChartCount;
          end = new Position(lineNumber, character);
          isGetEndPostion = true;
        }
      }

      // 2.1.4 Cancel the loop when the start and end position are found.
      if (isGetStartPostion && isGetEndPostion) {
        break;
      }

      // 2.1.5 Update the status of the loop.
      accessedChartCount += line.length + 1;
      lineCount++;
    }
  } else {
    // 2.2 Get the position from the single line comment.
    const lineNumber = comment.start.line;
    // 2.2.1 Get the start position of the edition.
    start = new Position(lineNumber, edition.sourceCharIndex);

    // 2.2.2 Get the end position of the edition.
    end = new Position(lineNumber, edition.sourceCharToIndex);
  }

  // 3. Return result.
  return new Range(start!, end!);
};
