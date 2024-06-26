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
  return sentence.match(/[ ]+|[^ ]+/g) || [];
}

function wordLevenshteinDistance(
  sourceSentence: string,
  targetSentence: string
): EditOperation[] {
  const sourceTokens = tokenize(sourceSentence);
  const targetTokens = tokenize(targetSentence);

  const operations: EditOperation[] = [];
  let sourceIndex = 0;
  let targetIndex = 0;

  while (
    sourceIndex < sourceTokens.length &&
    targetIndex < targetTokens.length
  ) {
    if (sourceTokens[sourceIndex] !== targetTokens[targetIndex]) {
      operations.push({
        type: "modify",
        sourceCharIndex: sourceIndex,
        sourceCharToIndex: sourceIndex + 1,
        targetCharIndex: targetIndex,
        targetCharToIndex: targetIndex + 1,
        fromWord: sourceTokens[sourceIndex],
        toWord: targetTokens[targetIndex],
      });
    }
    sourceIndex++;
    targetIndex++;
  }

  // Handle remaining tokens in the source as deletions
  while (sourceIndex < sourceTokens.length) {
    operations.push({
      type: "delete",
      sourceCharIndex: sourceIndex,
      sourceCharToIndex: sourceIndex + 1,
      targetCharIndex: targetIndex,
      targetCharToIndex: targetIndex,
      fromWord: sourceTokens[sourceIndex],
      toWord: "",
    });
    sourceIndex++;
  }

  // Handle remaining tokens in the target as insertions
  while (targetIndex < targetTokens.length) {
    operations.push({
      type: "insert",
      sourceCharIndex: sourceIndex,
      sourceCharToIndex: sourceIndex,
      targetCharIndex: targetIndex,
      targetCharToIndex: targetIndex + 1,
      fromWord: "",
      toWord: targetTokens[targetIndex],
    });
    targetIndex++;
  }

  return operations;
}
