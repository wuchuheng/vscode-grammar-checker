type EditType = "insert" | "delete" | "modify";

export interface EditOperation {
  type: EditType;
  sourceCharIndex: number;
  sourceCharToIndex: number;
  targetCharIndex: number;
  targetCharToIndex: number;
  fromWord: string;
  toWord: string;
}

export function tokenize(sentence: string): string[] {
  return sentence.match(/[ ]+|[^ |\n]+|[\n]+/gm) || [];
}

export function calculateLevenshteinDistance(
  sourceTokens: string[],
  targetTokens: string[]
): EditOperation[] {
  const rows = sourceTokens.length + 1;
  const cols = targetTokens.length + 1;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));
  const operation = Array.from({ length: rows }, () => Array(cols).fill(null));

  // Initialize the first row and column
  for (let i = 0; i < rows; i++) {
    dp[i][0] = i;
    operation[i][0] = "delete";
  }
  for (let j = 0; j < cols; j++) {
    dp[0][j] = j;
    operation[0][j] = "insert";
  }
  operation[0][0] = null;

  // Fill the dp table
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      if (sourceTokens[i - 1] === targetTokens[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
        operation[i][j] = null;
      } else {
        const costs = [
          dp[i - 1][j] + 1, // delete
          dp[i][j - 1] + 1, // insert
          dp[i - 1][j - 1] + 1, // modify
        ];
        dp[i][j] = Math.min(...costs);
        if (dp[i][j] === costs[0]) {
          operation[i][j] = "delete";
        } else if (dp[i][j] === costs[1]) {
          operation[i][j] = "insert";
        } else {
          operation[i][j] = "modify";
        }
      }
    }
  }

  // Trace back to find the path of minimum edits
  let i = rows - 1,
    j = cols - 1;
  const edits: EditOperation[] = [];
  while (i > 0 || j > 0) {
    if (operation[i][j] === "delete") {
      const newItem: EditOperation = {
        type: "delete",
        sourceCharIndex: i - 1,
        sourceCharToIndex: i,
        targetCharIndex: j,
        targetCharToIndex: j,
        fromWord: sourceTokens[i - 1],
        toWord: "",
      };
      pushDeleteItemToEdits(edits, newItem);
      i--;
    } else if (operation[i][j] === "insert") {
      const newInsertedItem: EditOperation = {
        type: "insert",
        sourceCharIndex: i,
        sourceCharToIndex: i,
        targetCharIndex: j - 1,
        targetCharToIndex: j,
        fromWord: "",
        toWord: targetTokens[j - 1],
      };
      pushInsertItemToEdits(edits, newInsertedItem);

      j--;
    } else if (operation[i][j] === "modify") {
      const newItem: EditOperation = {
        type: "modify",
        sourceCharIndex: i - 1,
        sourceCharToIndex: i,
        targetCharIndex: j - 1,
        targetCharToIndex: j,
        fromWord: sourceTokens[i - 1],
        toWord: targetTokens[j - 1],
      };
      edits.push(newItem);
      // pushInsertItemToEdits(edits, newItem);
      i--;
      j--;
    } else {
      // No operation means no change
      i--;
      j--;
    }
  }

  return edits.reverse();
}

/**
 *  Push the new item for insert operation to the edits array
 *
 * @param inputEdits
 * @param newItem
 * @returns
 */
const pushInsertItemToEdits = (
  inputEdits: EditOperation[],
  newItem: EditOperation
): EditOperation[] => {
  // If the previous operation is also an insert operation, and the index to insert is the same, then merge the two insert operations
  const previousOperation = inputEdits[inputEdits.length - 1] || null;
  if (
    previousOperation?.sourceCharIndex === newItem.sourceCharIndex &&
    previousOperation?.sourceCharToIndex === newItem.sourceCharToIndex
  ) {
    const previousInsertOperation: EditOperation = inputEdits.pop()!;
    const changedItem: EditOperation = {
      ...previousInsertOperation,
      targetCharToIndex: previousInsertOperation.targetCharToIndex,
      targetCharIndex: newItem.targetCharIndex,
      toWord: newItem.toWord + previousInsertOperation.toWord,
    };
    inputEdits.push(changedItem);
  } else {
    inputEdits.push(newItem);
  }

  return inputEdits;
};

const pushDeleteItemToEdits = (
  inputEdits: EditOperation[],
  newItem: EditOperation
): EditOperation[] => {
  const previousOperation = inputEdits[inputEdits.length - 1] || null;
  if (previousOperation?.sourceCharIndex === newItem.sourceCharToIndex) {
    const previousDeleteOperation: EditOperation = inputEdits.pop()!;
    const changedItem: EditOperation = {
      ...previousDeleteOperation,
      sourceCharIndex: newItem.sourceCharIndex,
      fromWord: newItem.fromWord + previousDeleteOperation.fromWord,
    };
    inputEdits.push(changedItem);
  } else {
    inputEdits.push(newItem);
  }

  return inputEdits;
};

