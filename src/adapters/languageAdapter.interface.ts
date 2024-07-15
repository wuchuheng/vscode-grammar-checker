import * as vscode from "vscode";
import { Comment } from "../utils/diagnosticUtil";
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
   * Handles text document changes and updates comments for diagnostics.
   *
   * This method is triggered when there are changes in a text document. It is responsible for providing updated comments
   * that reflect the changes made to the document. These updated comments are then used to refresh diagnostics, ensuring
   * that any analysis or feedback provided to the user is based on the most current state of the document.
   *
   * The method works by first determining the type of change (insert, delete, replace) and then identifying which comments
   * are affected by this change. Once the affected comments are identified, it updates the diagnostics related to these
   * comments by invoking the appropriate command with the updated comments.
   *
   * @param event - The event object that contains information about the text document change. This includes the document
   *                itself and the range of text that has been changed.
   * @returns An array of updated `Comment` objects that reflect the changes made to the document. These comments are used
   *          to update diagnostics accordingly.
   */
  onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent): Comment[];

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
