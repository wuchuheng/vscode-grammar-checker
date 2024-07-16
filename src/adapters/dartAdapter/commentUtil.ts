type PositionType = {
  line: number;
  character: number;
};
type RangeType = {
  start: PositionType;
  end: PositionType;
};
export type CommentType = {
  text: string;
  range: RangeType;
};

/**
 * Extract single line comments from the given text.
 * @param text The text to extract single line comments.
 * @returns The list of comment objects.
 */
export const extractSingleLineComments = (
  text: string,
  onCreateNewComment?: (newComment: {
    line: number;
    startChart: number;
    endChart: number;
    text: string;
  }) => void
): CommentType[] => {
  // 1. Handling input.
  // 2. Processing logic.
  // 2.1 Create a list of a comment map a code block, and the item is a map that key is the extracted comment and value is the list of code block.
  // 2.1.1 Extract comments using regular expression.
  const regex = /\/\/.*$/gm;
  const commentTextList: string[] = text.match(regex) || [];

  // 2.1.2 Extract code block using regular expression.
  const codeBlockList: string[] = text.split(regex);
  codeBlockList.pop();

  // 2.2 Create the list of comment objects.
  const result: CommentType[] = [];
  let line: number = 0;
  for (const codeBlock of codeBlockList) {
    // 2.2.1 Calculate the line number.
    const codeBlockLines = codeBlock.split("\n");
    line += codeBlockLines.length - 1;

    // 2.2.2 Calculate the last line text.
    const lastLineText = codeBlockLines.pop() || "";

    // 2.2.2 Create a comment object.
    const commentText = commentTextList.shift()!;
    // 2.2.2.1 Calculate the start and end position.
    const startPosition: PositionType = {
      line,
      character: lastLineText.length,
    };
    const endPosition: PositionType = {
      line,
      character: lastLineText.length + commentText.length,
    };

    // 2.2.2.2 Create a comment object.
    const comment: CommentType = {
      text: commentText,
      range: {
        start: startPosition,
        end: endPosition,
      },
    };

    result.push(comment);

    // 2.3 Invoke the callback function.
    onCreateNewComment &&
      onCreateNewComment({
        line,
        startChart: startPosition.character,
        endChart: endPosition.character,
        text: commentText,
      });
  }

  // 3. Return the result.
  return result;
};
