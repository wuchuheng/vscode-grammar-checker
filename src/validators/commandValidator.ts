import * as vscode from "vscode";
import { supportedLanguages } from "../config/config";

export const commandValidator = (): boolean => {
  // 1. Handling input.
  // 2. Processing logic.
  const editor = vscode.window.activeTextEditor;
  if (editor === null) {
    // 3.1 If the editor is null, return false.
    return false;
  }
  // 1.2 If the file is not supported, return false.
  if (!supportedLanguages.includes(editor!.document.languageId)) {
    // 3.2 If the file is not supported, return false.
    return false;
  }

  // 3. Return the result.
  return true;
};
