import * as vscode from "vscode";
import { EditOperation } from "../utils/shteinDistance";
import { Comment } from "../utils/typescriptUtil";
import {
  decodeDiagnosticCode,
  generateDiagnosticCode,
} from "../utils/diagnasticUtil";
import { diagnosticCollection } from "../diagnosticCollection/diagnosticCollection";
import { log } from "console";

export type HoverInformation = {
  edition: EditOperation;
  comment: Comment;
  diagnostic: vscode.Diagnostic;
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
    const range = value.diagnostic.range;
    const line = range.start.line;
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
): HoverInformation | undefined => {
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
    const { range } = hoverInformation.diagnostic;
    if (range.contains(inputPosition)) {
      result = hoverInformation;
      break;
    }
  }

  // 3. Return result.
  return result;
};

let timer: NodeJS.Timeout;

/**
 * Remove the edition for a specific file and code.
 * @param code
 */
export const removeEdition = (fileName: string, code: string): void => {
  // 1. Handling input.
  // 1.1 Check if the key is exist in the map.
  if (!fileNameMapLineDiagnatic.has(fileName)) {
    throw new Error(`File ${fileName} does not have any hoverInfomation.`);
  }

  // 1.2 Check the edition is exist in the map.
  const lineMapHoverInformations = fileNameMapLineDiagnatic.get(fileName)!;
  const range = decodeDiagnosticCode(code);
  // 1.2.1 Check if the key is exist in the map.
  if (!lineMapHoverInformations.has(range.start.line)) {
    throw new Error(`The range ${code} does not exist in the hoverInfomation.`);
  }
  // 1.2.2 Check if the edition is exist in the array.
  const lineHoverInformations = lineMapHoverInformations.get(range.start.line)!;
  let isExited: boolean = false;
  for (const hoverInformation of lineHoverInformations) {
    if (hoverInformation.diagnostic.code === code) {
      isExited = true;
      break;
    }
  }
  if (!isExited) {
    throw new Error(`The range ${code} does not exist in the hoverInfomation.`);
  }

  // 2. Processing logic.
  // 2.1 Update the hoverInfomation.
  // 2.1.1 Remove the item from the array.
  let removedItem: HoverInformation;
  let removedItemIndex: number = -1;

  let newLineValues = lineHoverInformations.filter((item, i) => {
    if (item.diagnostic.code === code) {
      removedItem = item;
      removedItemIndex = i;
      return false;
    }
    return true;
  });
  // 2.1.2  Update the character of the range for the behind items after the removed item.
  const { toWord, fromWord } = removedItem!.edition;
  if (toWord.length !== fromWord.length) {
    const changedChartCount = toWord.length - fromWord.length;
    // 2.1.2.1 Update the character of the range for the behind items after the removed item.
    newLineValues = newLineValues.map((item, index) => {
      if (index >= removedItemIndex) {
        const { range } = item.diagnostic;
        const startChart = range.start.character + changedChartCount;
        const endChart = range.end.character + changedChartCount;
        log(`Changed count: ${changedChartCount}`);

        const startPosition = new vscode.Position(range.start.line, startChart);
        const endPoistion = new vscode.Position(range.end.line, endChart);
        const newRange = new vscode.Range(startPosition, endPoistion);
        item.diagnostic.range = newRange;

        // 2.1.2.2 Update the code of the diagnostic.
        const newCode = generateDiagnosticCode(newRange);
        item.diagnostic.code = newCode;
      }
      return item;
    });
  }

  // 2.1.3 Update the array in the map.
  lineMapHoverInformations.set(range.start.line, newLineValues);
  fileNameMapLineDiagnatic.set(fileName, lineMapHoverInformations);

  // 2.2 Update the diagnosticCollection.
  // 2.2.1 Get uri by filename
  const uri = vscode.Uri.file(fileName);
  diagnosticCollection.delete(uri);
  // // 2.2.2 Create new diagnostics.
  const newDiagnostics: vscode.Diagnostic[] = [];
  lineMapHoverInformations.forEach((hoverInformations) => {
    hoverInformations.forEach((hoverInformation) => {
      newDiagnostics.push(hoverInformation.diagnostic);
    });
  });
  // 2.2.3 Update the diagnosticCollection.

  timer = setTimeout(() => {
    diagnosticCollection.set(uri, newDiagnostics);
  }, 500);

  // 3. Return result.
};
