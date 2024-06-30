import * as vscode from "vscode";
import * as fs from "fs";
import { EditOperation } from "../utils/shteinDistance";
import { Comment } from "../utils/typescriptUtil";

type HoverInformation = {
  edition: EditOperation;
  comment: Comment;
  range: vscode.Range;
};

/**
 * Store the hoverInfomation for each file.
 */
const fileNameMapHoverInfomation: Map<
  string,
  Map<string, HoverInformation>
> = new Map();

const translatePositionToKey = (position: vscode.Position): string =>
  `${position.line}:${position.character}`;

/**
 * Set a new edition to the store.
 *
 * @param fileName
 * @param position
 * @param value
 */
export const setEdition = (
  fileName: string,
  position: vscode.Position,
  value: HoverInformation
): void => {
  // 1. Handling input.

  // 2. Processing logic.
  // 2.1 If the file does not have any hoverInfomation, create a new map.
  if (!fileNameMapHoverInfomation.has(fileName)) {
    fileNameMapHoverInfomation.set(fileName, new Map());
  }

  // 2.2 Set the new edition to the store.
  fileNameMapHoverInfomation
    .get(fileName)!
    .set(translatePositionToKey(position), value);

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
  position: vscode.Position
): HoverInformation => {
  // 1. Handling input.

  // 1.1 Check if the file is exist in the store.
  if (!fileNameMapHoverInfomation.has(fileName)) {
    throw new Error(`File ${fileName} does not have any hoverInfomation.`);
  }

  // 1.2 Check if the position is exist in the store.
  const key = translatePositionToKey(position);
  if (!fileNameMapHoverInfomation.get(fileName)!.has(key)) {
    throw new Error(`Position ${key} does not have any hoverInfomation.`);
  }

  // 2. Processing logic.
  const result = fileNameMapHoverInfomation.get(fileName)!.get(key)!;

  // 3. Return result.
  return result;
};
