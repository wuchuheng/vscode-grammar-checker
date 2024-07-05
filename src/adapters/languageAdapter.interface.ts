import * as vscode from "vscode";
import { Comment } from "./typescriptAdapter/typescriptUtil";
export type CommentType = "single" | "track";
export type RequestArgs = {
  prompt: string;
  commentType: CommentType;
  data: string;
};

/**
 * The addapter will be responsible for extracting comments from the source code and also for the middleware that will be executed before the request is made.
 * So, the adapter will be invoked by the extension to extract comments based on the language id when the user triggers the command.
 */
export default interface LanguageAdapterInterface {
  /**
   * The language id of the language that the adapter supports.
   *
   * This configuration will be used to determine the adapter witch will be used to extract comments from the source code.
   * @example:
   * - python
   * - javascript
   * - typescript
   */
  supertedLanguageId: string[];

  /**
   * Extracts comments from the source code.
   *
   * This method will be invoked and used to how to extract comments from the source code.
   * @param sourceCode
   * @param document
   * @returns
   */
  extractComments(document: vscode.TextDocument): Comment[];

  /**
   * The middleware to be executed before the request is made.
   *
   * The request will be executed like this:
   * Vs code command -> beforeRequest -> AI model -> vscode command
   * If there are something to be done before the request is made, the logic should be implemented here.
   * @param requestArgs
   * @param next
   * @returns
   */
  beforeRequest(
    requestArgs: RequestArgs,
    next: (args: RequestArgs) => Promise<string>
  ): Promise<string>;
}
