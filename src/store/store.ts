import * as vscode from "vscode";
import { EditOperation } from "../utils/shteinDistance";
import { Comment } from "../utils/typescriptUtil";

export type HoverInformation = {
  edition: EditOperation;
  comment: Comment;
  range: vscode.Range;
};
type LineMapHoverInformations = Map<number, HoverInformation[]>;

/**
 * Store the hoverInfomation for each file.
 */
const fileNameMapLineDiagnatic: Map<string, LineMapHoverInformations> =
  new Map();

/**
 * Set the list of edition for a specific file.
 *
 * @param fileName
 * @param value
 */
export const setEditions = (
  fileName: string,
  values: HoverInformation[]
): void => {
  // 1. Handling input.
  // 2. Processing logic.
  // 2.1 If the key is not exist in the map, create a new map.
  if (!fileNameMapLineDiagnatic.has(fileName)) {
    fileNameMapLineDiagnatic.set(fileName, new Map());
  }
  // 2.2 Inser the item to the map.
  const lineMapHoverInformations = fileNameMapLineDiagnatic.get(fileName)!;
  for (const value of values) {
    const line = value.range.start.line;
    // 2.2.1 If the key is not exist in the map, create a new array.
    if (!lineMapHoverInformations.has(line)) {
      lineMapHoverInformations.set(line, []);
    }
    // 2.2.2 Insert the item to the array.
    const hoverInformations = lineMapHoverInformations.get(line)!;
    hoverInformations.push(value);
  }
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
): HoverInformation => {
  // 1. Handling input.

  // 1.1 Check if the file is exist in the store.
  if (!fileNameMapLineDiagnatic.has(fileName)) {
    throw new Error(`File ${fileName} does not have any hoverInfomation.`);
  }

  // 1.2 Check if the position is exist in the store.
  if (!fileNameMapLineDiagnatic.has(fileName)) {
    throw new Error(`File ${fileName} does not have any hoverInfomation.`);
  }

  // 2. Processing logic.
  // 2.1 Get the lineMapHoverInformations.
  const lineMapHoverInformations = fileNameMapLineDiagnatic.get(fileName)!;

  // 2.2 Get the list of hoverInfomation for the specific line.
  const line = inputPosition.line;
  const hoverInformations = lineMapHoverInformations.get(line)!;

  // 2.3 Find the hoverInfomation that has the range that contains the position. and the closest to the position.
  let result: HoverInformation | undefined = undefined;
  for (const hoverInformation of hoverInformations) {
    if (hoverInformation.range.contains(inputPosition)) {
      result = hoverInformation;
      break;
    }
  }

  // 2.3.1 If the result is not found, throw an error.
  if (!result) {
    throw new Error(
      `File ${fileName} does not have any hoverInfomation at position ${inputPosition}.`
    );
  }

  // 3. Return result.
  return result!;
};
