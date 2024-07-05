type OperationType = "insert" | "delete" | "modify";
export interface CompareSentenceOperation {
  type: OperationType;
  index: number;
  fromWord: string;
  toWord: string;
}
export type ChangedOperation = {
  chartIndex: number;
  toChartIndex: number;
} & Pick<CompareSentenceOperation, "type" | "fromWord" | "toWord">;

/**
 * Compare two sentences and generate a list of edit operations
 * to transform the source sentence into the target sentence.
 * @param source - The original sentence.
 * @param target - The sentence after correction.
 * @returns An array of edit operations.
 */
export function compareSentences(
  source: string,
  target: string
): CompareSentenceOperation[] {
  // Step 1: Tokenize the sentences
  const sourceTokens = tokenize(source);
  const targetTokens = tokenize(target);
  const sourceLength = sourceTokens.length;
  const targetLength = targetTokens.length;

  // Step 2: Initialize the DP table
  const dpTable = Array.from({ length: sourceLength + 1 }, () =>
    Array(targetLength + 1).fill(0)
  );

  // Step 2.1: Fill the DP table with initial values
  for (let rowIndex = 0; rowIndex <= sourceLength; rowIndex++) {
    for (let colIndex = 0; colIndex <= targetLength; colIndex++) {
      if (rowIndex === 0) {
        dpTable[rowIndex][colIndex] = colIndex;
      } else if (colIndex === 0) {
        dpTable[rowIndex][colIndex] = rowIndex;
      } else if (sourceTokens[rowIndex - 1] === targetTokens[colIndex - 1]) {
        dpTable[rowIndex][colIndex] = dpTable[rowIndex - 1][colIndex - 1];
      } else {
        dpTable[rowIndex][colIndex] =
          1 +
          Math.min(
            dpTable[rowIndex - 1][colIndex], // Deletion
            dpTable[rowIndex][colIndex - 1], // Insertion
            dpTable[rowIndex - 1][colIndex - 1] // Modification
          );
      }
    }
  }

  // Step 3: Trace back to find the edit operations
  let rowIndex = sourceLength,
    colIndex = targetLength;
  const edits: CompareSentenceOperation[] = [];
  while (rowIndex > 0 && colIndex > 0) {
    if (sourceTokens[rowIndex - 1] === targetTokens[colIndex - 1]) {
      rowIndex--;
      colIndex--;
    } else if (
      dpTable[rowIndex][colIndex] ===
      dpTable[rowIndex - 1][colIndex - 1] + 1
    ) {
      edits.push({
        type: "modify",
        index: rowIndex - 1,
        fromWord: sourceTokens[rowIndex - 1],
        toWord: targetTokens[colIndex - 1],
      });
      rowIndex--;
      colIndex--;
    } else if (
      dpTable[rowIndex][colIndex] ===
      dpTable[rowIndex - 1][colIndex] + 1
    ) {
      edits.push({
        type: "delete",
        index: rowIndex - 1,
        fromWord: sourceTokens[rowIndex - 1],
        toWord: "",
      });
      rowIndex--;
    } else if (
      dpTable[rowIndex][colIndex] ===
      dpTable[rowIndex][colIndex - 1] + 1
    ) {
      edits.push({
        type: "insert",
        index: rowIndex,
        toWord: targetTokens[colIndex - 1],
        fromWord: "",
      });
      colIndex--;
    }
  }

  // Step 4: Handle any remaining tokens
  while (rowIndex > 0) {
    edits.push({
      type: "delete",
      index: rowIndex - 1,
      fromWord: sourceTokens[rowIndex - 1],
      toWord: "",
    });
    rowIndex--;
  }

  while (colIndex > 0) {
    edits.push({
      type: "insert",
      index: 0,
      toWord: targetTokens[colIndex - 1],
      fromWord: "",
    });
    colIndex--;
  }

  return edits.reverse();
}

/**
 *  Convert the compared sentences to the changed operations.
 * @param inputSource
 * @param inputOperations
 * @returns
 */
export const convertComparedSentences = (
  inputSource: string,
  inputOperations: CompareSentenceOperation[]
): ChangedOperation[] => {
  // 1. Input handling
  // 2. Processing Logic
  // 2.1 Create the index map token.
  const tokens = tokenize(inputSource);
  const indexMapToken = new Map<
    number,
    { start: number; end: number; token: string }
  >();
  let start = 0;
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    indexMapToken.set(index, {
      start,
      end: start + token.length,
      token: token,
    });
    start += token.length;
  }

  // 2.2 Convert the word index to char index.
  const result: ChangedOperation[] = [];
  for (let index = 0; index < inputOperations.length; index++) {
    // 2.2.1 Create a new converted item.
    const edit = inputOperations[index];
    const { start, end } = indexMapToken.get(edit.index)!;
    let convertedItem: ChangedOperation = {
      type: edit.type,
      fromWord: edit.fromWord,
      toWord: edit.toWord,
      chartIndex: start,
      toChartIndex: edit.type === "insert" ? start : end,
    };

    // 2.2.2 If the previouse item is exist and is nearby the current item with the condition that the toChartIndex of the previous item is equal to the chartIndex of the current item. and then merge the two items.
    const previousItem = result[result.length - 1];
    if (previousItem?.toChartIndex === convertedItem.chartIndex) {
      // 2.2.3 Remove the previous item in the result.
      result.pop();
      // 2.2.4 If the type is the same, merge the two items.
      const isSameType = previousItem.type === convertedItem.type;
      const editType = isSameType ? previousItem.type : "modify";
      convertedItem = {
        ...previousItem,
        type: editType,
        toWord: previousItem.toWord + convertedItem.toWord,
        fromWord: previousItem.fromWord + convertedItem.fromWord,
        toChartIndex: convertedItem.toChartIndex,
      };
    }

    // 2.3 Push the converted item to the result.
    result.push(convertedItem);
  }

  // 3. Return the result
  return result;
};

export function tokenize(sentence: string): string[] {
  return sentence.match(/[ ]+|[^ |\n]+|[\n]+/gm) || [];
}