// 2.1 Crate the index of the words map the length of the words.
export type IndexMapToken = Map<
  number,
  { start: number; end: number; length: number }
>;

/**
 * Transform the word index to char index
 *
 * @param source
 * @param target
 * @param inputEdits
 */
export const convertWordIndexToCharIndex = (
  source: string,
  target: string,
  inputEdits: EditOperation[]
): EditOperation[] => {
  // 2. Processing Logic
  // 2.1 Crate the index of the words map the length of the words.
  const sourceIndexMapToken = indexMapToken(source);
  const targetIndexMapToken = indexMapToken(target);

  // 2.2 Convert the word index to char index.
  const result: EditOperation[] = [];
  for (let index = 0; index < inputEdits.length; index++) {
    const edit = inputEdits[index];
    // 2.2.1 Convert the source index to char index
    const sourceIndexInfo = getChartIndexRange(
      sourceIndexMapToken,
      edit.sourceCharIndex,
      edit.sourceCharToIndex
    );

    // 2.2.2 Convert the target index to char index
    const targetIndexInfo = getChartIndexRange(
      targetIndexMapToken,
      edit.targetCharIndex,
      edit.targetCharToIndex
    );

    // 2.2.3 Create the new edit operation
    const newEdit: EditOperation = {
      ...edit,
      targetCharIndex: targetIndexInfo.start,
      targetCharToIndex: targetIndexInfo.end,
      sourceCharIndex: sourceIndexInfo.start,
      sourceCharToIndex: sourceIndexInfo.end,
    };
    result.push(newEdit);
  }

  // 3. Return the result.
  return result;
};

/**
 * Calculate the Levenshtein distance between two sentences
 *
 * @param sourceSentence
 * @param targetSentence
 * @returns
 */
export function wordLevenshteinDistance(
  sourceSentence: string,
  targetSentence: string
): EditOperation[] {
  // 2. Processing Logic
  // 2.1 Tokenize the input sentences
  const sourceTokens = tokenize(sourceSentence);
  const targetTokens = tokenize(targetSentence);
  // 2.2 Calculate the Levenshtein distance
  let edits = calculateLevenshteinDistance(sourceTokens, targetTokens);

  // 2.3 Convert the word index to char ut.index
  edits = convertWordIndexToCharIndex(sourceSentence, targetSentence, edits);

  return edits;
}

type ChartIndexRange = {
  start: number;
  end: number;
};

/**
 * Get the range of the chart index from the word index.
 *
 */
export const getChartIndexRange = (
  indexMapToken: IndexMapToken,
  wordIndex: number,
  wordToIndex: number
): ChartIndexRange => {
  // 1. Handling input.

  // 2.1 If the charToIndex and charIndex are the same, and the index is not in the map, and the index is just the end of the sentence, then return the range of end of the sentence.
  const isSameIndex = wordIndex === wordToIndex;
  const isEndOfSentence = !indexMapToken.has(wordToIndex);
  const isLastIndex = wordToIndex === indexMapToken.size;
  if (isSameIndex && isEndOfSentence && isLastIndex) {
    // 2.1.1 Get the last token
    const last = indexMapToken.size - 1;
    const lastToken = indexMapToken.get(last)!;
    // 2.1.1 Return the range of the last token with the same index of the `last` index.
    return { start: lastToken.end, end: lastToken.end };
  }

  // 2.2 Convert the source index to char index
  // 2.2.1 Convert the start of position to char index
  const token = indexMapToken.get(wordIndex)!;
  const start = token.start;

  // 2.2.2 Convert the end of position to char index
  let end: number;
  const isEndLastWord = wordToIndex === indexMapToken.size;
  if (isEndLastWord) {
    const lastToken = indexMapToken.get(indexMapToken.size - 1)!;
    end = lastToken.end;
  } else {
    end = indexMapToken.get(wordToIndex)!.start;
  }

  return { start, end };
};

/**
 * Get the index map of the tokens
 * @param source
 * @returns
 */
export const indexMapToken = (source: string): IndexMapToken => {
  const tokens = tokenize(source);
  const indexMapToken: IndexMapToken = new Map();
  tokens.reduce((acc, token, index) => {
    const end = acc + token.length;
    indexMapToken.set(index, {
      start: acc,
      end: end,
      length: token.length,
    });
    return end;
  }, 0);

  return indexMapToken;
};
