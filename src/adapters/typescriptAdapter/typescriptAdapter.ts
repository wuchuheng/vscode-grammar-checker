import * as vscode from "vscode";
import LanguageAdapterInterface, {
  RequestData,
} from "../languageAdapter.interface";
import {
  Comment,
  extractComments,
  formatSingleLineComment,
  formatTrackComment,
} from "./typescriptUtil";

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

  async middlewareHandle({
    requestArgs,
    next,
  }: {
    requestArgs: RequestData;
    next: (args: RequestData) => Promise<string>;
  }): Promise<string> {
    // 1. Handing input.
    // 2. Processing logic.
    let result = await next(requestArgs);

    // 2.1 Format the track comment.
    result = formatTrackComment(result);

    // 2.2 Format the single line comment.
    result = formatSingleLineComment(result);

    // 3. Return the result.
    return result;
  }
}
