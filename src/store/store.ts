import * as vscode from "vscode";
import { EditOperation } from "../utils/shteinDistance";
import { Comment } from "../utils/typescriptUtil";
import * as intervalTreeUtil from "../utils/intervalTreeUtil";

export type HoverInformation = {
  edition: EditOperation;
  comment: Comment;
  range: vscode.Range;
};

/**
 * Store the hoverInfomation for each file.
 */
const fileNameMapHoverInfomation: Map<string, intervalTreeUtil.IntervalTree> =
  new Map();

/**
 * Set the list of edition for a specific file.
 *
 * @param fileName
 * @param value
 */
export const setEdition = (
  fileName: string,
  value: HoverInformation[]
): void => {
  // 1. Handling input.

  // 2. Processing logic.
  // 2.1 Initialize the interval tree.
  const intervalTree = new intervalTreeUtil.IntervalTree();
  // 2.2 Insert all hoverInfomation to the interval tree from the middle to the end and then from the middle to the start.
  const midleLength = ((value.length % 2) + value.length) / 2;
  // 2.2.3 Insert from the middle to the end.
  for (let i = midleLength - 1; i < value.length; i++) {
    const item = value[i];
    intervalTree.insert(item);
  }
  // 2.2.4 Insert from the middle to the start.
  for (let i = midleLength - 2; i >= 0; i--) {
    const item = value[i];
    intervalTree.insert(item);
  }

  // 2.3 Store the interval tree to the map.
  fileNameMapHoverInfomation.set(fileName, intervalTree);

  // 3. Return result.
};

/**
 *  Get the edition for a specific file and position.
 *
 * @param fileName
 * @param position
 */
export const getEdition = (
  fileName: string,
  inputPosition: vscode.Position
): intervalTreeUtil.QueryResult => {
  // 1. Handling input.

  // 1.1 Check if the file is exist in the store.
  if (!fileNameMapHoverInfomation.has(fileName)) {
    throw new Error(`File ${fileName} does not have any hoverInfomation.`);
  }

  // 1.2 Check if the position is exist in the store.
  if (!fileNameMapHoverInfomation.has(fileName)) {
    throw new Error(`File ${fileName} does not have any hoverInfomation.`);
  }

  // 2. Processing logic.
  const intervalTree = fileNameMapHoverInfomation.get(fileName)!;
  const result = intervalTree.query(inputPosition);

  // 3. Return result.
  return result;
};
