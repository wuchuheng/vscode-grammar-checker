type EditType = "insert" | "delete" | "modify";

interface EditOperation {
  type: EditType;
  sourceCharIndex: number;
  sourceCharToIndex: number;
  targetCharIndex: number;
  targetCharToIndex: number;
  fromWord: string;
  toWord: string;
}

function tokenize(sentence: string): string[] {
  return sentence.match(/[ ]+|[^ ]+/gm) || [];
}

function calculateLevenshteinDistance(
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

const convertWordIndexToCharIndex = (
  source: string,
  target: string,
  inputEdits: EditOperation[]
): void => {
  // 2. Processing Logic
  // 2.1 Crate the index of the words map the length of the words.
  const tokens = tokenize(source);
  const sourceIndexMapTokenLength: Map<number, number> = new Map();
  tokens.reduce((acc, token, index) => {
    sourceIndexMapTokenLength.set(index, acc);
    return acc + token.length;
  }, 0);

  const targetTokens = tokenize(target);
  const targetIndexMapTokenLength: Map<number, number> = new Map();
  targetTokens.reduce((acc, token, index) => {
    targetIndexMapTokenLength.set(index, acc);
    return acc + token.length;
  }, 0);

  // 2.2 Convert the word index to char index.
  for (const edit of inputEdits) {
    edit.sourceCharIndex = sourceIndexMapTokenLength.get(edit.sourceCharIndex)!;
    edit.sourceCharToIndex = sourceIndexMapTokenLength.get(
      edit.sourceCharToIndex
    )!;
    edit.targetCharIndex = targetIndexMapTokenLength.get(edit.targetCharIndex)!;
    edit.targetCharToIndex = targetIndexMapTokenLength.get(
      edit.targetCharToIndex
    )!;
  }
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
  const edits = calculateLevenshteinDistance(sourceTokens, targetTokens);

  // 2.3 Convert the word index to char index
  convertWordIndexToCharIndex(sourceSentence, targetSentence, edits);

  return edits;
}