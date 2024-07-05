import * as vscode from "vscode";
import { Comment } from "../adapters/typescriptAdapter/typescriptUtil";
import { ChangedOperation } from "../utils/compareSentenceUtil";

export type HoverInformation = {
  edition: ChangedOperation;
  comment: Comment;
  diagnostic: vscode.Diagnostic;
};

/**
 * This class will be hold the hover information for each file. and the information will be used to show the hover information when the user hover the position within the range of the diagnostic.
 * Why we need this class? Because the hovered position within the range of the diagnostic is not binded to the esential information to show the hover information, so we need to bind the essential information to the diagnostic.and then the diagnostic will be used to show the hover information when the user hover the position within the range of the diagnostic.
 * In other words, I want to show the freidnly information when the user hover the position within the range of the diagnostic. But there is not enough information to show the friendly information. So I need to bind the friendly information to the diagnostic.
 * So, this class just be used to do the binding.
 */
export class DiagnasticStore {
  private static _fileMapDiagnaticMap: Map<
    string,
    Map<number, HoverInformation>
  > = new Map();

  private static _findOrCreateFileMap(
    fileName: string
  ): Map<number, HoverInformation> {
    // 1. Handling input.
    // 2. Processing logic.
    // 2.1 If the key is not exist in the map, and then create it.
    if (!this._fileMapDiagnaticMap.has(fileName)) {
      this._fileMapDiagnaticMap.set(fileName, new Map());
    }

    // 2.2 Get the item from the map.
    const result = this._fileMapDiagnaticMap.get(fileName)!;

    // 3. Return result.
    return result;
  }

  /**
   *  Set the hoverInfomation for a specific file.
   * @param inputValue
   */
  static set(inputValue: {
    fileName: string;
    id: number;
    value: HoverInformation;
  }): void {
    // 1. Handling input.

    // 2. Processing logic.
    // 2.1 Find or create the map for the file.
    const fileDiagnosticMap = this._findOrCreateFileMap(inputValue.fileName);

    // 2.2 Set the item to the map.
    fileDiagnosticMap.set(inputValue.id, inputValue.value);

    // 2.3 Update the map.
    this._fileMapDiagnaticMap.set(inputValue.fileName, fileDiagnosticMap);

    // 3. Return result.
  }

  /**
   *  Set the list of hoverInfomation for a specific file.
   * @param inputValues
   */
  static setMany(inputValues: {
    fileName: string;
    values: {
      id: number;
      value: HoverInformation;
    }[];
  }): void {
    // 1. Handling input.
    // 2. Processing logic.
    // 2.1 Find or create the map for the file.
    const fileDiagnosticMap = this._findOrCreateFileMap(inputValues.fileName);

    // 2.2 Set the item to the map.
    for (const inputValue of inputValues.values) {
      fileDiagnosticMap.set(inputValue.id, inputValue.value);
    }

    // 2.3 Update the map.
    this._fileMapDiagnaticMap.set(inputValues.fileName, fileDiagnosticMap);

    // 3. Return result.
  }

  /**
   *  Get the hoverInfomation for a specific file and position.
   * @param data
   */
  static get(value: { fileName: string; id: number }): HoverInformation {
    // 1. Handling input.
    // 1.1 Check if the key `fileName` is exist in the map.
    if (!this._fileMapDiagnaticMap.has(value.fileName)) {
      throw new Error(
        `File ${value.fileName} does not have any hoverInfomation.`
      );
    }

    // 1.2 Check if the key `id` is exist in the map.
    const fileDiagnosticMap = this._fileMapDiagnaticMap.get(value.fileName)!;
    if (!fileDiagnosticMap.has(value.id)) {
      throw new Error(
        `The id ${value.id} does not exist in the hoverInfomation.`
      );
    }

    // 2. Processing logic.
    const result = fileDiagnosticMap.get(value.id)!;

    // 3. Return result.
    return result;
  }

  /**
   * Remove the hoverInfomation for a specific file and code.
   */
  static clear(fileName: string): void {
    // 1. Handling input.
    // 1.1 If the key is not existed in the map, and then return.
    if (!this._fileMapDiagnaticMap.has(fileName)) {
      return;
    }

    // 2. Processing logic.
    // 2.1 Remove the item from the map.
    this._fileMapDiagnaticMap.delete(fileName);

    // 3. Return result.
  }

  /**
   *  Remove the hoverInfomation for a specific file and code.
   * @param inputValue
   */
  static delete(inputValue: { fileName: string; id: number }): void {
    // 1. Handling input.
    // 1.1 Check if the key `fileName` is exist in the map.
    if (!this._fileMapDiagnaticMap.has(inputValue.fileName)) {
      throw new Error(
        `File ${inputValue.fileName} does not have any hoverInfomation.`
      );
    }
    // 1.2 Check if the key `id` is exist in the map.
    const fileDiagnosticMap = this._fileMapDiagnaticMap.get(
      inputValue.fileName
    )!;
    if (!fileDiagnosticMap.has(inputValue.id)) {
      throw new Error(
        `The id ${inputValue.id} does not exist in the hoverInfomation.`
      );
    }

    // 2. Processing logic.
    // 2.1 Remove the item from the map.
    fileDiagnosticMap.delete(inputValue.id);

    // 2.2 Update the map.
    this._fileMapDiagnaticMap.set(inputValue.fileName, fileDiagnosticMap);

    // 3. Return result.
  }
}
