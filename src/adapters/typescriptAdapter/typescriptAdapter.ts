import * as vscode from "vscode";
import LanguageAdapterInterface, {
  RequestData,
} from "../languageAdapter.interface";
import { Comment, extractComments } from "./typescriptUtil";

export default class TypescriptAdapter implements LanguageAdapterInterface {
  supertedLanguageId: string[] = [
    "typescript",
    "javascript",
    "javascriptreact",
    "typescriptreact",
  ];

  extractComments(document: vscode.TextDocument): Comment[] {
    // 1. Handling input.
    // 2. Processing logic.
    const editor = vscode.window.activeTextEditor;
    const sourceText = document.getText();
    const result = extractComments(sourceText, editor!.document);

    // 3. Return the result.
    return result;
  }

  middlewareHandle({
    requestArgs,
    next,
  }: {
    requestArgs: RequestData;
    next: (args: RequestData) => Promise<string>;
  }): Promise<string> {
    return next(requestArgs);
  }
}
