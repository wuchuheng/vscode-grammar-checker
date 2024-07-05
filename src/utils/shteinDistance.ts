type EditType = "insert" | "delete" | "modify";

export interface EditOperation {
  type: EditType;
  chartIndex: number;
  toChartIndex: number;
  targetCharIndex: number;
  targetCharToIndex: number;
  fromWord: string;
  toWord: string;
}

export function tokenize(sentence: string): string[] {
  return sentence.match(/[ ]+|[^ |\n]+|[\n]+/gm) || [];
}
