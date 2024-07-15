import * as vscode from "vscode";
import { Comment } from "./typescriptAdapter/typescriptUtil";
export type CommentType = "single" | "track";
export type RequestData = {
  prompt: string;
  commentType: CommentType;
  data: string[];
};

/**
 * The adapter will be responsible for extracting comments from the source code and also for the middleware that will be executed before the request is made.
 * So, the adapter will be invoked by the extension to extract comments based on the language ID when the user triggers the command.
 */
export default interface LanguageAdapterInterface {
  /**
   * The ID of the language that the adapter supports.
   *
   * This configuration will determine which adapter will be used to extract comments from the source code.
   * @example:
   * - python
   * - javascript
   * - typescript
   */
  supportedLanguageId: string[];

  /**
   * Extracts comments from the source code.
   *
   * This method will be invoked and used to extract comments from the source code.
   * @param sourceCode
   * @param document
   * @returns
   */
  extractComments(document: vscode.TextDocument): Comment[];

  /**
   * The middleware to be executed before the request is made.
   *
   * The request will be executed like this:
   * VS Code command -> beforeRequest -> AI model -> VS Code command
   * If there are something to be done before the request is made, the logic should be implemented here.
   * @param requestArgs
   * @param next
   * @returns
   */
  middlewareHandle(args: {
    requestArgs: RequestData;
    next: (args: RequestData) => Promise<string[]>;
  }): Promise<string[]>;
}
