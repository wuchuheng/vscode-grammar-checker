import { Position, Range } from "vscode";
import { Comment } from "./diagnosticUtil";
import { ChangedOperation } from "./compareSentenceUtil";

/**
 * Translate the edition to the Range in the editor.
 *
 * @param comment
 * @param edition
 * @returns
 */
export const translateEditionToRange = (
  comment: Comment,
  edition: ChangedOperation
): Range => {
  // 1. Handling input.
  // 2. Progressing Logic.
  // 2.1 Get the start position and end position based on the edition.
  let start: Position;
  let end: Position;

  // 2.1.1 Get the position from the multi-line comment.
  let lines = comment.text.substring(0, edition.toChartIndex).split("\n");
  const isMultiLine = lines.length > 1;
  if (isMultiLine) {
    let accessedChartCount = 0;
    let lineCount = 0;
    let isGetStartPostion: boolean = false;
    let isGetEndPostion: boolean = false;

    for (const line of lines) {
      // 2.1.2 Get the start position of the edition.
      if (!isGetStartPostion) {
        if (accessedChartCount + line.length >= edition.chartIndex) {
          const lineNumber = comment.start.line + lineCount;
          const character = edition.chartIndex - accessedChartCount;
          start = new Position(lineNumber, character);
          isGetStartPostion = true;
        }
      }
      // 2.1.3 Get the end position of the edition.
      if (!isGetEndPostion) {
        if (accessedChartCount + line.length >= edition.toChartIndex) {
          const lineNumber = comment.start.line + lineCount;
          const character = edition.toChartIndex - accessedChartCount;
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
    const prefixCharacter = comment.start.character;
    start = new Position(lineNumber, +edition.chartIndex + prefixCharacter);

    // 2.2.2 Get the end position of the edition.
    end = new Position(lineNumber, prefixCharacter + edition.toChartIndex);
  }

  // 3. Return result.
  return new Range(start!, end!);
};
